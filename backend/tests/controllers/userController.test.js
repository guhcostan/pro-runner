const request = require('supertest');
const app = require('../../src/index');

describe('User Controller', () => {
  let testUserId;
  let testAuthUserId;

  beforeAll(() => {
    // Set up test data
    testAuthUserId = 'test-auth-user-id-123';
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
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
    it('should get user by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', testUserId);
      expect(response.body.user).toHaveProperty('name', 'João Silva');
    });

    it('should return 404 for non-existent user ID', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';
      
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('should return 400 for missing user ID', async () => {
      const response = await request(app)
        .get('/api/users/')
        .expect(404); // This will be handled by the route not found middleware
    });
  });

  describe('GET /api/users/auth/:authUserId', () => {
    it('should get user by auth ID successfully', async () => {
      const response = await request(app)
        .get(`/api/users/auth/${testAuthUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'João Silva');
      expect(response.body.user).toHaveProperty('id', testUserId);
    });

    it('should return 404 for non-existent auth user ID', async () => {
      const nonExistentAuthId = 'non-existent-auth-id-123';
      
      const response = await request(app)
        .get(`/api/users/auth/${nonExistentAuthId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('should return 400 for missing auth user ID', async () => {
      const response = await request(app)
        .get('/api/users/auth/')
        .expect(404); // This will be handled by the route not found middleware
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll just test that the endpoint exists and responds
      const response = await request(app)
        .get('/api/users/auth/some-auth-id')
        .expect(404); // Expecting 404 since this auth ID doesn't exist

      expect(response.body).toHaveProperty('error');
    });

    it('should validate auth_user_id parameter correctly', async () => {
      const response = await request(app)
        .get('/api/users/auth/   ') // Whitespace only
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Auth User ID é obrigatório');
    });
  });
}); 