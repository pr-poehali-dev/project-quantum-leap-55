ALTER TABLE leads ADD COLUMN IF NOT EXISTS disk_link VARCHAR(600) NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS lead_progress_photos (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    url VARCHAR(600) NOT NULL,
    caption VARCHAR(255) NOT NULL DEFAULT '',
    hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_progress_photos_lead ON lead_progress_photos (lead_id);
