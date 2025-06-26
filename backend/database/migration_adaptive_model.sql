-- =====================================================
-- MIGRAÇÃO PARA MODELO ADAPTATIVO E CONTÍNUO
-- ProRunner v2.0 - Sistema de Fases e Gamificação
-- =====================================================

-- Task 1.1.1: Criar tabela user_profiles com dados estendidos
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados pessoais expandidos
    age INTEGER CHECK (age >= 12 AND age <= 100),
    sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'other')),
    
    -- Histórico médico e fitness
    injury_history JSONB DEFAULT '[]'::jsonb, -- Array de lesões: [{"type": "knee", "date": "2023-01-01", "severity": "mild", "recovered": true}]
    fitness_assessments JSONB DEFAULT '{}'::jsonb, -- Avaliações: {"vo2_max": 45, "heart_rate_zones": {...}, "last_assessment": "2023-01-01"}
    
    -- Preferências de treino
    preferred_training_days VARCHAR[] DEFAULT ARRAY['monday', 'wednesday', 'friday'], -- dias preferidos
    available_time_per_session INTEGER DEFAULT 60, -- minutos por sessão
    training_location VARCHAR(50) DEFAULT 'outdoor' CHECK (training_location IN ('outdoor', 'treadmill', 'mixed')),
    
    -- Dados de performance
    running_experience_years INTEGER DEFAULT 0,
    longest_run_distance NUMERIC(5,2) DEFAULT 0, -- em km
    average_weekly_volume NUMERIC(5,2) DEFAULT 0, -- km por semana
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir um perfil por usuário
    UNIQUE(user_id)
);

-- Task 1.1.2: Criar tabela training_phases (5 fases do sistema)
CREATE TABLE IF NOT EXISTS training_phases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name JSONB NOT NULL, -- {"pt": "Fundação", "en": "Foundation", "es": "Fundación"}
    description JSONB NOT NULL, -- Descrição multilíngue
    
    -- Características da fase
    target_audience TEXT NOT NULL,
    primary_goals TEXT[] NOT NULL, -- Array de objetivos principais
    max_level INTEGER NOT NULL DEFAULT 10,
    
    -- Critérios de entrada e saída
    entry_criteria JSONB NOT NULL, -- Requisitos para entrar na fase
    exit_criteria JSONB NOT NULL, -- Requisitos para avançar à próxima fase
    
    -- Configurações de treino
    workout_types VARCHAR[] NOT NULL, -- Tipos de treino desta fase
    typical_weekly_volume_range NUMRANGE NOT NULL, -- faixa de volume semanal (km)
    intensity_distribution JSONB NOT NULL, -- % easy, moderate, hard
    
    -- Ordenação e status
    phase_order INTEGER NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task 1.1.3: Criar tabela user_progress (progressão individual)
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Progressão atual
    current_phase_id INTEGER NOT NULL REFERENCES training_phases(id),
    current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
    current_xp INTEGER NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
    xp_to_next_level INTEGER NOT NULL DEFAULT 100,
    
    -- Estatísticas históricas
    total_xp_earned INTEGER NOT NULL DEFAULT 0,
    total_workouts_completed INTEGER NOT NULL DEFAULT 0,
    total_distance_run NUMERIC(8,2) NOT NULL DEFAULT 0,
    
    -- Streaks e conquistas
    current_streak_days INTEGER NOT NULL DEFAULT 0,
    longest_streak_days INTEGER NOT NULL DEFAULT 0,
    achievements JSONB DEFAULT '[]'::jsonb, -- Array de conquistas desbloqueadas
    
    -- Dados de performance
    best_5k_time VARCHAR(10), -- formato MM:SS
    best_10k_time VARCHAR(10),
    best_half_marathon_time VARCHAR(10),
    best_marathon_time VARCHAR(10),
    
    -- Timestamps importantes
    phase_started_at TIMESTAMPTZ DEFAULT NOW(),
    last_workout_at TIMESTAMPTZ,
    last_level_up_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir um progresso por usuário
    UNIQUE(user_id)
);

