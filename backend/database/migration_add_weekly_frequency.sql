-- Migração para adicionar campo weekly_frequency
-- Data: 2024-12-XX
-- Descrição: Adiciona campo de frequência semanal na tabela users

-- Adicionar coluna weekly_frequency com valor padrão 3
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weekly_frequency INTEGER NOT NULL DEFAULT 3 
CHECK (weekly_frequency >= 1 AND weekly_frequency <= 6);

-- Atualizar comentário da coluna
COMMENT ON COLUMN users.weekly_frequency IS 'Frequência semanal de treinos (1-6 vezes por semana)';

-- Atualizar usuários existentes com valor padrão baseado no objetivo
UPDATE users 
SET weekly_frequency = CASE 
  WHEN goal = 'start_running' THEN 2 -- Iniciantes começam com menos frequência
  WHEN goal = 'run_5k' THEN 3
  WHEN goal = 'run_10k' THEN 4
  WHEN goal = 'half_marathon' THEN 4
  WHEN goal = 'marathon' THEN 5
  WHEN goal = 'improve_time' THEN 4
  ELSE 3 -- Fallback
END
WHERE weekly_frequency = 3; -- Só atualiza se ainda tem o valor padrão 