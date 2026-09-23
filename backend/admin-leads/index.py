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
    """Список всех заявок с сайта для закрытой страницы администратора. Доступ только по паролю."""
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
    cur.execute(
        f"SELECT id, name, phone, description, source, files, email_sent, created_at "
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
        leads.append({
            'id': r[0],
            'name': r[1],
            'phone': r[2],
            'description': r[3] or '',
            'source': r[4],
            'files': files,
            'email_sent': r[6],
            'created_at': r[7].isoformat() + 'Z' if r[7] else None,
        })

    return respond(200, {'leads': leads})
