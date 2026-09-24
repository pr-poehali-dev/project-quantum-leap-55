CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    name VARCHAR(200) NOT NULL DEFAULT '',
    phone VARCHAR(50) NOT NULL DEFAULT '',
    yandex_id VARCHAR(100) UNIQUE,
    google_id VARCHAR(100) UNIQUE,
    avatar_url VARCHAR(500) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS user_sessions (
    token VARCHAR(128) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions (user_id);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'new';
CREATE INDEX IF NOT EXISTS idx_leads_user ON leads (user_id);

ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS lead_documents (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(600) NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_documents_lead ON lead_documents (lead_id);