-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    height INTEGER NOT NULL CHECK (height >= 100 AND height <= 250), -- em cm
    weight NUMERIC(5,2) NOT NULL CHECK (weight >= 30 AND weight <= 200), -- em kg
    personal_record_5k VARCHAR(10) NOT NULL, -- formato MM:SS
    goal VARCHAR(50) NOT NULL CHECK (goal IN ('start_running', 'run_5k', 'run_10k', 'half_marathon', 'marathon', 'improve_time')),
    weekly_frequency INTEGER NOT NULL DEFAULT 3 CHECK (weekly_frequency >= 1 AND weekly_frequency <= 6), -- frequência semanal de treinos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de planos de treino
CREATE TABLE IF NOT EXISTS training_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal VARCHAR(50) NOT NULL,
    fitness_level VARCHAR(50) NOT NULL,
    base_pace VARCHAR(10) NOT NULL, -- formato MM:SS
    total_weeks INTEGER NOT NULL DEFAULT 8,
    plan_data JSONB NOT NULL, -- Armazena as semanas e treinos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_goal ON users(goal);
CREATE INDEX IF NOT EXISTS idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_created_at ON training_plans(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Opcional, pode ser configurado no Supabase Dashboard
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- Comentários das tabelas
COMMENT ON TABLE users IS 'Tabela de usuários do ProRunner';
COMMENT ON TABLE training_plans IS 'Tabela de planos de treino personalizados';

COMMENT ON COLUMN users.height IS 'Altura em centímetros';
COMMENT ON COLUMN users.weight IS 'Peso em quilogramas';
COMMENT ON COLUMN users.personal_record_5k IS 'Recorde pessoal nos 5km no formato MM:SS';
COMMENT ON COLUMN training_plans.plan_data IS 'Dados das semanas e treinos em formato JSON';
COMMENT ON COLUMN training_plans.base_pace IS 'Pace base calculado no formato MM:SS por km'; 