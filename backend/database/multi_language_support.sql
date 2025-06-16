-- Multi-language support migration
-- Add language preference to users table
ALTER TABLE users ADD COLUMN language VARCHAR(5) DEFAULT 'pt';

-- Create motivational_quotes table
CREATE TABLE IF NOT EXISTS motivational_quotes (
  id SERIAL PRIMARY KEY,
  quote TEXT NOT NULL,
  language VARCHAR(5) NOT NULL DEFAULT 'pt',
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_motivational_quotes_language ON motivational_quotes(language);
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);

-- Add RLS policies for motivational_quotes
ALTER TABLE motivational_quotes ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to read motivational quotes
CREATE POLICY "Everyone can read motivational quotes"
ON motivational_quotes FOR SELECT
USING (true);

-- Policy to allow authenticated users to create motivational quotes (admin only)
CREATE POLICY "Authenticated users can insert motivational quotes"
ON motivational_quotes FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Add language support to training_plans table
ALTER TABLE training_plans ADD COLUMN language VARCHAR(5) DEFAULT 'pt';

-- Create translations table for dynamic content
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL,
  value TEXT NOT NULL,
  context VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(key, language)
);

-- Add indexes for translations
CREATE INDEX IF NOT EXISTS idx_translations_key_language ON translations(key, language);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language);

-- Enable RLS for translations
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to read translations
CREATE POLICY "Everyone can read translations"
ON translations FOR SELECT
USING (true);

-- Policy to allow authenticated users to manage translations (admin only)
CREATE POLICY "Authenticated users can manage translations"
ON translations FOR ALL
WITH CHECK (auth.role() = 'authenticated');

-- Insert some sample Portuguese motivational quotes
INSERT INTO motivational_quotes (quote, language, category) VALUES
('🏃‍♂️ Cada passo te leva mais perto do seu objetivo!', 'pt', 'motivation'),
('💪 O único treino ruim é aquele que você não fez.', 'pt', 'motivation'),
('🌟 Você é mais forte do que suas desculpas.', 'pt', 'motivation'),
('🎯 Foque no progresso, não na perfeição.', 'pt', 'motivation'),
('🔥 A dor é temporária, a satisfação é para sempre.', 'pt', 'motivation'),
('⚡ Seus limites são apenas a sua mente.', 'pt', 'motivation'),
('🚀 Comece devagar, mas não pare jamais.', 'pt', 'motivation'),
('💎 Grandes resultados exigem grandes esforços.', 'pt', 'motivation'),
('🌅 Cada manhã é uma nova oportunidade de ser melhor.', 'pt', 'motivation'),
('🏆 Champions são feitos quando ninguém está olhando.', 'pt', 'motivation'),
('💫 Acredite em você e todo o resto se encaixa.', 'pt', 'motivation'),
('🎪 A jornada de mil quilômetros começa com um passo.', 'pt', 'motivation'),
('⭐ Você não precisa ser perfeito, apenas constante.', 'pt', 'motivation'),
('🌈 Após a tempestade, sempre vem o arco-íris.', 'pt', 'motivation'),
('🔋 Energia que você não usa hoje, você perde para sempre.', 'pt', 'motivation'),
('🌊 Seja como a água: persistente e imparável.', 'pt', 'motivation'),
('🎨 Pinte sua vida com cores vibrantes através do esporte.', 'pt', 'motivation'),
('🌸 Floresça onde você foi plantado, mesmo que seja difícil.', 'pt', 'motivation'),
('🎵 Encontre seu ritmo e dance com a vida.', 'pt', 'motivation'),
('🌟 Cada pequeno progresso merece ser celebrado.', 'pt', 'motivation'),
('🏔️ As montanhas não se movem por si, mas você pode escalá-las.', 'pt', 'motivation'),
('🔥 Transforme sua paixão em propósito.', 'pt', 'motivation'),
('💝 O melhor investimento é em você mesmo.', 'pt', 'motivation'),
('🌍 Seja a mudança que você quer ver no mundo.', 'pt', 'motivation'),
('⚡ A velocidade não importa tanto quanto a direção.', 'pt', 'motivation'),
('🎯 Mire na lua, mesmo se errar cairá entre as estrelas.', 'pt', 'motivation'),
('🌟 Sua única competição é quem você foi ontem.', 'pt', 'motivation'),
('🦋 Metamorfose acontece fora da zona de conforto.', 'pt', 'motivation'),
('🌺 Cultive paciência, os resultados estão crescendo.', 'pt', 'motivation'),
('🎊 Celebre cada vitória, por menor que seja.', 'pt', 'motivation');

