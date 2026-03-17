
-- Add new role types to enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'developer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'service_provider';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'legal_consultant';
