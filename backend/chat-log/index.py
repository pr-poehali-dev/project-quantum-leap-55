import json
import os
import re

import psycopg2

from auth_routes import auth_handler
from cabinet_routes import cabinet_handler

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

MAX_MESSAGES = 200
MAX_LEN = 4000


def respond(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False),
    }


def esc(value: str) -> str:
    return value.replace("'", "''")


def user_id_from_token(cur, schema: str, event: dict):
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token') or ''
    if not token or len(token) > 128:
        return None
    cur.execute(
        f"SELECT user_id FROM {schema}.user_sessions WHERE token = '{esc(token)}' AND expires_at > NOW() LIMIT 1"
    )
    row = cur.fetchone()
    return int(row[0]) if row else None


def handler(event: dict, context) -> dict:
    """Переписки с ИИ-консультантом, вход и регистрация клиентов (почта, Яндекс, Google) и личный кабинет."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    area = (event.get('queryStringParameters') or {}).get('area')
    if area == 'auth':
        return auth_handler(event)
    if area == 'cabinet':
        return cabinet_handler(event)

    if event.get('httpMethod') != 'POST':
        return respond(405, {'error': 'Метод не поддерживается'})

    try:
        data = json.loads(event.get('body') or '{}')
    except ValueError:
        return respond(400, {'error': 'Некорректный запрос'})

    session_id = str(data.get('session_id') or '')
    if not re.fullmatch(r'[A-Za-z0-9-]{8,64}', session_id):
        return respond(400, {'error': 'Некорректный идентификатор'})

    raw = data.get('messages')
    if not isinstance(raw, list):
        return respond(400, {'error': 'Нет сообщений'})

    messages = []
    for m in raw[-MAX_MESSAGES:]:
        if not isinstance(m, dict) or m.get('role') not in ('user', 'assistant'):
            continue
        content = str(m.get('content') or '')[:MAX_LEN]
        if content:
            messages.append({'role': m['role'], 'content': content})

    user_count = sum(1 for m in messages if m['role'] == 'user')
    if user_count == 0:
        return respond(200, {'ok': True, 'saved': False})

    page = esc(str(data.get('page') or '')[:500])
    payload = esc(json.dumps(messages, ensure_ascii=False))
    sid = esc(session_id)

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    user_id = user_id_from_token(cur, schema, event)
    uid_sql = str(user_id) if user_id else 'NULL'
    cur.execute(
        f"INSERT INTO {schema}.chat_sessions (session_id, messages, message_count, page, user_id) "
        f"VALUES ('{sid}', '{payload}', {user_count}, '{page}', {uid_sql}) "
        f"ON CONFLICT (session_id) DO UPDATE SET messages = EXCLUDED.messages, "
        f"message_count = EXCLUDED.message_count, updated_at = NOW(), "
        f"user_id = COALESCE(EXCLUDED.user_id, {schema}.chat_sessions.user_id)"
    )
    conn.commit()
    cur.close()
    conn.close()

    return respond(200, {'ok': True, 'saved': True})
# redeploy 1790243877
