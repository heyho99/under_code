CREATE TABLE IF NOT EXISTS quiz_sets (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER     NOT NULL,
    title       TEXT        NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problems (
    id               SERIAL PRIMARY KEY,
    quiz_set_id      INTEGER     NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
    order_index      INTEGER     NOT NULL,
    title            TEXT        NOT NULL,
    category         TEXT        NOT NULL DEFAULT 'syntax',
    statement        TEXT        NOT NULL,
    sysin_format     TEXT        NOT NULL,
    default_language TEXT        NOT NULL DEFAULT 'python3',
    sample_answer    TEXT,
    testcases        JSONB       NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_quiz_set_id ON problems(quiz_set_id);

