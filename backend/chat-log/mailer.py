import os
import re
import smtplib
from email.header import Header
from email.mime.text import MIMEText

SENDER = 'skvisotapro@mail.ru'


def send_mail(to: str, subject: str, text: str) -> bool:
    password = re.sub(r'\s', '', os.environ.get('SMTP_PASSWORD') or '')
    if not password:
        print('Email error: SMTP_PASSWORD is not set')
        return False
    msg = MIMEText(text, 'plain', 'utf-8')
    msg['Subject'] = Header(subject, 'utf-8')
    msg['From'] = f'СК ВЫСОТА <{SENDER}>'
    msg['To'] = to
    try:
        with smtplib.SMTP_SSL('smtp.mail.ru', 465, timeout=8) as server:
            server.login(SENDER, password)
            server.sendmail(SENDER, [to], msg.as_string())
        return True
    except Exception as e:
        print(f'Email error: {e}')
        return False
