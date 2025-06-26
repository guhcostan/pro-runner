-- Script para resetar completamente o banco de dados
-- ATENÇÃO: Este script remove TODOS os dados de usuário!

-- 1. Remover todas as tabelas em ordem de dependência
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS training_plans CASCADE;
DROP TABLE IF EXISTS workout_templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS training_phases CASCADE;

-- 2. Remover sequences
DROP SEQUENCE IF EXISTS training_phases_id_seq CASCADE;

-- 3. Recriar as tabelas do sistema adaptativo (migração completa)

-- Tabela de fases de treinamento
CREATE TABLE training_phases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name JSONB NOT NULL,
    description JSONB NOT NULL,
    target_audience TEXT NOT NULL,
    primary_goals TEXT[] NOT NULL,
    max_level INTEGER NOT NULL DEFAULT 10,
    entry_criteria JSONB NOT NULL,
    exit_criteria JSONB NOT NULL,
    workout_types VARCHAR(50)[] NOT NULL,
    typical_weekly_volume_range NUMRANGE NOT NULL,
    intensity_distribution JSONB NOT NULL,
    phase_order INTEGER UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de usuários (versão atualizada)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    height INTEGER NOT NULL CHECK (height >= 100 AND height <= 250),
    weight NUMERIC(5,2) NOT NULL CHECK (weight >= 30 AND weight <= 200),
    personal_record_5k VARCHAR(10) NOT NULL,
    goal VARCHAR(50) NOT NULL CHECK (goal IN ('start_running', 'run_5k', 'run_10k', 'half_marathon', 'marathon', 'improve_time')),
    weekly_frequency INTEGER NOT NULL DEFAULT 3 CHECK (weekly_frequency >= 1 AND weekly_frequency <= 6),
    auth_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    goal_date TIMESTAMPTZ,
    age INTEGER CHECK (age >= 12 AND age <= 100),
    sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'other'))
);

-- Tabela de perfis de usuário
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER CHECK (age >= 12 AND age <= 100),
    sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'other')),
    injury_history JSONB DEFAULT '[]',
    fitness_assessments JSONB DEFAULT '{}',
    preferred_training_days VARCHAR(20)[] DEFAULT ARRAY['monday', 'wednesday', 'friday'],
    available_time_per_session INTEGER DEFAULT 60,
    training_location VARCHAR(20) DEFAULT 'outdoor' CHECK (training_location IN ('outdoor', 'treadmill', 'mixed')),
    running_experience_years INTEGER DEFAULT 0,
    longest_run_distance NUMERIC DEFAULT 0,
    average_weekly_volume NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de progresso do usuário
CREATE TABLE user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_phase_id INTEGER NOT NULL REFERENCES training_phases(id),
    current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
    current_xp INTEGER NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
    xp_to_next_level INTEGER NOT NULL DEFAULT 100,
    total_xp_earned INTEGER NOT NULL DEFAULT 0,
    total_workouts_completed INTEGER NOT NULL DEFAULT 0,
    total_distance_run NUMERIC NOT NULL DEFAULT 0,
    current_streak_days INTEGER NOT NULL DEFAULT 0,
    longest_streak_days INTEGER NOT NULL DEFAULT 0,
    achievements JSONB DEFAULT '[]',
    best_5k_time VARCHAR(10),
    best_10k_time VARCHAR(10),
    best_half_marathon_time VARCHAR(10),
    best_marathon_time VARCHAR(10),
    phase_started_at TIMESTAMPTZ DEFAULT NOW(),
    last_workout_at TIMESTAMPTZ,
    last_level_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de templates de treino
CREATE TABLE workout_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phase_id INTEGER NOT NULL REFERENCES training_phases(id),
    level_range INT4RANGE NOT NULL,
    workout_type VARCHAR(50) NOT NULL,
    name JSONB NOT NULL,
    description JSONB NOT NULL,
    template_data JSONB NOT NULL,
    intensity_zone VARCHAR(20) NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    prerequisites JSONB DEFAULT '{}',
    contraindications JSONB DEFAULT '[]',
    base_xp_reward INTEGER NOT NULL DEFAULT 0,
    completion_bonus_xp INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    usage_frequency_weight NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de planos de treino (atualizada)
CREATE TABLE training_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal VARCHAR(50) NOT NULL,
    fitness_level VARCHAR(50) NOT NULL,
    base_pace VARCHAR(10) NOT NULL,
    total_weeks INTEGER NOT NULL DEFAULT 8,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    phase_id INTEGER REFERENCES training_phases(id),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 10),
    is_adaptive BOOLEAN DEFAULT false,
    adaptation_rules JSONB DEFAULT '{}',
    weekly_frequency INTEGER DEFAULT 3 CHECK (weekly_frequency >= 1 AND weekly_frequency <= 7)
);

