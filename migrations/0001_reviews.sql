-- No sample reviews or personal data. Apply once to an isolated D1 database first.
PRAGMA foreign_keys = ON;
CREATE TABLE review_invitations (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  practice TEXT NOT NULL CHECK (practice IN ('career','business')),
  service TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  revoked_at INTEGER
);
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL UNIQUE REFERENCES review_invitations(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  original_response1 TEXT NOT NULL,
  original_response2 TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT '',
  identity TEXT NOT NULL CHECK (identity IN ('first_initial','first','anonymous')),
  public_name TEXT NOT NULL,
  job_title TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  consent INTEGER NOT NULL CHECK (consent IN (0,1)),
  consent_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','archived')),
  created_at INTEGER NOT NULL,
  submitted_at INTEGER NOT NULL,
  approved_at INTEGER,
  CHECK (status != 'approved' OR consent = 1)
);
-- The insert and invitation consumption form one atomic SQLite statement.
CREATE TRIGGER consume_review_invitation AFTER INSERT ON reviews
BEGIN
  UPDATE review_invitations SET used_at = NEW.submitted_at WHERE id = NEW.invitation_id;
END;
CREATE INDEX reviews_public ON reviews(status, consent, approved_at);
CREATE INDEX invitations_classification ON review_invitations(practice, service);

