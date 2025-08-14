-- Migration: Add soft delete support
-- Created: 2024-08-14

-- Add soft delete columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Add soft delete columns to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Add soft delete columns to products table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;
    END IF;
END $$;

-- Add soft delete columns to categories table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        ALTER TABLE categories 
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;
    END IF;
END $$;

-- Add indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_companies_deleted_at ON companies(deleted_at);

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories(deleted_at);
    END IF;
END $$;

-- Create views for active (non-deleted) records
CREATE OR REPLACE VIEW active_users AS
SELECT * FROM users WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_companies AS
SELECT * FROM companies WHERE deleted_at IS NULL;

-- Create views for deleted records
CREATE OR REPLACE VIEW deleted_users AS
SELECT * FROM users WHERE deleted_at IS NOT NULL;

CREATE OR REPLACE VIEW deleted_companies AS
SELECT * FROM companies WHERE deleted_at IS NOT NULL;

-- Function to soft delete a user
CREATE OR REPLACE FUNCTION soft_delete_user(
  p_user_id UUID,
  p_deleted_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE users 
  SET 
    deleted_at = NOW(),
    deleted_by = p_deleted_by,
    is_active = false
  WHERE id = p_user_id AND deleted_at IS NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log the soft delete action
  IF affected_rows > 0 THEN
    INSERT INTO audit_logs (
      user_id,
      target_user_id,
      action,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      p_deleted_by,
      p_user_id,
      'delete',
      'user',
      p_user_id,
      jsonb_build_object(
        'soft_delete', true,
        'action_description', 'User soft deleted'
      )
    );
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft deleted user
CREATE OR REPLACE FUNCTION restore_user(
  p_user_id UUID,
  p_restored_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE users 
  SET 
    deleted_at = NULL,
    deleted_by = NULL,
    is_active = true
  WHERE id = p_user_id AND deleted_at IS NOT NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log the restore action
  IF affected_rows > 0 THEN
    INSERT INTO audit_logs (
      user_id,
      target_user_id,
      action,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      p_restored_by,
      p_user_id,
      'update',
      'user',
      p_user_id,
      jsonb_build_object(
        'restore', true,
        'action_description', 'User restored from soft delete'
      )
    );
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete a user (hard delete)
CREATE OR REPLACE FUNCTION hard_delete_user(
  p_user_id UUID,
  p_deleted_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
  user_data JSONB;
BEGIN
  -- Get user data for audit log
  SELECT to_jsonb(users.*) INTO user_data 
  FROM users WHERE id = p_user_id;
  
  -- Permanently delete the user
  DELETE FROM users WHERE id = p_user_id;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log the hard delete action
  IF affected_rows > 0 THEN
    INSERT INTO audit_logs (
      user_id,
      target_user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      metadata
    ) VALUES (
      p_deleted_by,
      p_user_id,
      'delete',
      'user',
      p_user_id,
      user_data,
      jsonb_build_object(
        'hard_delete', true,
        'action_description', 'User permanently deleted'
      )
    );
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