-- 4. Inserir dados iniciais das fases de treinamento
INSERT INTO training_phases (name, display_name, description, target_audience, primary_goals, max_level, entry_criteria, exit_criteria, workout_types, typical_weekly_volume_range, intensity_distribution, phase_order) VALUES
('foundation', 
 '{"pt": "Base", "en": "Foundation", "es": "Base"}',
 '{"pt": "Construção da base aeróbica e adaptação inicial", "en": "Building aerobic base and initial adaptation", "es": "Construcción de base aeróbica y adaptación inicial"}',
 'beginners',
 ARRAY['aerobic_base', 'injury_prevention', 'habit_formation'],
 5,
 '{"min_running_experience_weeks": 0, "max_weekly_volume": 15}',
 '{"min_weekly_volume": 15, "consistent_weeks": 4}',
 ARRAY['easy_run', 'walk_run', 'recovery'],
 '[5,25]',
 '{"easy": 90, "moderate": 10, "hard": 0}',
 1),
 
('development', 
 '{"pt": "Desenvolvimento", "en": "Development", "es": "Desarrollo"}',
 '{"pt": "Desenvolvimento da capacidade aeróbica e introdução de intensidade", "en": "Developing aerobic capacity and introducing intensity", "es": "Desarrollo de capacidad aeróbica e introducción de intensidad"}',
 'recreational_runners',
 ARRAY['aerobic_capacity', 'speed_endurance', 'race_preparation'],
 7,
 '{"min_weekly_volume": 15, "consistent_weeks": 4}',
 '{"min_weekly_volume": 35, "tempo_runs_completed": 8}',
 ARRAY['easy_run', 'tempo_run', 'interval_training', 'long_run'],
 '[15,50]',
 '{"easy": 75, "moderate": 15, "hard": 10}',
 2),
 
('performance', 
 '{"pt": "Performance", "en": "Performance", "es": "Rendimiento"}',
 '{"pt": "Otimização da performance e treinamento específico para competições", "en": "Performance optimization and race-specific training", "es": "Optimización del rendimiento y entrenamiento específico para competiciones"}',
 'competitive_runners',
 ARRAY['race_performance', 'lactate_threshold', 'vo2_max'],
 10,
 '{"min_weekly_volume": 35, "tempo_runs_completed": 8}',
 '{"race_times_improved": true, "high_intensity_tolerance": true}',
 ARRAY['easy_run', 'tempo_run', 'interval_training', 'long_run', 'race_pace', 'fartlek'],
 '[35,80]',
 '{"easy": 65, "moderate": 20, "hard": 15}',
 3),
 
('maintenance', 
 '{"pt": "Manutenção", "en": "Maintenance", "es": "Mantenimiento"}',
 '{"pt": "Manutenção da forma física e prevenção de lesões", "en": "Fitness maintenance and injury prevention", "es": "Mantenimiento de la forma física y prevención de lesiones"}',
 'all_levels',
 ARRAY['fitness_maintenance', 'injury_prevention', 'enjoyment'],
 8,
 '{"any_phase_completed": true}',
 '{"maintenance_period_completed": true}',
 ARRAY['easy_run', 'tempo_run', 'cross_training', 'recovery'],
 '[20,60]',
 '{"easy": 80, "moderate": 15, "hard": 5}',
 4),
 
('recovery', 
 '{"pt": "Recuperação", "en": "Recovery", "es": "Recuperación"}',
 '{"pt": "Recuperação ativa e retorno gradual ao treinamento", "en": "Active recovery and gradual return to training", "es": "Recuperación activa y retorno gradual al entrenamiento"}',
 'all_levels',
 ARRAY['active_recovery', 'injury_rehabilitation', 'gradual_return'],
 6,
 '{"injury_or_break": true}',
 '{"pain_free_running": true, "base_fitness_restored": true}',
 ARRAY['easy_run', 'walk_run', 'cross_training', 'recovery'],
 '[5,30]',
 '{"easy": 95, "moderate": 5, "hard": 0}',
 5);

-- 5. Criar índices para performance
CREATE INDEX idx_users_goal ON users(goal);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_training_plans_user_id ON training_plans(user_id);
CREATE INDEX idx_training_plans_created_at ON training_plans(created_at);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_phase_level ON user_progress(current_phase_id, current_level);
CREATE INDEX idx_user_progress_xp ON user_progress(current_xp);
CREATE INDEX idx_workout_templates_phase_level ON workout_templates(phase_id, level_range);

-- 6. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON workout_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_phases_updated_at BEFORE UPDATE ON training_phases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Adicionar comentários
COMMENT ON TABLE users IS 'Tabela de usuários do ProRunner';
COMMENT ON TABLE training_plans IS 'Tabela de planos de treino personalizados';
COMMENT ON COLUMN users.height IS 'Altura em centímetros';
COMMENT ON COLUMN users.weight IS 'Peso em quilogramas';
COMMENT ON COLUMN users.personal_record_5k IS 'Recorde pessoal nos 5km no formato MM:SS';
COMMENT ON COLUMN training_plans.plan_data IS 'Dados das semanas e treinos em formato JSON';
COMMENT ON COLUMN training_plans.base_pace IS 'Pace base calculado no formato MM:SS por km';

-- Confirmar que o reset foi concluído
SELECT 'Database reset completed successfully!' as status; 