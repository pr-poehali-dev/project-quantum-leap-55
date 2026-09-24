import hashlib
import hmac
import os
import secrets

import psycopg2

SESSION_DAYS = 90
USER_FIELDS = 'id, email, name, phone, avatar_url, yandex_id, password_hash'


def esc(value) -> str:
    return str(value).replace("'", "''")


def connect():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    return conn


def schema() -> str:
    return os.environ['MAIN_DB_SCHEMA']


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 120000).hex()
    return f'pbkdf2${salt}${digest}'


def check_password(password: str, stored: str) -> bool:
    try:
        _, salt, digest = stored.split('$')
    except (ValueError, AttributeError):
        return False
    calc = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 120000).hex()
    return hmac.compare_digest(calc, digest)


def user_row_to_dict(r) -> dict:
    return {
        'id': r[0],
        'email': r[1] or '',
        'name': r[2] or '',
        'phone': r[3] or '',
        'avatar': r[4] or '',
        'yandex': bool(r[5]),
        'has_password': bool(r[6]),
    }


def get_user(cur, where: str):
    cur.execute(f"SELECT {USER_FIELDS} FROM {schema()}.users WHERE {where} LIMIT 1")
    return cur.fetchone()


def create_session(cur, user_id: int) -> str:
    token = secrets.token_urlsafe(48)
    cur.execute(
        f"INSERT INTO {schema()}.user_sessions (token, user_id, expires_at) "
        f"VALUES ('{esc(token)}', {int(user_id)}, NOW() + INTERVAL '{SESSION_DAYS} days')"
    )
    cur.execute(f"UPDATE {schema()}.users SET last_login_at = NOW() WHERE id = {int(user_id)}")
    return token


def user_by_token(cur, token: str):
    if not token or len(token) > 128:
        return None
    cur.execute(
        f"SELECT u.id, u.email, u.name, u.phone, u.avatar_url, u.yandex_id, u.password_hash "
        f"FROM {schema()}.user_sessions s JOIN {schema()}.users u ON u.id = s.user_id "
        f"WHERE s.token = '{esc(token)}' AND s.expires_at > NOW() LIMIT 1"
    )
    return cur.fetchone()