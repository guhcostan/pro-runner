-- Migração para atualizar objetivos de corrida
-- Data: 2024-12-XX
-- Descrição: Atualiza objetivos para serem mais específicos para corredores

-- Primeiro, remover a constraint existente
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_goal_check;

-- Atualizar valores existentes para os novos objetivos
UPDATE users 
SET goal = CASE 
  WHEN goal = 'comecar_correr' THEN 'start_running'
  WHEN goal = 'fazer_5km' THEN 'run_5k'
  WHEN goal = 'melhorar_tempo' THEN 'improve_time'
  WHEN goal = 'perder_peso' THEN 'run_5k' -- Converter para objetivo mais específico
  WHEN goal = 'manter_forma' THEN 'run_10k' -- Converter para objetivo mais específico
  WHEN goal = 'ganhar_resistencia' THEN 'half_marathon' -- Converter para objetivo mais específico
  ELSE 'run_5k' -- Fallback para objetivo padrão
END
WHERE goal IN ('comecar_correr', 'fazer_5km', 'melhorar_tempo', 'perder_peso', 'manter_forma', 'ganhar_resistencia');

-- Adicionar nova constraint com os objetivos atualizados
ALTER TABLE users 
ADD CONSTRAINT users_goal_check 
CHECK (goal IN ('start_running', 'run_5k', 'run_10k', 'half_marathon', 'marathon', 'improve_time'));

-- Atualizar comentário da coluna
COMMENT ON COLUMN users.goal IS 'Objetivo de corrida do usuário: start_running, run_5k, run_10k, half_marathon, marathon, improve_time'; 