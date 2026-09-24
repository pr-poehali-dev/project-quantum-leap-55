import json
import os
import urllib.parse
import urllib.request

PROVIDERS = {
    'yandex': {
        'auth_url': 'https://oauth.yandex.ru/authorize',
        'token_url': 'https://oauth.yandex.ru/token',
        'id_env': 'YANDEX_CLIENT_ID',
        'secret_env': 'YANDEX_CLIENT_SECRET',
    },
}


def enabled_providers() -> list:
    return [p for p, c in PROVIDERS.items() if os.environ.get(c['id_env']) and os.environ.get(c['secret_env'])]


def build_auth_url(provider: str, redirect_uri: str, state: str) -> str:
    cfg = PROVIDERS[provider]
    params = {
        'response_type': 'code',
        'client_id': os.environ[cfg['id_env']],
        'redirect_uri': redirect_uri,
        'state': state,
    }
    params['force_confirm'] = 'yes'
    return f"{cfg['auth_url']}?{urllib.parse.urlencode(params)}"


def _http(url: str, data: dict = None, headers: dict = None) -> dict:
    body = urllib.parse.urlencode(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers or {})
    if body is not None:
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    with urllib.request.urlopen(req, timeout=8) as resp:
        return json.loads(resp.read().decode())


def fetch_profile(provider: str, code: str, redirect_uri: str) -> dict:
    """Обменивает код на токен и возвращает профиль: id, email, name, phone, avatar."""
    cfg = PROVIDERS[provider]
    token = _http(cfg['token_url'], {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': os.environ[cfg['id_env']],
        'client_secret': os.environ[cfg['secret_env']],
        'redirect_uri': redirect_uri,
    })
    access = token.get('access_token')
    if not access:
        raise ValueError('no access token')

    info = _http('https://login.yandex.ru/info?format=json', headers={'Authorization': f'OAuth {access}'})
    avatar = ''
    if info.get('default_avatar_id') and not info.get('is_avatar_empty'):
        avatar = f"https://avatars.yandex.net/get-yapic/{info['default_avatar_id']}/islands-200"
    name = info.get('real_name') or ' '.join(x for x in [info.get('first_name'), info.get('last_name')] if x) or info.get('display_name') or ''
    return {
        'id': str(info.get('id') or ''),
        'email': (info.get('default_email') or '').lower(),
        'email_verified': True,
        'name': name,
        'phone': ((info.get('default_phone') or {}).get('number') or ''),
        'avatar': avatar,
    }