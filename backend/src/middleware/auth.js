const { supabase } = require('../config/supabase.js');

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso necessário',
        message: 'Forneça um token válido no cabeçalho Authorization'
      });
    }

    // Verifica o token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'O token fornecido é inválido ou expirou'
      });
    }

    // Adiciona o usuário autenticado ao objeto request
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Erro interno de autenticação',
      message: 'Não foi possível verificar o token'
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Adiciona o usuário se o token for válido, mas não bloqueia se não for
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Não bloqueia a requisição em caso de erro
    next();
  }
};

/**
 * Middleware de rate limiting simples
 * Limita o número de requests por IP
 */
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpa requests antigas
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    }

    const currentRequests = requests.get(ip) || [];

    if (currentRequests.length >= max) {
      return res.status(429).json({
        error: 'Muitas tentativas',
        message: `Limite de ${max} requests por ${windowMs / 60000} minutos excedido`,
        retryAfter: Math.ceil((currentRequests[0] - windowStart) / 1000)
      });
    }

    // Adiciona a request atual
    currentRequests.push(now);
    requests.set(ip, currentRequests);

    next();
  };
};

/**
 * Middleware para validar role do usuário
 */
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Usuário não autenticado'
        });
      }

      // Busca informações extras do usuário se necessário
      const userRole = req.user.user_metadata?.role || 'user';

      if (userRole !== requiredRole && requiredRole !== 'user') {
        return res.status(403).json({
          error: 'Permissão insuficiente',
          message: `Acesso restrito para usuários com role: ${requiredRole}`
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        error: 'Erro ao verificar permissões'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  createRateLimit,
  requireRole
}; 