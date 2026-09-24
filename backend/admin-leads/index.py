import hmac
import json
import os

import psycopg2

from admin_actions import admin_action

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    if event.get('httpMethod') not in ('GET', 'POST'):
        return respond(405, {'error': 'Метод не поддерживается'})

    expected = os.environ.get('ADMIN_PASSWORD') or ''
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    given = headers.get('x-admin-password') or ''
    if not expected or not hmac.compare_digest(given.encode(), expected.encode()):
        return respond(401, {'error': 'Неверный пароль'})

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if event.get('httpMethod') == 'POST':
        try:
            body = json.loads(event.get('body') or '{}')
        except ValueError:
            body = {}
        try:
            return respond(*admin_action(cur, schema, body))
        finally:
            cur.close()
            conn.close()

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
        f"SELECT l.id, l.name, l.phone, l.description, l.source, l.files, l.email_sent, l.created_at, l.region, l.links, "
        f"l.status, l.user_id, u.email, u.name, l.disk_link "
        f"FROM {schema}.leads l LEFT JOIN {schema}.users u ON u.id = l.user_id "
        f"ORDER BY l.created_at DESC LIMIT 1000"
    )
    rows = cur.fetchall()
    docs = {}
    photos = {}
    if rows:
        ids = ','.join(str(r[0]) for r in rows)
        cur.execute(
            f"SELECT id, lead_id, name, title, url, size, created_at FROM {schema}.lead_documents "
            f"WHERE lead_id IN ({ids}) AND hidden = FALSE ORDER BY created_at DESC"
        )
        for d in cur.fetchall():
            docs.setdefault(d[1], []).append({
                'id': d[0], 'name': d[2], 'title': d[3] or d[2], 'url': d[4], 'size': d[5],
                'created_at': d[6].isoformat() + 'Z' if d[6] else None,
            })
        cur.execute(
            f"SELECT id, lead_id, url, caption, created_at FROM {schema}.lead_progress_photos "
            f"WHERE lead_id IN ({ids}) AND hidden = FALSE ORDER BY created_at DESC"
        )
        for p in cur.fetchall():
            photos.setdefault(p[1], []).append({
                'id': p[0], 'url': p[2], 'caption': p[3] or '',
                'created_at': p[4].isoformat() + 'Z' if p[4] else None,
            })
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
            'status': r[10],
            'user_id': r[11],
            'user_email': r[12] or '',
            'user_name': r[13] or '',
            'disk_link': r[14] or '',
            'documents': docs.get(r[0], []),
            'progress_photos': photos.get(r[0], []),
        })

    return respond(200, {'leads': leads})