-- Task 1.1.4: Criar tabela workout_templates (templates por fase/nível)
CREATE TABLE IF NOT EXISTS workout_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Vinculação com fase/nível
    phase_id INTEGER NOT NULL REFERENCES training_phases(id),
    level_range INT4RANGE NOT NULL, -- níveis para os quais este template se aplica
    
    -- Identificação do treino
    workout_type VARCHAR(50) NOT NULL, -- 'easy_run', 'interval', 'tempo', 'long_run', etc.
    name JSONB NOT NULL, -- {"pt": "Corrida Fácil", "en": "Easy Run", "es": "Carrera Fácil"}
    description JSONB NOT NULL, -- Descrição multilíngue
    
    -- Configuração do treino
    template_data JSONB NOT NULL, -- Estrutura detalhada do treino
    /* Exemplo de template_data:
    {
      "type": "interval",
      "warm_up": {"distance": 1.5, "intensity": "easy"},
      "main_set": {
        "intervals": [
          {"distance": 0.4, "pace_zone": "5k", "rest": {"time": 120, "type": "jog"}}
        ],
        "reps": 5
      },
      "cool_down": {"distance": 1.5, "intensity": "easy"},
      "total_distance_range": [4, 6],
      "estimated_duration": 35
    }
    */
    
    -- Parâmetros de intensidade
    intensity_zone VARCHAR(20) NOT NULL, -- 'recovery', 'easy', 'moderate', 'hard', 'vo2max'
    estimated_duration_minutes INTEGER NOT NULL,
    
    -- Critérios de uso
    prerequisites JSONB DEFAULT '{}'::jsonb, -- Requisitos para usar este template
    contraindications JSONB DEFAULT '[]'::jsonb, -- Quando NÃO usar (lesões, etc.)
    
    -- XP e recompensas
    base_xp_reward INTEGER NOT NULL DEFAULT 0,
    completion_bonus_xp INTEGER NOT NULL DEFAULT 0,
    
    -- Status e ordenação
    is_active BOOLEAN DEFAULT true,
    usage_frequency_weight NUMERIC(3,2) DEFAULT 1.0, -- peso na seleção aleatória
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task 1.1.5: Modificar tabela training_plans para suportar modelo adaptativo
ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS phase_id INTEGER REFERENCES training_phases(id),
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 10),
ADD COLUMN IF NOT EXISTS is_adaptive BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS adaptation_rules JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS weekly_frequency INTEGER DEFAULT 3 CHECK (weekly_frequency >= 1 AND weekly_frequency <= 7);

-- Adicionar campo weekly_frequency se não existir na tabela users também
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 12 AND age <= 100),
ADD COLUMN IF NOT EXISTS sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'other'));

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_age_sex ON user_profiles(age, sex);

-- Índices para training_phases
CREATE INDEX IF NOT EXISTS idx_training_phases_order ON training_phases(phase_order);
CREATE INDEX IF NOT EXISTS idx_training_phases_active ON training_phases(is_active);

-- Índices para user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_phase_level ON user_progress(current_phase_id, current_level);
CREATE INDEX IF NOT EXISTS idx_user_progress_xp ON user_progress(current_xp);
CREATE INDEX IF NOT EXISTS idx_user_progress_streak ON user_progress(current_streak_days);

