const request = require('supertest');
const express = require('express');
const { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  RateLimitError
} = require('../../src/middleware/errorHandler.js');

// Mock logger
jest.mock('../../src/config/logger.js', () => ({
  logError: jest.fn(),
  warn: jest.fn(),
  logSecurityEvent: jest.fn()
}));

// Mock i18n
jest.mock('../../src/constants/i18n.js', () => ({
  i18n: {
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
    }
  }
}));

describe('Error Handler Middleware', () => {
  let app;
  let logger;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Import logger mock
    logger = require('../../src/config/logger.js');
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Custom Error Classes', () => {
    test('AppError should create error with correct properties', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR', { field: 'value' });
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'value' });
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    test('ValidationError should create 400 error', () => {
      const error = new ValidationError('Invalid input', { field: 'required' });
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'required' });
      expect(error.name).toBe('ValidationError');
    });

    test('AuthenticationError should create 401 error', () => {
      const error = new AuthenticationError('Token expired');
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Token expired');
      expect(error.name).toBe('AuthenticationError');
    });

    test('AuthorizationError should create 403 error', () => {
      const error = new AuthorizationError('Access denied');
      
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('AuthorizationError');
    });

    test('NotFoundError should create 404 error', () => {
      const error = new NotFoundError('User');
      
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('User not found');
      expect(error.name).toBe('NotFoundError');
    });

    test('DatabaseError should create 500 error', () => {
      const originalError = new Error('Connection failed');
      const error = new DatabaseError('Database operation failed', originalError);
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.details.originalError).toBe('Connection failed');
      expect(error.name).toBe('DatabaseError');
    });

    test('RateLimitError should create 429 error', () => {
      const error = new RateLimitError('Too many requests');
      
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.message).toBe('Too many requests');
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('Error Handler Function', () => {
    test('should handle AppError correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new ValidationError('Invalid data', { field: 'email' }));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        validation: { field: 'email' }
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/test');
      expect(response.body.method).toBe('GET');
    });

    test('should handle Supabase errors', async () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Duplicate key');
        error.code = '23505';
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(logger.warn).toHaveBeenCalled();
    });

    test('should handle JWT errors', async () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(401);

      expect(response.body.code).toBe('AUTHENTICATION_ERROR');
      expect(logger.logSecurityEvent).toHaveBeenCalled();
    });

    test('should handle validation errors from Joi', async () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Validation failed');
        error.isJoi = true;
        error.details = [
          { path: ['email'], message: 'Email is required' },
          { path: ['password'], message: 'Password too short' }
        ];
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.validation).toEqual({
        email: 'Email is required',
        password: 'Password too short'
      });
    });

    test('should handle syntax errors', async () => {
      app.post('/test', (req, res, next) => {
        next(new SyntaxError('Unexpected token'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    test('should handle generic errors', async () => {
      app.get('/test', (req, res, next) => {
        next(new Error('Something went wrong'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.code).toBe('INTERNAL_ERROR');
      expect(logger.logError).toHaveBeenCalled();
    });

    test('should log security events for auth errors', async () => {
      app.get('/test', (req, res, next) => {
        next(new AuthenticationError('Invalid token'));
      });
      app.use(errorHandler);

      await request(app)
        .get('/test')
        .expect(401);

      expect(logger.logSecurityEvent).toHaveBeenCalledWith(
        'AuthenticationError',
        expect.objectContaining({
          url: '/test'
        })
      );
    });

    test('should include error details in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.get('/test', (req, res, next) => {
        next(new Error('Test error'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.message).toBe('Test error');
      expect(response.body.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    test('should hide error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.get('/test', (req, res, next) => {
        next(new Error('Test error'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.message).toBeUndefined();
      expect(response.body.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle different languages', async () => {
      app.get('/test', (req, res, next) => {
        next(new ValidationError('Invalid data'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .set('Accept-Language', 'en-US,en;q=0.9')
        .expect(400);

      expect(response.body.error).toBe('Invalid data');
    });
  });

  describe('Not Found Handler', () => {
    test('should handle 404 errors', async () => {
      app.use(notFoundHandler);
      app.use(errorHandler);

      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.error).toBe('Recurso não encontrado');
    });
  });

  describe('Async Handler', () => {
    test('should catch async errors', async () => {
      const asyncRoute = asyncHandler(async (req, res, next) => {
        throw new ValidationError('Async error');
      });

      app.get('/test', asyncRoute);
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    test('should handle successful async operations', async () => {
      const asyncRoute = asyncHandler(async (req, res) => {
        res.json({ success: true });
      });

      app.get('/test', asyncRoute);

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle promise rejections', async () => {
      const asyncRoute = asyncHandler(async (req, res) => {
        return Promise.reject(new Error('Promise rejected'));
      });

      app.get('/test', asyncRoute);
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Error Logging', () => {
    test('should log 5xx errors', async () => {
      app.get('/test', (req, res, next) => {
        next(new Error('Server error'));
      });
      app.use(errorHandler);

      await request(app)
        .get('/test')
        .expect(500);

      expect(logger.logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          statusCode: 500,
          url: '/test',
          method: 'GET'
        })
      );
    });

    test('should log 4xx errors as warnings', async () => {
      app.get('/test', (req, res, next) => {
        next(new ValidationError('Bad request'));
      });
      app.use(errorHandler);

      await request(app)
        .get('/test')
        .expect(400);

      expect(logger.warn).toHaveBeenCalledWith(
        'Client Error',
        expect.objectContaining({
          statusCode: 400,
          url: '/test',
          method: 'GET'
        })
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined errors', async () => {
      app.get('/test', (req, res, next) => {
        next(new Error()); // Empty error message
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.code).toBe('INTERNAL_ERROR');
    });

    test('should handle errors without message', async () => {
      app.get('/test', (req, res, next) => {
        const error = new Error();
        error.message = '';
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.code).toBe('INTERNAL_ERROR');
    });

    test('should handle request ID when available', async () => {
      app.use((req, res, next) => {
        req.id = 'test-request-id';
        next();
      });
      
      app.get('/test', (req, res, next) => {
        next(new ValidationError('Test error'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(400);

      expect(response.body.requestId).toBe('test-request-id');
    });
  });
}); 