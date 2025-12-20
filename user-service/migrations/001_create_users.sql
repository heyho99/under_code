CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER SEQUENCE users_id_seq MINVALUE 0;

INSERT INTO users (id, username, email, password_hash)
VALUES (
  0,
  'admin',
  'admin@example.com',
  '00000000000000000000000000000000$893c750abe47d04ea480910a2bc8787d1323cd11d4e6eaa3a6c890dbeb42bfa0'
)
ON CONFLICT DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('users', 'id'),
  (SELECT COALESCE(MAX(id), 0) FROM users),
  true
);
