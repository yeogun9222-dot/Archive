-- OTP security migration for existing databases.

ALTER TABLE users
    ALTER COLUMN otp_secret TYPE VARCHAR(512);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS otp_pending_secret VARCHAR(512),
    ADD COLUMN IF NOT EXISTS otp_pending_created_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS otp_backup_codes_hash TEXT;
