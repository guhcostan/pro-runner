-- Migração para adicionar campo weekly_frequency à tabela training_plans
-- Data: 2024-12-XX
-- Descrição: Adiciona campo de frequência semanal na tabela training_plans para armazenar no plano

-- Adicionar coluna weekly_frequency com valor padrão 3
ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS weekly_frequency INTEGER NOT NULL DEFAULT 3 
CHECK (weekly_frequency >= 1 AND weekly_frequency <= 6);

-- Atualizar comentário da coluna
COMMENT ON COLUMN training_plans.weekly_frequency IS 'Frequência semanal de treinos usada na geração do plano (1-6 vezes por semana)';

-- Atualizar planos existentes com valor padrão 3
UPDATE training_plans 
SET weekly_frequency = 3
WHERE weekly_frequency IS NULL OR weekly_frequency = 0; 