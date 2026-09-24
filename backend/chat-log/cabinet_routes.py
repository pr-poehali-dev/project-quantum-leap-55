import json
import os

import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def respond(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def iso(dt):
    return dt.isoformat() + 'Z' if dt else None


def parse_json(value):
    try:
        return json.loads(value or '[]')
    except ValueError:
        return []


def cabinet_handler(event: dict) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}


    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = (headers.get('x-auth-token') or '').replace("'", "''")
    if not token or len(token) > 128:
        return respond(401, {'error': 'Требуется вход'})

    s = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        f"SELECT user_id FROM {s}.user_sessions WHERE token = '{token}' AND expires_at > NOW() LIMIT 1"
    )
    r = cur.fetchone()
    if not r:
        cur.close()
        conn.close()
        return respond(401, {'error': 'Требуется вход'})
    uid = int(r[0])

    cur.execute(
        f"SELECT id, source, description, region, files, links, status, created_at, disk_link "
        f"FROM {s}.leads WHERE user_id = {uid} ORDER BY created_at DESC LIMIT 200"
    )
    leads = [{
        'id': x[0], 'source': x[1], 'description': x[2] or '', 'region': x[3] or '',
        'files': parse_json(x[4]), 'links': parse_json(x[5]), 'status': x[6],
        'created_at': iso(x[7]), 'disk_link': x[8] or '', 'documents': [], 'progress_photos': [],
    } for x in cur.fetchall()]

    by_id = {lead['id']: lead for lead in leads}
    if by_id:
        ids = ','.join(str(i) for i in by_id)
        cur.execute(
            f"SELECT id, lead_id, name, title, url, size, created_at FROM {s}.lead_documents "
            f"WHERE lead_id IN ({ids}) AND hidden = FALSE ORDER BY created_at DESC"
        )
        for d in cur.fetchall():
            by_id[d[1]]['documents'].append({
                'id': d[0], 'name': d[2], 'title': d[3] or d[2], 'url': d[4], 'size': d[5], 'created_at': iso(d[6]),
            })
        cur.execute(
            f"SELECT id, lead_id, url, caption, created_at FROM {s}.lead_progress_photos "
            f"WHERE lead_id IN ({ids}) AND hidden = FALSE ORDER BY created_at DESC"
        )
        for p in cur.fetchall():
            by_id[p[1]]['progress_photos'].append({
                'id': p[0], 'url': p[2], 'caption': p[3] or '', 'created_at': iso(p[4]),
            })

    cur.execute(
        f"SELECT id, session_id, messages, message_count, created_at, updated_at FROM {s}.chat_sessions "
        f"WHERE user_id = {uid} ORDER BY updated_at DESC LIMIT 50"
    )
    chats = [{
        'id': c[0], 'session_id': c[1], 'messages': parse_json(c[2]), 'message_count': c[3],
        'created_at': iso(c[4]), 'updated_at': iso(c[5]),
    } for c in cur.fetchall()]

    cur.close()
    conn.close()
    return respond(200, {'leads': leads, 'chats': chats})