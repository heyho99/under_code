ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'python3';

CREATE INDEX IF NOT EXISTS idx_submissions_user_language_created_at
  ON submissions (user_id, language, created_at);

CREATE INDEX IF NOT EXISTS idx_submissions_user_language_correct
  ON submissions (user_id, language, is_correct);
