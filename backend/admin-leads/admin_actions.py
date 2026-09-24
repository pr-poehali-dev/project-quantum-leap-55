import base64
import os
import re
import uuid

import boto3

STATUSES = ('new', 'estimate', 'contract', 'in_progress', 'done', 'cancelled')
MAX_SIZE = 3 * 1024 * 1024
ALLOWED_EXT = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'webp', 'zip', 'rar', '7z', 'dwg', 'dxf', 'txt', 'rtf'}


def esc(value) -> str:
    return str(value).replace("'", "''")


def admin_action(cur, schema: str, body: dict):
    action = body.get('action')
    try:
        lead_id = int(body.get('lead_id') or 0)
    except (TypeError, ValueError):
        lead_id = 0

    if action == 'set_status':
        status = body.get('status')
        if status not in STATUSES:
            return 400, {'error': 'Неизвестный статус'}
        cur.execute(f"UPDATE {schema}.leads SET status = '{status}' WHERE id = {lead_id}")
        cur.connection.commit()
        return 200, {'ok': True}

    if action == 'upload_document':
        filename = str(body.get('filename') or '').strip()[:200]
        title = str(body.get('title') or '').strip()[:200]
        data_b64 = body.get('data') or ''
        content_type = str(body.get('contentType') or 'application/octet-stream')[:100]
        cur.execute(f"SELECT id FROM {schema}.leads WHERE id = {lead_id}")
        if not cur.fetchone():
            return 404, {'error': 'Заявка не найдена'}
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext not in ALLOWED_EXT:
            return 400, {'error': f'Формат .{ext or "?"} не поддерживается'}
        if ',' in data_b64[:100]:
            data_b64 = data_b64.split(',', 1)[1]
        data = base64.b64decode(data_b64)
        if not data or len(data) > MAX_SIZE:
            return 400, {'error': 'Файл пустой или больше 3 МБ'}
        safe = re.sub(r'[^\w.\-]', '_', filename, flags=re.UNICODE)
        key = f'documents/{lead_id}/{uuid.uuid4().hex}/{safe}'
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
        url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        cur.execute(
            f"INSERT INTO {schema}.lead_documents (lead_id, name, title, url, size) VALUES "
            f"({lead_id}, '{esc(filename)}', '{esc(title)}', '{esc(url)}', {len(data)}) RETURNING id"
        )
        doc_id = cur.fetchone()[0]
        cur.connection.commit()
        return 200, {'ok': True, 'id': doc_id, 'url': url}

    if action == 'hide_document':
        try:
            doc_id = int(body.get('document_id') or 0)
        except (TypeError, ValueError):
            doc_id = 0
        cur.execute(f"UPDATE {schema}.lead_documents SET hidden = TRUE WHERE id = {doc_id}")
        cur.connection.commit()
        return 200, {'ok': True}

    return 400, {'error': 'Неизвестное действие'}
