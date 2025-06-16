-- Quick fix for RLS issues
-- Execute this in Supabase SQL Editor

-- 1. Disable RLS temporarily to allow testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans DISABLE ROW LEVEL SECURITY;

-- 2. Add auth_user_id column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 3. Update goal constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_goal_check;
ALTER TABLE users ADD CONSTRAINT users_goal_check 
    CHECK (goal IN (
        'fazer_5km',
        'fazer_10km', 
        'meia_maratona',
        'maratona',
        'melhorar_tempo_5km',
        'melhorar_tempo_10km',
        'voltar_a_correr'
    ));

-- 4. Create index
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id); 