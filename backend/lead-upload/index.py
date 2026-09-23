import base64
import json
import os
import re
import uuid

import boto3

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

MAX_SIZE = 3 * 1024 * 1024
ALLOWED_EXT = {
    'jpg', 'jpeg', 'png', 'webp', 'heic', 'gif',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf',
    'dwg', 'dxf', 'zip', 'rar', '7z',
}


def respond(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False),
    }


def handler(event: dict, context) -> dict:
    """Загрузка одного файла (фото, чертёж, документ) к заявке на расчёт. Сохраняет файл в хранилище и возвращает ссылку."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return respond(405, {'error': 'Метод не поддерживается'})

    body = json.loads(event.get('body') or '{}')
    filename = str(body.get('filename', '')).strip()[:200]
    content_type = str(body.get('contentType', '') or 'application/octet-stream')[:100]
    data_b64 = body.get('data') or ''

    if not filename or not data_b64:
        return respond(400, {'error': 'Файл не передан'})

    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in ALLOWED_EXT:
        return respond(400, {'error': f'Формат .{ext or "?"} не поддерживается'})

    if ',' in data_b64[:100]:
        data_b64 = data_b64.split(',', 1)[1]
    data = base64.b64decode(data_b64)
    if len(data) > MAX_SIZE:
        return respond(400, {'error': 'Файл больше 3 МБ'})

    safe_name = re.sub(r'[^\w.\-]', '_', filename, flags=re.UNICODE)
    key = f'leads/{uuid.uuid4().hex}/{safe_name}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return respond(200, {'url': url, 'name': filename, 'size': len(data)})