-- Insert English motivational quotes
INSERT INTO motivational_quotes (quote, language, category) VALUES
('🏃‍♂️ Every step takes you closer to your goal!', 'en', 'motivation'),
('💪 The only bad workout is the one you didn''t do.', 'en', 'motivation'),
('🌟 You are stronger than your excuses.', 'en', 'motivation'),
('🎯 Focus on progress, not perfection.', 'en', 'motivation'),
('🔥 Pain is temporary, satisfaction is forever.', 'en', 'motivation'),
('⚡ Your limits are just your mind.', 'en', 'motivation'),
('🚀 Start slow, but never stop.', 'en', 'motivation'),
('💎 Great results require great efforts.', 'en', 'motivation'),
('🌅 Every morning is a new opportunity to be better.', 'en', 'motivation'),
('🏆 Champions are made when nobody is watching.', 'en', 'motivation'),
('💫 Believe in yourself and everything else falls into place.', 'en', 'motivation'),
('🎪 The journey of a thousand miles begins with one step.', 'en', 'motivation'),
('⭐ You don''t need to be perfect, just consistent.', 'en', 'motivation'),
('🌈 After the storm, there''s always a rainbow.', 'en', 'motivation'),
('🔋 Energy you don''t use today, you lose forever.', 'en', 'motivation'),
('🌊 Be like water: persistent and unstoppable.', 'en', 'motivation'),
('🎨 Paint your life with vibrant colors through sport.', 'en', 'motivation'),
('🌸 Bloom where you are planted, even if it''s difficult.', 'en', 'motivation'),
('🎵 Find your rhythm and dance with life.', 'en', 'motivation'),
('🌟 Every small progress deserves to be celebrated.', 'en', 'motivation'),
('🏔️ Mountains don''t move by themselves, but you can climb them.', 'en', 'motivation'),
('🔥 Transform your passion into purpose.', 'en', 'motivation'),
('💝 The best investment is in yourself.', 'en', 'motivation'),
('🌍 Be the change you want to see in the world.', 'en', 'motivation'),
('⚡ Speed doesn''t matter as much as direction.', 'en', 'motivation'),
('🎯 Aim for the moon, even if you miss you''ll land among the stars.', 'en', 'motivation'),
('🌟 Your only competition is who you were yesterday.', 'en', 'motivation'),
('🦋 Metamorphosis happens outside the comfort zone.', 'en', 'motivation'),
('🌺 Cultivate patience, results are growing.', 'en', 'motivation'),
('🎊 Celebrate every victory, no matter how small.', 'en', 'motivation');

-- Insert some basic translations
INSERT INTO translations (key, language, value, context) VALUES
('welcome', 'pt', 'Bem-vindo', 'general'),
('welcome', 'en', 'Welcome', 'general'),
('loading', 'pt', 'Carregando...', 'general'),
('loading', 'en', 'Loading...', 'general'),
('error', 'pt', 'Erro', 'general'),
('error', 'en', 'Error', 'general'),
('success', 'pt', 'Sucesso', 'general'),
('success', 'en', 'Success', 'general'),
('today', 'pt', 'Hoje', 'tabs'),
('today', 'en', 'Today', 'tabs'),
('plan', 'pt', 'Plano', 'tabs'),
('plan', 'en', 'Plan', 'tabs'),
('progress', 'pt', 'Progresso', 'tabs'),
('progress', 'en', 'Progress', 'tabs'),
('profile', 'pt', 'Perfil', 'tabs'),
('profile', 'en', 'Profile', 'tabs');

-- Create function to get daily quote
CREATE OR REPLACE FUNCTION get_daily_quote(user_language VARCHAR(5) DEFAULT 'pt')
RETURNS TABLE(quote TEXT, language VARCHAR(5), date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.quote,
    q.language,
    CURRENT_DATE as date
  FROM motivational_quotes q
  WHERE q.language = user_language
  ORDER BY (EXTRACT(DOY FROM CURRENT_DATE) + q.id) % (SELECT COUNT(*) FROM motivational_quotes WHERE language = user_language)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to get random quote
CREATE OR REPLACE FUNCTION get_random_quote(user_language VARCHAR(5) DEFAULT 'pt')
RETURNS TABLE(quote TEXT, language VARCHAR(5)) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.quote,
    q.language
  FROM motivational_quotes q
  WHERE q.language = user_language
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql; 