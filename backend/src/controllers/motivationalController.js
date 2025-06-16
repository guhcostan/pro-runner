const supabase = require('../config/supabase');

// Fallback quotes in memory (caso o banco não esteja configurado ainda)
const fallbackQuotes = {
  pt: [
    '🏃‍♂️ Cada passo te leva mais perto do seu objetivo!',
    '💪 O único treino ruim é aquele que você não fez.',
    '🌟 Você é mais forte do que suas desculpas.',
    '🎯 Foque no progresso, não na perfeição.',
    '🔥 A dor é temporária, a satisfação é para sempre.',
    '⚡ Seus limites são apenas a sua mente.',
    '🚀 Comece devagar, mas não pare jamais.',
    '💎 Grandes resultados exigem grandes esforços.',
    '🌅 Cada manhã é uma nova oportunidade de ser melhor.',
    '🏆 Champions são feitos quando ninguém está olhando.',
    '💫 Acredite em você e todo o resto se encaixa.',
    '🎪 A jornada de mil quilômetros começa com um passo.',
    '⭐ Você não precisa ser perfeito, apenas constante.',
    '🌈 Após a tempestade, sempre vem o arco-íris.',
    '🔋 Energia que você não usa hoje, você perde para sempre.',
    '🌊 Seja como a água: persistente e imparável.',
    '🎨 Pinte sua vida com cores vibrantes através do esporte.',
    '🌸 Floresça onde você foi plantado, mesmo que seja difícil.',
    '🎵 Encontre seu ritmo e dance com a vida.',
    '🌟 Cada pequeno progresso merece ser celebrado.',
    '🏔️ As montanhas não se movem por si, mas você pode escalá-las.',
    '🔥 Transforme sua paixão em propósito.',
    '💝 O melhor investimento é em você mesmo.',
    '🌍 Seja a mudança que você quer ver no mundo.',
    '⚡ A velocidade não importa tanto quanto a direção.',
    '🎯 Mire na lua, mesmo se errar cairá entre as estrelas.',
    '🌟 Sua única competição é quem você foi ontem.',
    '🦋 Metamorfose acontece fora da zona de conforto.',
    '🌺 Cultive paciência, os resultados estão crescendo.',
    '🎊 Celebre cada vitória, por menor que seja.',
  ],
  en: [
    '🏃‍♂️ Every step takes you closer to your goal!',
    '💪 The only bad workout is the one you didn\'t do.',
    '🌟 You are stronger than your excuses.',
    '🎯 Focus on progress, not perfection.',
    '🔥 Pain is temporary, satisfaction is forever.',
    '⚡ Your limits are just your mind.',
    '🚀 Start slow, but never stop.',
    '💎 Great results require great efforts.',
    '🌅 Every morning is a new opportunity to be better.',
    '🏆 Champions are made when nobody is watching.',
    '💫 Believe in yourself and everything else falls into place.',
    '🎪 The journey of a thousand miles begins with one step.',
    '⭐ You don\'t need to be perfect, just consistent.',
    '🌈 After the storm, there\'s always a rainbow.',
    '🔋 Energy you don\'t use today, you lose forever.',
    '🌊 Be like water: persistent and unstoppable.',
    '🎨 Paint your life with vibrant colors through sport.',
    '🌸 Bloom where you are planted, even if it\'s difficult.',
    '🎵 Find your rhythm and dance with life.',
    '🌟 Every small progress deserves to be celebrated.',
    '🏔️ Mountains don\'t move by themselves, but you can climb them.',
    '🔥 Transform your passion into purpose.',
    '💝 The best investment is in yourself.',
    '🌍 Be the change you want to see in the world.',
    '⚡ Speed doesn\'t matter as much as direction.',
    '🎯 Aim for the moon, even if you miss you\'ll land among the stars.',
    '🌟 Your only competition is who you were yesterday.',
    '🦋 Metamorphosis happens outside the comfort zone.',
    '🌺 Cultivate patience, results are growing.',
    '🎊 Celebrate every victory, no matter how small.',
  ]
};

const getDailyQuote = async (req, res) => {
  try {
    const { language = 'pt' } = req.query;
    
    try {
      // Tenta usar o banco primeiro
      const { data, error } = await supabase.rpc('get_daily_quote', {
        user_language: language
      });
      
      if (!error && data && data.length > 0) {
        const result = data[0];
        return res.json({
          success: true,
          data: {
            quote: result.quote,
            date: result.date,
            language: result.language
          }
        });
      }
    } catch (dbError) {
      console.log('Database fallback, using in-memory quotes');
    }
    
    // Fallback para quotes em memória
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const quotes = fallbackQuotes[language] || fallbackQuotes.pt;
    const quoteIndex = dayOfYear % quotes.length;
    const quote = quotes[quoteIndex];
    
    res.json({
      success: true,
      data: {
        quote,
        date: today.toISOString().split('T')[0],
        language
      }
    });
  } catch (error) {
    console.error('Error getting daily quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get daily quote'
    });
  }
};

const getRandomQuote = async (req, res) => {
  try {
    const { language = 'pt' } = req.query;
    
    try {
      // Tenta usar o banco primeiro
      const { data, error } = await supabase.rpc('get_random_quote', {
        user_language: language
      });
      
      if (!error && data && data.length > 0) {
        const result = data[0];
        return res.json({
          success: true,
          data: {
            quote: result.quote,
            language: result.language
          }
        });
      }
    } catch (dbError) {
      console.log('Database fallback, using in-memory quotes');
    }
    
    // Fallback para quotes em memória
    const quotes = fallbackQuotes[language] || fallbackQuotes.pt;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    res.json({
      success: true,
      data: {
        quote,
        language
      }
    });
  } catch (error) {
    console.error('Error getting random quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get random quote'
    });
  }
};

module.exports = {
  getDailyQuote,
  getRandomQuote
}; 