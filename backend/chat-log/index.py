import json
import os
import re

import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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


def handler(event: dict, context) -> dict:
    """Сохраняет переписку посетителя с ИИ-консультантом, чтобы администратор видел её в панели заявок."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

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
    cur.execute(
        f"INSERT INTO {schema}.chat_sessions (session_id, messages, message_count, page) "
        f"VALUES ('{sid}', '{payload}', {user_count}, '{page}') "
        f"ON CONFLICT (session_id) DO UPDATE SET messages = EXCLUDED.messages, "
        f"message_count = EXCLUDED.message_count, updated_at = NOW()"
    )
    conn.commit()
    cur.close()
    conn.close()

    return respond(200, {'ok': True, 'saved': True})
