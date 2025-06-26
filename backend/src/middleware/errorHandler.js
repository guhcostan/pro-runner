const logger = require('../config/logger.js');
const { i18n } = require('../constants/i18n.js');

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error class
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error class
 */
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error class
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Database error class
 */
class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'DATABASE_ERROR', { originalError: originalError?.message });
    this.name = 'DatabaseError';
  }
}

/**
 * Rate limit error class
 */
class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

/**
 * Get user language from request
 * @param {Object} req - Express request object
 * @returns {string} - Language code
 */
const getUserLanguage = (req) => {
  return req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'pt';
};

/**
 * Get localized error message
 * @param {string} code - Error code
 * @param {string} lang - Language code
 * @returns {string} - Localized message
 */
const getLocalizedMessage = (code, lang) => {
  const messages = i18n[lang] || i18n.pt;
  return messages.errors?.[code] || messages.errors?.INTERNAL_ERROR || 'Erro interno do servidor';
};

/**
 * Format error response based on environment and error type
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @returns {Object} - Formatted error response
 */
const formatErrorResponse = (error, req) => {
  const lang = getUserLanguage(req);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  
  // Base error response
  const errorResponse = {
    error: error.isOperational ? 
      getLocalizedMessage(error.code, lang) : 
      getLocalizedMessage('INTERNAL_ERROR', lang),
    code: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add request ID if available
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  // Add error details in development/test
  if (isDevelopment || isTest) {
    errorResponse.message = error.message;
    errorResponse.stack = error.stack;
    
    if (error.details && Object.keys(error.details).length > 0) {
      errorResponse.details = error.details;
    }
  }

  // Add validation details for validation errors
  if (error instanceof ValidationError && error.details) {
    errorResponse.validation = error.details;
  }

  return errorResponse;
};

/**
 * Handle Supabase/PostgreSQL errors
 * @param {Error} error - Supabase error
 * @returns {AppError} - Formatted app error
 */
const handleSupabaseError = (error) => {
  // Handle common Supabase error codes
  switch (error.code) {
    case 'PGRST116':
      return new NotFoundError();
    case 'PGRST301':
      return new ValidationError('Invalid request parameters');
    case '23505':
      return new ValidationError('Duplicate entry - resource already exists');
    case '23503':
      return new ValidationError('Referenced resource does not exist');
    case '23514':
      return new ValidationError('Data violates database constraints');
    case '42P01':
      return new DatabaseError('Database table not found');
    case '42703':
      return new DatabaseError('Database column not found');
    default:
      return new DatabaseError('Database operation failed', error);
  }
};

/**
 * Handle JWT errors
 * @param {Error} error - JWT error
 * @returns {AppError} - Formatted app error
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Token not active');
  }
  return new AuthenticationError('Authentication failed');
};

/**
 * Handle validation errors from Joi or similar
 * @param {Error} error - Validation error
 * @returns {AppError} - Formatted app error
 */
const handleValidationError = (error) => {
  const details = {};
  
  if (error.details) {
    error.details.forEach(detail => {
      const field = detail.path.join('.');
      details[field] = detail.message;
    });
  }
  
  return new ValidationError('Validation failed', details);
};

/**
 * Main error handling middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (error, req, res, next) => {
  let appError = error;

  // Convert known error types to AppError
  if (!(error instanceof AppError)) {
    // Handle Supabase errors
    if (error.code && (error.code.startsWith('PGRST') || error.code.match(/^\d+$/))) {
      appError = handleSupabaseError(error);
    }
    // Handle JWT errors
    else if (error.name && error.name.includes('Token')) {
      appError = handleJWTError(error);
    }
    // Handle validation errors (Joi, express-validator, etc.)
    else if (error.isJoi || error.name === 'ValidationError') {
      appError = handleValidationError(error);
    }
    // Handle syntax errors
    else if (error instanceof SyntaxError) {
      appError = new ValidationError('Invalid JSON format');
    }
    // Handle generic errors
    else {
      appError = new AppError(
        process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  // Log the error
  const logContext = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    requestId: req.id || 'unknown',
    statusCode: appError.statusCode,
  };

  if (appError.statusCode >= 500) {
    logger.logError(error, logContext);
  } else if (appError.statusCode >= 400) {
    logger.warn('Client Error', { ...logContext, error: appError.message });
  }

  // Security logging for authentication/authorization errors
  if (appError instanceof AuthenticationError || appError instanceof AuthorizationError) {
    logger.logSecurityEvent(appError.name, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      userId: req.user?.id || 'anonymous',
    });
  }

  // Format and send error response
  const errorResponse = formatErrorResponse(appError, req);
  res.status(appError.statusCode).json(errorResponse);
};

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Route');
  next(error);
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async route handler
 * @returns {Function} - Wrapped handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create error constants file for i18n
 */
const createErrorConstants = () => {
  return {
    pt: {
      errors: {
        INTERNAL_ERROR: 'Erro interno do servidor',
        VALIDATION_ERROR: 'Dados inválidos',
        AUTHENTICATION_ERROR: 'Autenticação necessária',
        AUTHORIZATION_ERROR: 'Permissões insuficientes',
        NOT_FOUND: 'Recurso não encontrado',
        DATABASE_ERROR: 'Erro no banco de dados',
        RATE_LIMIT_ERROR: 'Limite de requisições excedido',
      }
    },
    en: {
      errors: {
        INTERNAL_ERROR: 'Internal server error',
        VALIDATION_ERROR: 'Invalid data',
        AUTHENTICATION_ERROR: 'Authentication required',
        AUTHORIZATION_ERROR: 'Insufficient permissions',
        NOT_FOUND: 'Resource not found',
        DATABASE_ERROR: 'Database error',
        RATE_LIMIT_ERROR: 'Rate limit exceeded',
      }
    },
    es: {
      errors: {
        INTERNAL_ERROR: 'Error interno del servidor',
        VALIDATION_ERROR: 'Datos inválidos',
        AUTHENTICATION_ERROR: 'Autenticación requerida',
        AUTHORIZATION_ERROR: 'Permisos insuficientes',
        NOT_FOUND: 'Recurso no encontrado',
        DATABASE_ERROR: 'Error de base de datos',
        RATE_LIMIT_ERROR: 'Límite de solicitudes excedido',
      }
    }
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  RateLimitError,
  createErrorConstants,
}; 