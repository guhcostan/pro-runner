const request = require('supertest');
const app = require('../../src/index.js');

// Mock do módulo supabase
jest.mock('../../src/config/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));

const { supabase: mockSupabase } = require('../../src/config/supabase.js');

describe('Authentication Routes Integration', () => {
  let validToken = 'Bearer valid_jwt_token';
  let invalidToken = 'Bearer invalid_jwt_token';
  
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: { role: 'user' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Routes', () => {
    describe('POST /api/users', () => {
      it('should allow creating user without authentication (optionalAuth)', async () => {
        const userData = {
          name: 'Test User',
          height: 175,
          weight: 70,
          personal_record_5k: '25:00',
          goal: 'start_running'
        };

        const response = await request(app)
          .post('/api/users')
          .send(userData);

        // Should not return 401, even without token
        expect(response.status).not.toBe(401);
      });

      it('should work with valid token (optionalAuth)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        });

        const userData = {
          name: 'Test User',
          height: 175,
          weight: 70,
          personal_record_5k: '25:00',
          goal: 'start_running',
          auth_user_id: 'user-123'
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', validToken)
          .send(userData);

        expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('valid_jwt_token');
        // Should not return 401
        expect(response.status).not.toBe(401);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should return 401 without token', async () => {
        const response = await request(app)
          .get('/api/users/user-123');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          error: 'Token de acesso necessário',
          message: 'Forneça um token válido no cabeçalho Authorization'
        });
      });

      it('should return 401 with invalid token', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token' }
        });

        const response = await request(app)
          .get('/api/users/user-123')
          .set('Authorization', invalidToken);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          error: 'Token inválido',
          message: 'O token fornecido é inválido ou expirou'
        });
      });

      it('should work with valid token', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        });

        const response = await request(app)
          .get('/api/users/user-123')
          .set('Authorization', validToken);

        expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('valid_jwt_token');
        // Should not return 401
        expect(response.status).not.toBe(401);
      });
    });

    describe('GET /api/users/auth/:authUserId', () => {
      it('should return 401 without token', async () => {
        const response = await request(app)
          .get('/api/users/auth/user-123');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token de acesso necessário');
      });

      it('should work with valid token', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        });

        const response = await request(app)
          .get('/api/users/auth/user-123')
          .set('Authorization', validToken);

        expect(response.status).not.toBe(401);
      });
    });
  });

  describe('Plan Routes', () => {
    describe('POST /api/plans', () => {
      it('should return 401 without token', async () => {
        const planData = {
          userId: 'user-123',
          force: false
        };

        const response = await request(app)
          .post('/api/plans')
          .send(planData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token de acesso necessário');
      });

      it('should return 401 with invalid token', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token' }
        });

        const planData = {
          userId: 'user-123',
          force: false
        };

        const response = await request(app)
          .post('/api/plans')
          .set('Authorization', invalidToken)
          .send(planData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token inválido');
      });

      it('should work with valid token', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        });

        const planData = {
          userId: 'user-123',
          force: false
        };

        const response = await request(app)
          .post('/api/plans')
          .set('Authorization', validToken)
          .send(planData);

        expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('valid_jwt_token');
        expect(response.status).not.toBe(401);
      });
    });

    describe('GET /api/plans/user/:userId', () => {
      it('should return 401 without token', async () => {
        const response = await request(app)
          .get('/api/plans/user/user-123');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token de acesso necessário');
      });

      it('should work with valid token', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        });

        const response = await request(app)
          .get('/api/plans/user/user-123')
          .set('Authorization', validToken);

        expect(response.status).not.toBe(401);
      });
    });

    describe('PUT /api/plans/:planId/progress', () => {
      it('should return 401 without token', async () => {
        const progressData = {
          week: 1,
          workoutIndex: 0,
          completed: true
        };

        const response = await request(app)
          .put('/api/plans/plan-123/progress')
          .send(progressData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token de acesso necessário');
      });

      it('should work with valid token', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null
        });

        const progressData = {
          week: 1,
          workoutIndex: 0,
          completed: true
        };

        const response = await request(app)
          .put('/api/plans/plan-123/progress')
          .set('Authorization', validToken)
          .send(progressData);

        expect(response.status).not.toBe(401);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to user routes', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Make many requests to test rate limiting
      const requests = Array(25).fill().map(() => 
        request(app)
          .get('/api/users/user-123')
          .set('Authorization', validToken)
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should apply rate limiting to plan routes', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Make many requests to test rate limiting
      const requests = Array(35).fill().map(() => 
        request(app)
          .get('/api/plans/user/user-123')
          .set('Authorization', validToken)
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Public Routes', () => {
    it('should allow access to health endpoint without auth', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should allow access to motivational endpoints without auth', async () => {
      const response = await request(app)
        .get('/api/motivational/daily');

      // Should not return 401 (may return other errors based on implementation)
      expect(response.status).not.toBe(401);
    });
  });
}); 