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
    description      TEXT        NOT NULL,
    content_markdown TEXT        NOT NULL,
    sample_answer    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_quiz_set_id ON problems(quiz_set_id);