-- Índices para workout_templates
CREATE INDEX IF NOT EXISTS idx_workout_templates_phase ON workout_templates(phase_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_type ON workout_templates(workout_type);
CREATE INDEX IF NOT EXISTS idx_workout_templates_level_range ON workout_templates USING GIST(level_range);

-- Índices para training_plans (novos campos)
CREATE INDEX IF NOT EXISTS idx_training_plans_phase_level ON training_plans(phase_id, level);
CREATE INDEX IF NOT EXISTS idx_training_plans_adaptive ON training_plans(is_adaptive);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Triggers para as novas tabelas
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_phases_updated_at 
    BEFORE UPDATE ON training_phases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at 
    BEFORE UPDATE ON workout_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS - FASES DE TREINAMENTO
-- =====================================================

INSERT INTO training_phases (name, display_name, description, target_audience, primary_goals, max_level, entry_criteria, exit_criteria, workout_types, typical_weekly_volume_range, intensity_distribution, phase_order) VALUES

-- Fase 1: Fundação
('foundation', 
 '{"pt": "Fundação", "en": "Foundation", "es": "Fundación"}'::jsonb,
 '{"pt": "Estabelecer rotina e construir resistência básica", "en": "Establish routine and build basic endurance", "es": "Establecer rutina y construir resistencia básica"}'::jsonb,
 'Sedentários ou iniciantes absolutos na corrida',
 ARRAY['establish_routine', 'build_basic_endurance', 'prevent_injury'],
 10,
 '{"min_experience_days": 0, "max_continuous_run_minutes": 15}'::jsonb,
 '{"can_run_continuous_minutes": 30, "completed_weeks": 8}'::jsonb,
 ARRAY['walk_run_intervals', 'easy_runs', 'recovery_walks'],
 '[5, 20]'::numrange,
 '{"easy": 80, "moderate": 15, "hard": 5}'::jsonb,
 1),

-- Fase 2: Construção de Resistência  
('endurance_building',
 '{"pt": "Construção de Resistência", "en": "Endurance Building", "es": "Construcción de Resistencia"}'::jsonb,
 '{"pt": "Aumentar distância e melhorar capacidade aeróbica", "en": "Increase distance and improve aerobic capacity", "es": "Aumentar distancia y mejorar capacidad aeróbica"}'::jsonb,
 'Corredores que conseguem correr 30 minutos continuamente',
 ARRAY['increase_distance', 'improve_aerobic_capacity', 'build_running_base'],
 10,
 '{"can_run_continuous_minutes": 30}'::jsonb,
 '{"can_complete_10k": true, "weekly_volume_km": 25}'::jsonb,
 ARRAY['easy_runs', 'long_runs', 'tempo_runs'],
 '[15, 40]'::numrange,
 '{"easy": 70, "moderate": 20, "hard": 10}'::jsonb,
 2),

-- Fase 3: Velocidade e Força
('speed_strength',
 '{"pt": "Velocidade e Força", "en": "Speed & Strength", "es": "Velocidad y Fuerza"}'::jsonb,
 '{"pt": "Melhorar velocidade e fortalecer musculatura", "en": "Improve speed and strengthen muscles", "es": "Mejorar velocidad y fortalecer musculatura"}'::jsonb,
 'Corredores que completaram 10k confortavelmente',
 ARRAY['improve_speed', 'build_strength', 'race_preparation'],
 10,
 '{"can_complete_10k": true}'::jsonb,
 '{"can_complete_half_marathon": true, "improved_5k_time": true}'::jsonb,
 ARRAY['interval_training', 'hill_repeats', 'tempo_runs', 'strength_runs'],
 '[25, 50]'::numrange,
 '{"easy": 60, "moderate": 25, "hard": 15}'::jsonb,
 3),

-- Fase 4: Treinamento Avançado
('advanced_training',
 '{"pt": "Treinamento Avançado", "en": "Advanced Training", "es": "Entrenamiento Avanzado"}'::jsonb,
 '{"pt": "Otimizar desempenho para distâncias longas", "en": "Optimize performance for long distances", "es": "Optimizar rendimiento para distancias largas"}'::jsonb,
 'Corredores com meia-maratona concluída',
 ARRAY['marathon_preparation', 'optimize_performance', 'advanced_periodization'],
 10,
 '{"can_complete_half_marathon": true}'::jsonb,
 '{"can_complete_marathon": true, "personal_records": true}'::jsonb,
 ARRAY['long_runs', 'marathon_pace', 'vo2max_intervals', 'recovery_runs'],
 '[40, 80]'::numrange,
 '{"easy": 65, "moderate": 20, "hard": 15}'::jsonb,
 4),

-- Fase 5: Desempenho de Elite
('elite_performance',
 '{"pt": "Desempenho de Elite", "en": "Elite Performance", "es": "Rendimiento de Elite"}'::jsonb,
 '{"pt": "Ultramaratonas e desempenho competitivo", "en": "Ultramarathons and competitive performance", "es": "Ultramaratones y rendimiento competitivo"}'::jsonb,
 'Corredores experientes com múltiplas maratonas',
 ARRAY['ultra_preparation', 'competitive_performance', 'specialized_training'],
 10,
 '{"completed_marathons": 3, "competitive_times": true}'::jsonb,
 '{"continuous_improvement": true}'::jsonb,
 ARRAY['ultra_long_runs', 'specialized_intervals', 'race_specific', 'recovery_protocols'],
 '[60, 120]'::numrange,
 '{"easy": 70, "moderate": 15, "hard": 15}'::jsonb,
 5)

ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE user_profiles IS 'Perfis expandidos dos usuários com dados detalhados para personalização';
COMMENT ON TABLE training_phases IS 'Fases de treinamento do sistema adaptativo (Fundação, Construção, Velocidade, Avançado, Elite)';
COMMENT ON TABLE user_progress IS 'Progressão individual dos usuários no sistema gamificado (XP, nível, conquistas)';
COMMENT ON TABLE workout_templates IS 'Templates de treinos organizados por fase e nível';

COMMENT ON COLUMN user_profiles.injury_history IS 'Histórico de lesões em formato JSON para personalização de treinos';
COMMENT ON COLUMN user_profiles.fitness_assessments IS 'Avaliações de fitness (VO2 max, zonas de FC, etc.)';
COMMENT ON COLUMN user_progress.achievements IS 'Array JSON de conquistas desbloqueadas pelo usuário';
COMMENT ON COLUMN workout_templates.template_data IS 'Estrutura JSON detalhada do treino (aquecimento, parte principal, volta à calma)';
COMMENT ON COLUMN training_plans.adaptation_rules IS 'Regras JSON para adaptação automática do plano baseada em feedback'; 