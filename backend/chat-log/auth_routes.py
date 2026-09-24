import json
import re
import secrets

from db import (connect, schema, esc, hash_password, check_password, user_row_to_dict,
                get_user, create_session, user_by_token)
from mailer import send_mail
from oauth import PROVIDERS, enabled_providers, build_auth_url, fetch_profile

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def respond(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False),
    }


def valid_redirect(uri: str) -> bool:
    return bool(re.match(r'^https?://[a-zA-Z0-9.\-:]+/auth/callback$', uri or ''))


def ok_session(cur, row) -> dict:
    token = create_session(cur, row[0])
    return respond(200, {'token': token, 'user': user_row_to_dict(row)})


def auth_handler(event: dict) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token') or ''
    try:
        body = json.loads(event.get('body') or '{}') if event.get('httpMethod') == 'POST' else {}
    except ValueError:
        return respond(400, {'error': 'Некорректный запрос'})
    action = params.get('action') or body.get('action') or ''

    if action == 'providers':
        return respond(200, {'providers': enabled_providers()})

    if action == 'oauth_url':
        provider = params.get('provider') or body.get('provider')
        redirect_uri = params.get('redirect_uri') or body.get('redirect_uri') or ''
        if provider not in enabled_providers():
            return respond(400, {'error': 'Этот способ входа пока не настроен'})
        if not valid_redirect(redirect_uri):
            return respond(400, {'error': 'Некорректный адрес возврата'})
        state = secrets.token_urlsafe(24)
        return respond(200, {'url': build_auth_url(provider, redirect_uri, state), 'state': state})

    conn = connect()
    cur = conn.cursor()
    try:
        return route(action, body, token, cur)
    finally:
        cur.close()
        conn.close()


