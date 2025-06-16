-- Migration: Fix users table and RLS policies
-- Date: 2024-12-16

-- 1. Add auth_user_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 2. Update goal enum values to match frontend
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

-- 3. Create index for auth_user_id
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- 4. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for users table
-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth_user_id = auth.uid());

-- Allow users to insert their own data
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Allow public insert for onboarding (temporary - can be restricted later)
CREATE POLICY "Allow public insert during onboarding" ON users
    FOR INSERT WITH CHECK (true);

-- 6. Create RLS policies for training_plans table
-- Allow users to read their own plans
CREATE POLICY "Users can read own plans" ON training_plans
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));

-- Allow users to insert their own plans
CREATE POLICY "Users can insert own plans" ON training_plans
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));

-- Allow users to update their own plans
CREATE POLICY "Users can update own plans" ON training_plans
    FOR UPDATE USING (user_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));

-- Allow public insert for plan creation (temporary - can be restricted later)  
CREATE POLICY "Allow public insert for plans" ON training_plans
    FOR INSERT WITH CHECK (true);

-- 7. Update comments
COMMENT ON COLUMN users.auth_user_id IS 'ID do usuário no Supabase Auth para integração'; 