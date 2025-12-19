CREATE TABLE IF NOT EXISTS submissions (
  submission_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  problem_id INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_created_at
  ON submissions (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_submissions_user_correct
  ON submissions (user_id, is_correct);

CREATE INDEX IF NOT EXISTS idx_submissions_user_problem_correct
  ON submissions (user_id, problem_id, is_correct);
