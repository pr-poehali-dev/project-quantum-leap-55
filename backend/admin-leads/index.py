import hmac
import json
import os

import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    'Access-Control-Max-Age': '86400',
}


def respond(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def handler(event: dict, context) -> dict:
    """Список заявок и переписок с ИИ-консультантом (type=chats) для закрытой страницы администратора. Доступ только по паролю."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if event.get('httpMethod') != 'GET':
        return respond(405, {'error': 'Метод не поддерживается'})

    expected = os.environ.get('ADMIN_PASSWORD') or ''
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    given = headers.get('x-admin-password') or ''
    if not expected or not hmac.compare_digest(given.encode(), expected.encode()):
        return respond(401, {'error': 'Неверный пароль'})

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    params = event.get('queryStringParameters') or {}
    if params.get('type') == 'chats':
        cur.execute(
            f"SELECT id, messages, message_count, page, created_at, updated_at "
            f"FROM {schema}.chat_sessions WHERE session_id NOT LIKE 'test-%' ORDER BY updated_at DESC LIMIT 500"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        chats = []
        for r in rows:
            try:
                messages = json.loads(r[1] or '[]')
            except ValueError:
                messages = []
            chats.append({
                'id': r[0],
                'messages': messages,
                'message_count': r[2],
                'page': r[3] or '',
                'created_at': r[4].isoformat() + 'Z' if r[4] else None,
                'updated_at': r[5].isoformat() + 'Z' if r[5] else None,
            })
        return respond(200, {'chats': chats})

    cur.execute(
        f"SELECT id, name, phone, description, source, files, email_sent, created_at, region, links "
        f"FROM {schema}.leads ORDER BY created_at DESC LIMIT 1000"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    leads = []
    for r in rows:
        try:
            files = json.loads(r[5] or '[]')
        except ValueError:
            files = []
        try:
            links = json.loads(r[9] or '[]')
        except ValueError:
            links = []
        leads.append({
            'id': r[0],
            'name': r[1],
            'phone': r[2],
            'description': r[3] or '',
            'source': r[4],
            'files': files,
            'email_sent': r[6],
            'created_at': r[7].isoformat() + 'Z' if r[7] else None,
            'region': r[8] or '',
            'links': links,
        })

    return respond(200, {'leads': leads})