ALTER TABLE problems ADD COLUMN IF NOT EXISTS sysin_format TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS default_language TEXT NOT NULL DEFAULT 'python3';
ALTER TABLE problems ADD COLUMN IF NOT EXISTS testcases JSONB;

UPDATE problems SET sysin_format = '' WHERE sysin_format IS NULL;
UPDATE problems SET testcases = '[]'::jsonb WHERE testcases IS NULL;

ALTER TABLE problems ALTER COLUMN sysin_format SET NOT NULL;
ALTER TABLE problems ALTER COLUMN testcases SET NOT NULL;
