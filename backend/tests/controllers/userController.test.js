const request = require('supertest');
const app = require('../../src/index');

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
          single: jest.fn(() => Promise.resolve({ 
            data: { 
              id: 'test-user-id', 
              name: 'João Silva',
              height: 175,
              weight: 70.5,
              personal_record_5k: '25:30',
              goal: 'improve_time',
              weekly_frequency: 3,
              auth_user_id: 'test-auth-id'
            }, 
            error: null 
          }))
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

describe('User Controller', () => {
  let testUserId;
  let testAuthUserId;
  const validToken = 'Bearer valid_jwt_token';
  const mockUser = {
    id: 'test-auth-id',
    email: 'test@example.com',
    user_metadata: { role: 'user' }
  };

  beforeAll(() => {
    // Set up test data with unique UUID
    const timestamp = Date.now().toString(16);
    testAuthUserId = `550e8400-e29b-41d4-a716-${timestamp.padStart(12, '0')}`;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully without token (optionalAuth)', async () => {
      const userData = {
        name: 'João Silva',
        height: 175,
        weight: 70.5,
        personal_record_5k: '25:30',
        goal: 'improve_time',
        weekly_frequency: 3,
        auth_user_id: testAuthUserId
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('goal', userData.goal);

      // Save user ID for later tests
      testUserId = response.body.user.id;
    });

    it('should create a new user successfully with valid token (optionalAuth)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const userData = {
        name: 'João Silva Autenticado',
        height: 175,
        weight: 70.5,
        personal_record_5k: '25:30',
        goal: 'improve_time',
        weekly_frequency: 3,
        auth_user_id: testAuthUserId
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', validToken)
        .send(userData)
        .expect(201);

      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('valid_jwt_token');
      expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        height: 'invalid', // Invalid height
        weight: -10, // Invalid weight
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Dados inválidos');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'João Silva'
        // Missing height, weight, etc.
      };

      const response = await request(app)
        .post('/api/users')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Dados inválidos');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/test-user-id')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Token de acesso necessário',
        message: 'Forneça um token válido no cabeçalho Authorization'
      });
    });

    it('should get user by ID successfully with valid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock the database response for user lookup
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'test-user-id', 
                name: 'João Silva',
                height: 175,
                weight: 70.5,
                personal_record_5k: '25:30',
                goal: 'improve_time',
                weekly_frequency: 3
              }, 
              error: null 
            }))
          }))
        }))
      });

      const response = await request(app)
        .get('/api/users/test-user-id')
        .set('Authorization', validToken)
        .expect(200);

      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('valid_jwt_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'test-user-id');
      expect(response.body.user).toHaveProperty('name', 'João Silva');
    });

    it('should return 404 for non-existent user ID with valid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock database to return no user
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { code: 'PGRST116' } 
            }))
          }))
        }))
      });

      const nonExistentId = '99999999-9999-9999-9999-999999999999';
      
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });
  });

  describe('GET /api/users/auth/:authUserId', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/auth/test-auth-id')
        .expect(401);

      expect(response.body.error).toBe('Token de acesso necessário');
    });

         it('should get user by auth ID successfully with valid token', async () => {
       mockSupabase.auth.getUser.mockResolvedValue({
         data: { user: mockUser },
         error: null
       });

       // Mock successful user lookup for getUserByAuthId (uses order().limit())
       mockSupabase.from.mockReturnValue({
         select: jest.fn(() => ({
           eq: jest.fn(() => ({
             order: jest.fn(() => ({
               limit: jest.fn(() => Promise.resolve({ 
                 data: [{ 
                   id: 'test-user-id', 
                   name: 'João Silva',
                   height: 175,
                   weight: 70.5,
                   personal_record_5k: '25:30',
                   goal: 'improve_time',
                   weekly_frequency: 3,
                   auth_user_id: testAuthUserId,
                   created_at: '2024-01-01T00:00:00.000Z'
                 }], 
                 error: null 
               }))
             }))
           }))
         }))
       });

       const response = await request(app)
         .get(`/api/users/auth/${testAuthUserId}`)
         .set('Authorization', validToken)
         .expect(200);

       expect(response.body).toHaveProperty('user');
       expect(response.body.user).toHaveProperty('name', 'João Silva');
       expect(response.body.user).toHaveProperty('id', 'test-user-id');
     });

    it('should return 404 for non-existent auth user ID with valid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock database to return no user
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { code: 'PGRST116' } 
            }))
          }))
        }))
      });

      const nonExistentAuthId = '99999999-9999-9999-9999-999999999999';
      
      const response = await request(app)
        .get(`/api/users/auth/${nonExistentAuthId}`)
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('should return 401 with invalid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const response = await request(app)
        .get('/api/users/auth/test-auth-id')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.error).toBe('Token inválido');
    });
  });

  describe('Edge cases and error handling', () => {
         it('should handle database errors gracefully', async () => {
       mockSupabase.auth.getUser.mockResolvedValue({
         data: { user: mockUser },
         error: null
       });

       // Mock database error for getUserByAuthId (uses order().limit(), not single())
       mockSupabase.from.mockReturnValue({
         select: jest.fn(() => ({
           eq: jest.fn(() => ({
             order: jest.fn(() => ({
               limit: jest.fn(() => Promise.resolve({ 
                 data: null, 
                 error: { message: 'Database connection failed', code: 'CONNECTION_ERROR' } 
               }))
             }))
           }))
         }))
       });

       const response = await request(app)
         .get('/api/users/auth/550e8400-e29b-41d4-a716-123456789012')
         .set('Authorization', validToken)
         .expect(500);

       expect(response.body).toHaveProperty('error', 'Erro ao buscar usuário');
     });

    it('should validate auth_user_id parameter correctly', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock database to return no user for invalid UUID
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { code: 'PGRST116' } 
            }))
          }))
        }))
      });

      const response = await request(app)
        .get('/api/users/auth/invalid-uuid')
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });
  });
}); 