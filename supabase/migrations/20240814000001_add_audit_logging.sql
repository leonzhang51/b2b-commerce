-- Migration: Add audit logging system
-- Created: 2024-08-14

-- Create the audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Who performed the action
  target_user_id UUID, -- User being acted upon (for user management actions)
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'create', 'update', 'delete', 'login', 'logout', 
    'role_change', 'impersonate_start', 'impersonate_end'
  )),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
    'user', 'company', 'product', 'category', 'order', 'system'
  )),
  entity_id UUID, -- ID of the entity being acted upon
  old_values JSONB, -- Previous values (for updates)
  new_values JSONB, -- New values (for creates/updates)
  metadata JSONB, -- Additional context (IP, user agent, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);

-- Create a function to automatically log user changes
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log user updates
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id, 
      target_user_id, 
      action, 
      entity_type, 
      entity_id, 
      old_values, 
      new_values,
      metadata
    ) VALUES (
      COALESCE(current_setting('app.current_user_id', true)::UUID, NEW.id), -- Use current user or self
      NEW.id,
      'update',
      'user',
      NEW.id,
      to_jsonb(OLD) - 'updated_at', -- Exclude updated_at from old values
      to_jsonb(NEW) - 'updated_at', -- Exclude updated_at from new values
      jsonb_build_object(
        'trigger', 'automatic',
        'table', TG_TABLE_NAME,
        'operation', TG_OP
      )
    );
    RETURN NEW;
  END IF;
  
  -- Log user creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      user_id, 
      target_user_id, 
      action, 
      entity_type, 
      entity_id, 
      new_values,
      metadata
    ) VALUES (
      COALESCE(current_setting('app.current_user_id', true)::UUID, NEW.id), -- Use current user or self
      NEW.id,
      'create',
      'user',
      NEW.id,
      to_jsonb(NEW) - 'created_at' - 'updated_at',
      jsonb_build_object(
        'trigger', 'automatic',
        'table', TG_TABLE_NAME,
        'operation', TG_OP
      )
    );
    RETURN NEW;
  END IF;
  
  -- Log user deletion (soft delete)
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      user_id, 
      target_user_id, 
      action, 
      entity_type, 
      entity_id, 
      old_values,
      metadata
    ) VALUES (
      COALESCE(current_setting('app.current_user_id', true)::UUID, OLD.id), -- Use current user or self
      OLD.id,
      'delete',
      'user',
      OLD.id,
      to_jsonb(OLD),
      jsonb_build_object(
        'trigger', 'automatic',
        'table', TG_TABLE_NAME,
        'operation', TG_OP
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user change logging
DROP TRIGGER IF EXISTS trigger_log_user_changes ON users;
CREATE TRIGGER trigger_log_user_changes
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_user_changes();

-- Create a function to manually log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_user_id UUID,
  p_action VARCHAR(50),
  p_entity_type VARCHAR(50),
  p_target_user_id UUID DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, 
    target_user_id, 
    action, 
    entity_type, 
    entity_id, 
    old_values, 
    new_values,
    metadata
  ) VALUES (
    p_user_id,
    p_target_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    COALESCE(p_metadata, jsonb_build_object('manual', true))
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
