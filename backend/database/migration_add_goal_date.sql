-- Migração para adicionar campo goal_date
-- Data: 2024-12-XX
-- Descrição: Adiciona campo de data do objetivo na tabela users

-- Adicionar coluna goal_date (opcional)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS goal_date TIMESTAMPTZ;

-- Atualizar comentário da coluna
COMMENT ON COLUMN users.goal_date IS 'Data do objetivo/evento (corrida, prova, etc.)';

-- Criar índice para consultas por data
CREATE INDEX IF NOT EXISTS idx_users_goal_date ON users(goal_date) WHERE goal_date IS NOT NULL; 