def route(action: str, body: dict, token: str, cur) -> dict:
    s = schema()

    if action == 'register':
        email = str(body.get('email') or '').strip().lower()[:255]
        password = str(body.get('password') or '')
        name = str(body.get('name') or '').strip()[:200]
        phone = str(body.get('phone') or '').strip()[:50]
        if not EMAIL_RE.match(email):
            return respond(400, {'error': 'Укажите корректную почту'})
        if len(password) < 6:
            return respond(400, {'error': 'Пароль должен быть не короче 6 символов'})
        if not name:
            return respond(400, {'error': 'Укажите имя'})
        existing = get_user(cur, f"LOWER(email) = '{esc(email)}'")
        if existing:
            if existing[6]:
                return respond(409, {'error': 'Эта почта уже зарегистрирована. Войдите или восстановите пароль'})
            return respond(409, {'error': 'Эта почта уже привязана к входу через Яндекс. Войдите тем же способом'})
        cur.execute(
            f"INSERT INTO {s}.users (email, password_hash, name, phone) VALUES "
            f"('{esc(email)}', '{esc(hash_password(password))}', '{esc(name)}', '{esc(phone)}') RETURNING id"
        )
        uid = cur.fetchone()[0]
        return ok_session(cur, get_user(cur, f"id = {int(uid)}"))

    if action == 'login':
        email = str(body.get('email') or '').strip().lower()[:255]
        password = str(body.get('password') or '')
        row = get_user(cur, f"LOWER(email) = '{esc(email)}'") if email else None
        if not row or not check_password(password, row[6]):
            return respond(401, {'error': 'Неверная почта или пароль'})
        return ok_session(cur, row)

    if action == 'oauth_callback':
        provider = body.get('provider')
        code = str(body.get('code') or '')
        redirect_uri = str(body.get('redirect_uri') or '')
        if provider not in enabled_providers() or not code or not valid_redirect(redirect_uri):
            return respond(400, {'error': 'Некорректный запрос'})
        try:
            profile = fetch_profile(provider, code, redirect_uri)
        except Exception as e:
            print(f'OAuth error {provider}: {e}')
            return respond(400, {'error': 'Не удалось войти. Попробуйте ещё раз'})
        if not profile['id']:
            return respond(400, {'error': 'Не удалось получить данные профиля'})

        col = f'{provider}_id'
        pid = esc(profile['id'])
        current = user_by_token(cur, token)
        row = get_user(cur, f"{col} = '{pid}'")

        if current:
            if row and row[0] != current[0]:
                return respond(409, {'error': 'Этот аккаунт уже привязан к другому профилю'})
            cur.execute(f"UPDATE {s}.users SET {col} = '{pid}' WHERE id = {int(current[0])}")
            return respond(200, {'token': token, 'user': user_row_to_dict(get_user(cur, f"id = {int(current[0])}"))})

        if not row and profile['email'] and profile['email_verified']:
            row = get_user(cur, f"LOWER(email) = '{esc(profile['email'])}'")
            if row:
                cur.execute(f"UPDATE {s}.users SET {col} = '{pid}' WHERE id = {int(row[0])}")

        if not row:
            cur.execute(
                f"INSERT INTO {s}.users (email, name, phone, avatar_url, {col}) VALUES ("
                f"{('NULL' if not profile['email'] else repr_sql(profile['email']))}, "
                f"'{esc(profile['name'][:200])}', '{esc(profile['phone'][:50])}', "
                f"'{esc(profile['avatar'][:500])}', '{pid}') RETURNING id"
            )
            row_id = cur.fetchone()[0]
        else:
            row_id = row[0]
            updates = []
            if profile['avatar']:
                updates.append(f"avatar_url = '{esc(profile['avatar'][:500])}'")
            if not row[2] and profile['name']:
                updates.append(f"name = '{esc(profile['name'][:200])}'")
            if not row[3] and profile['phone']:
                updates.append(f"phone = '{esc(profile['phone'][:50])}'")
            if updates:
                cur.execute(f"UPDATE {s}.users SET {', '.join(updates)} WHERE id = {int(row_id)}")
        return ok_session(cur, get_user(cur, f"id = {int(row_id)}"))

    if action == 'forgot':
        email = str(body.get('email') or '').strip().lower()[:255]
        row = get_user(cur, f"LOWER(email) = '{esc(email)}'") if EMAIL_RE.match(email) else None
        if row:
            code = f'{secrets.randbelow(1000000):06d}'
            cur.execute(
                f"UPDATE {s}.users SET reset_code = '{code}', reset_attempts = 0, "
                f"reset_expires_at = NOW() + INTERVAL '30 minutes' WHERE id = {int(row[0])}"
            )
            send_mail(email, f'Код для смены пароля: {code}',
                      f'Здравствуйте!\n\nВаш код для смены пароля в личном кабинете СК ВЫСОТА: {code}\n'
                      f'Код действует 30 минут.\n\nЕсли Вы не запрашивали смену пароля, просто проигнорируйте это письмо.\n\n'
                      f'С уважением,\nСК ВЫСОТА\nhttps://skvisota.pro')
        return respond(200, {'ok': True})

    if action == 'reset':
        email = str(body.get('email') or '').strip().lower()[:255]
        code = str(body.get('code') or '').strip()
        password = str(body.get('password') or '')
        if len(password) < 6:
            return respond(400, {'error': 'Пароль должен быть не короче 6 символов'})
        cur.execute(
            f"SELECT id, reset_code, reset_attempts FROM {s}.users WHERE LOWER(email) = '{esc(email)}' "
            f"AND reset_code IS NOT NULL AND reset_expires_at > NOW() LIMIT 1"
        )
        r = cur.fetchone()
        if not r or r[2] >= 5:
            return respond(400, {'error': 'Код устарел. Запросите новый'})
        if not secrets.compare_digest(r[1], code):
            cur.execute(f"UPDATE {s}.users SET reset_attempts = reset_attempts + 1 WHERE id = {int(r[0])}")
            return respond(400, {'error': 'Неверный код'})
        cur.execute(
            f"UPDATE {s}.users SET password_hash = '{esc(hash_password(password))}', reset_code = NULL, "
            f"reset_expires_at = NULL, reset_attempts = 0 WHERE id = {int(r[0])}"
        )
        cur.execute(f"DELETE FROM {s}.user_sessions WHERE user_id = {int(r[0])}")
        return ok_session(cur, get_user(cur, f"id = {int(r[0])}"))

    user = user_by_token(cur, token)
    if not user:
        return respond(401, {'error': 'Требуется вход'})

    if action == 'me':
        return respond(200, {'user': user_row_to_dict(user)})

    if action == 'logout':
        cur.execute(f"DELETE FROM {s}.user_sessions WHERE token = '{esc(token)}'")
        return respond(200, {'ok': True})

    if action == 'update_profile':
        name = str(body.get('name') or '').strip()[:200]
        phone = str(body.get('phone') or '').strip()[:50]
        if not name:
            return respond(400, {'error': 'Укажите имя'})
        if phone and len(re.sub(r'\D', '', phone)) < 10:
            return respond(400, {'error': 'Укажите корректный телефон'})
        cur.execute(f"UPDATE {s}.users SET name = '{esc(name)}', phone = '{esc(phone)}' WHERE id = {int(user[0])}")
        return respond(200, {'user': user_row_to_dict(get_user(cur, f"id = {int(user[0])}"))})

    return respond(400, {'error': 'Неизвестное действие'})


def repr_sql(value: str) -> str:
    return f"'{esc(value[:255])}'"