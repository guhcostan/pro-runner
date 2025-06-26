const { 
  authenticateToken, 
  optionalAuth, 
  createRateLimit, 
  requireRole 
} = require('../../src/middleware/auth.js');

// Mock do módulo supabase
jest.mock('../../src/config/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

const { supabase: mockSupabase } = require('../../src/config/supabase.js');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should return 401 when no authorization header is provided', async () => {
      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token de acesso necessário',
        message: 'Forneça um token válido no cabeçalho Authorization'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided in authorization header', async () => {
      mockReq.headers.authorization = 'Bearer ';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token de acesso necessário',
        message: 'Forneça um token válido no cabeçalho Authorization'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid_token';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token inválido',
        message: 'O token fornecido é inválido ou expirou'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is null', async () => {
      mockReq.headers.authorization = 'Bearer valid_token';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token inválido',
        message: 'O token fornecido é inválido ou expirou'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next and set user when token is valid', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockReq.headers.authorization = 'Bearer valid_token';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 500 when an unexpected error occurs', async () => {
      mockReq.headers.authorization = 'Bearer valid_token';
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Database connection error'));

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno de autenticação',
        message: 'Não foi possível verificar o token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should call next without setting user when no authorization header', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should call next without setting user when no token in header', async () => {
      mockReq.headers.authorization = 'Bearer ';

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should set user and call next when token is valid', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockReq.headers.authorization = 'Bearer valid_token';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should call next without setting user when token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid_token';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should call next without setting user when an error occurs', async () => {
      mockReq.headers.authorization = 'Bearer valid_token';
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'));

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('createRateLimit', () => {
    let rateLimitMiddleware;

    beforeEach(() => {
      // Create a fresh rate limit middleware for each test
      rateLimitMiddleware = createRateLimit(60000, 2); // 2 requests per minute for testing
    });

    it('should allow requests under the limit', () => {
      rateLimitMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should block requests over the limit', () => {
      // Make 3 requests (limit is 2)
      rateLimitMiddleware(mockReq, mockRes, mockNext);
      rateLimitMiddleware(mockReq, mockRes, mockNext);
      rateLimitMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Muitas tentativas',
          message: expect.stringContaining('Limite de 2 requests por 1 minutos excedido')
        })
      );
    });

    it('should reset limit after time window', (done) => {
      const shortRateLimit = createRateLimit(50, 1); // 1 request per 50ms

      // First request should succeed
      shortRateLimit(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request should fail
      shortRateLimit(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(429);

      // After time window, should succeed again
      setTimeout(() => {
        mockRes.status.mockClear();
        mockRes.json.mockClear();
        shortRateLimit(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(2);
        expect(mockRes.status).not.toHaveBeenCalled();
        done();
      }, 60); // Wait a bit longer than the window
    });

    it('should handle different IPs independently', () => {
      const anotherReq = { ...mockReq, ip: '192.168.1.1' };

      // Make requests from first IP
      rateLimitMiddleware(mockReq, mockRes, mockNext);
      rateLimitMiddleware(mockReq, mockRes, mockNext);

      // First IP should be at limit
      rateLimitMiddleware(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(429);

      // Second IP should still work
      mockRes.status.mockClear();
      rateLimitMiddleware(anotherReq, mockRes, mockNext);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(3);
    });
  });

  describe('requireRole', () => {
    it('should return 401 when user is not authenticated', async () => {
      const roleMiddleware = requireRole('admin');

      await roleMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next when user has required role', async () => {
      const roleMiddleware = requireRole('admin');
      mockReq.user = {
        id: 'user-123',
        user_metadata: { role: 'admin' }
      };

      await roleMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should call next when requiring user role (default)', async () => {
      const roleMiddleware = requireRole('user');
      mockReq.user = {
        id: 'user-123',
        user_metadata: {}
      };

      await roleMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', async () => {
      const roleMiddleware = requireRole('admin');
      mockReq.user = {
        id: 'user-123',
        user_metadata: { role: 'user' }
      };

      await roleMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Permissão insuficiente',
        message: 'Acesso restrito para usuários com role: admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 when an error occurs', async () => {
      const roleMiddleware = requireRole('admin');
      mockReq.user = {
        id: 'user-123',
        get user_metadata() {
          throw new Error('Metadata error');
        }
      };

      await roleMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro ao verificar permissões'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 