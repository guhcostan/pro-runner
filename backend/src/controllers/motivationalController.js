const supabase = require('../config/supabase');

const getDailyQuote = async (req, res) => {
  try {
    const { language = 'pt' } = req.query;
    
    // Use database function to get daily quote
    const { data, error } = await supabase.rpc('get_daily_quote', {
      user_language: language
    });
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      // Fallback if no quotes found
      res.json({
        success: true,
        data: {
          quote: language === 'en' 
            ? '🌟 You are stronger than your excuses.' 
            : '🌟 Você é mais forte do que suas desculpas.',
          date: new Date().toISOString().split('T')[0],
          language
        }
      });
      return;
    }
    
    const result = data[0];
    res.json({
      success: true,
      data: {
        quote: result.quote,
        date: result.date,
        language: result.language
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
    
    // Use database function to get random quote
    const { data, error } = await supabase.rpc('get_random_quote', {
      user_language: language
    });
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      // Fallback if no quotes found
      res.json({
        success: true,
        data: {
          quote: language === 'en' 
            ? '🌟 You are stronger than your excuses.' 
            : '🌟 Você é mais forte do que suas desculpas.',
          language
        }
      });
      return;
    }
    
    const result = data[0];
    res.json({
      success: true,
      data: {
        quote: result.quote,
        language: result.language
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