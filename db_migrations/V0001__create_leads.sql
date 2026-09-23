CREATE TABLE IF NOT EXISTS t_p77458721_project_quantum_leap.leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    description TEXT,
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);