import json
import os
import re
import smtplib
from email.mime.text import MIMEText
from email.header import Header

import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

NOTIFY_EMAIL = 'skvisotapro@mail.ru'


def respond(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False),
    }


def esc(value: str) -> str:
    return value.replace("'", "''")


def send_email(lead_id: int, name: str, phone: str, description: str) -> bool:
    password = os.environ.get('SMTP_PASSWORD')
    if not password:
        print('Email error: SMTP_PASSWORD is not set')
        return False
    text = (
        f'Новая заявка на бесплатный расчёт стоимости №{lead_id}\n\n'
        f'Имя: {name}\n'
        f'Телефон: {phone}\n'
        f'Описание объекта:\n{description or "—"}\n'
    )
    msg = MIMEText(text, 'plain', 'utf-8')
    msg['Subject'] = Header(f'Заявка на расчёт №{lead_id} — {name}', 'utf-8')
    msg['From'] = NOTIFY_EMAIL
    msg['To'] = NOTIFY_EMAIL
    try:
        with smtplib.SMTP_SSL('smtp.mail.ru', 465, timeout=8) as server:
            server.login(NOTIFY_EMAIL, password)
            server.sendmail(NOTIFY_EMAIL, [NOTIFY_EMAIL], msg.as_string())
        return True
    except Exception as e:
        print(f'Email error: {e}')
        return False


def handler(event: dict, context) -> dict:
    """Приём заявок на бесплатный расчёт стоимости: сохраняет заявку в базу и отправляет уведомление на почту компании."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return respond(405, {'error': 'Метод не поддерживается'})

    body = json.loads(event.get('body') or '{}')
    name = str(body.get('name', '')).strip()[:200]
    phone = str(body.get('phone', '')).strip()[:50]
    description = str(body.get('description', '')).strip()[:3000]

    if not name:
        return respond(400, {'error': 'Укажите имя'})
    if len(re.sub(r'\D', '', phone)) < 10:
        return respond(400, {'error': 'Укажите корректный телефон'})

    schema = os.environ['MAIN_DB_SCHEMA']
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {schema}.leads (name, phone, description) "
        f"VALUES ('{esc(name)}', '{esc(phone)}', '{esc(description)}') RETURNING id"
    )
    lead_id = cur.fetchone()[0]

    sent = send_email(lead_id, name, phone, description)
    if sent:
        cur.execute(f"UPDATE {schema}.leads SET email_sent = TRUE WHERE id = {int(lead_id)}")

    cur.close()
    conn.close()

    return respond(200, {'success': True, 'id': lead_id})