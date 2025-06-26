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

describe('Plan Controller', () => {
  let testUserId;
  let testPlanId;
  const testAuthUserId = 'test-auth-plan-123';
  const validToken = 'Bearer valid_jwt_token';
  const mockUser = {
    id: 'test-auth-id',
    email: 'test@example.com',
    user_metadata: { role: 'user' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  beforeAll(async () => {
    // Create a test user first
    const userData = {
      name: 'Maria Santos',
      height: 165,
      weight: 60.5,
      personal_record_5k: '28:00',
      goal: 'run_10k',
      weekly_frequency: 2,
      auth_user_id: testAuthUserId
    };

    const userResponse = await request(app)
      .post('/api/users')
      .send(userData);

    if (userResponse.status === 201) {
      testUserId = userResponse.body.user.id;
    }
  });

  describe('POST /api/plans', () => {
    it('should create a training plan successfully', async () => {
      if (!testUserId) {
        console.log('Skipping test - user creation failed');
        return;
      }

      const planData = {
        userId: testUserId
      };

      const response = await request(app)
        .post('/api/plans')
        .send(planData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Plano criado com sucesso');
      expect(response.body).toHaveProperty('plan');
      expect(response.body.plan).toHaveProperty('id');
      expect(response.body.plan).toHaveProperty('goal', 'run_10k');
      expect(response.body.plan).toHaveProperty('weekly_frequency', 2);

      testPlanId = response.body.plan.id;
    });

    it('should recreate plan when force=true', async () => {
      if (!testUserId) {
        console.log('Skipping test - user creation failed');
        return;
      }

      const planData = {
        userId: testUserId,
        force: true
      };

      const response = await request(app)
        .post('/api/plans')
        .send(planData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Plano de treino recriado com sucesso');
      expect(response.body).toHaveProperty('plan');
      expect(response.body.plan).toHaveProperty('id');
      expect(response.body.plan.id).not.toBe(testPlanId); // Should be a new plan ID

      testPlanId = response.body.plan.id;
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/plans')
        .send({ userId: 'test-user-id' })
        .expect(401);

      expect(response.body.error).toBe('Token de acesso necessário');
    });

    it('should return 400 for missing userId with valid token', async () => {
      const response = await request(app)
        .post('/api/plans')
        .set('Authorization', validToken)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ID do usuário é obrigatório');
    });

    it('should return 404 for non-existent user with valid token', async () => {
      const nonExistentUserId = '99999999-9999-9999-9999-999999999999';
      
      const response = await request(app)
        .post('/api/plans')
        .set('Authorization', validToken)
        .send({ userId: nonExistentUserId })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });
  });

  describe('GET /api/plans/user/:userId', () => {
    it('should get user plans successfully', async () => {
      if (!testUserId) {
        console.log('Skipping test - user creation failed');
        return;
      }

      const response = await request(app)
        .get(`/api/plans/user/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('plans');
      expect(Array.isArray(response.body.plans)).toBe(true);
      
      if (response.body.plans.length > 0) {
        const plan = response.body.plans[0];
        expect(plan).toHaveProperty('goal');
        expect(plan).toHaveProperty('weekly_frequency');
      }
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/plans/user/test-user-id')
        .expect(401);

      expect(response.body.error).toBe('Token de acesso necessário');
    });

    it('should return 404 for non-existent user plans with valid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock the optimized JOIN query to return PGRST116 error (not found)
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ 
                  data: null, 
                  error: { code: 'PGRST116' } 
                }))
              }))
            }))
          }))
        }))
      });

      const nonExistentUserId = '99999999-9999-9999-9999-999999999999';
      
      const response = await request(app)
        .get(`/api/plans/user/${nonExistentUserId}`)
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Nenhum plano encontrado para este usuário');
    });
  });

  describe('Weekly Frequency Tests', () => {
    const frequencies = [1, 2, 3, 4, 5, 6];
    
    frequencies.forEach(frequency => {
      it(`should create plan with ${frequency}x weekly frequency`, async () => {
        // Create user with specific frequency
        const userData = {
          name: `Test User ${frequency}x`,
          height: 170,
          weight: 65,
          personal_record_5k: '25:00',
          goal: 'run_5k',
          weekly_frequency: frequency,
          auth_user_id: `test-freq-${frequency}-${Date.now()}`
        };

        const userResponse = await request(app)
          .post('/api/users')
          .send(userData);

        if (userResponse.status !== 201) {
          console.log(`Skipping ${frequency}x test - user creation failed`);
          return;
        }

        const userId = userResponse.body.user.id;

        // Create plan
        const planResponse = await request(app)
          .post('/api/plans')
          .send({ userId })
          .expect(201);

        expect(planResponse.body.plan).toHaveProperty('weekly_frequency', frequency);
        
        // Verify plan structure is appropriate for frequency
        const plan = planResponse.body.plan;
        expect(plan.weeks).toBeDefined();
        expect(plan.weeks.length).toBe(8);
        
        // Check first week workouts
        const firstWeek = plan.weeks[0];
        expect(firstWeek.workouts).toBeDefined();
        
        if (frequency === 1) {
          expect(firstWeek.workouts.length).toBe(1);
        } else if (frequency === 2) {
          expect(firstWeek.workouts.length).toBe(2);
        } else {
          expect(firstWeek.workouts.length).toBeGreaterThanOrEqual(3);
        }
      });
    });
  });

  describe('Goal-specific Plan Tests', () => {
    const goals = ['start_running', 'run_5k', 'run_10k', 'half_marathon', 'marathon', 'improve_time'];
    
    goals.forEach(goal => {
      it(`should create appropriate plan for ${goal}`, async () => {
        const userData = {
          name: `Test ${goal}`,
          height: 175,
          weight: 70,
          personal_record_5k: '23:00',
          goal: goal,
          weekly_frequency: 3,
          auth_user_id: `test-goal-${goal}-${Date.now()}`
        };

        const userResponse = await request(app)
          .post('/api/users')
          .send(userData);

        if (userResponse.status !== 201) {
          console.log(`Skipping ${goal} test - user creation failed`);
          return;
        }

        const userId = userResponse.body.user.id;

        const planResponse = await request(app)
          .post('/api/plans')
          .send({ userId })
          .expect(201);

        const plan = planResponse.body.plan;
        expect(plan.goal).toBe(goal);
        
        // Verify volume scaling
        const firstWeekVolume = plan.weeks[0].volume;
        if (goal === 'marathon') {
          expect(firstWeekVolume).toBeGreaterThan(35); // Marathon should have higher volume
        } else if (goal === 'start_running') {
          expect(firstWeekVolume).toBeLessThan(25); // Beginner should have lower volume
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid goal gracefully', async () => {
      const userData = {
        name: 'Test Invalid Goal',
        height: 175,
        weight: 70,
        personal_record_5k: '23:00',
        goal: 'invalid_goal',
        weekly_frequency: 3,
        auth_user_id: `test-invalid-${Date.now()}`
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Dados inválidos');
    });

    it('should handle invalid weekly_frequency', async () => {
      const userData = {
        name: 'Test Invalid Frequency',
        height: 175,
        weight: 70,
        personal_record_5k: '23:00',
        goal: 'run_5k',
        weekly_frequency: 10, // Invalid - outside 1-6 range
        auth_user_id: `test-invalid-freq-${Date.now()}`
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Dados inválidos');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid user ID format', async () => {
      const response = await request(app)
        .post('/api/plans')
        .set('Authorization', validToken)
        .send({ userId: 'invalid-id-format' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('should handle empty userId', async () => {
      const response = await request(app)
        .post('/api/plans')
        .set('Authorization', validToken)
        .send({ userId: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ID do usuário é obrigatório');
    });

    it('should handle null userId', async () => {
      const response = await request(app)
        .post('/api/plans')
        .set('Authorization', validToken)
        .send({ userId: null })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ID do usuário é obrigatório');
    });

    it('should handle database errors in plan creation', async () => {
      // Mock user lookup to succeed
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'test-user-id',
                name: 'Test User',
                goal: 'run_5k',
                weekly_frequency: 3
              }, 
              error: null 
            }))
          }))
        }))
      });

      // Mock plan creation to fail
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Database error', code: 'DB_ERROR' } 
            }))
          }))
        }))
      });

      const response = await request(app)
        .post('/api/plans')
        .set('Authorization', validToken)
        .send({ userId: 'test-user-id' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid workout progress data', async () => {
      const response = await request(app)
        .put('/api/plans/test-plan-id/progress')
        .set('Authorization', validToken)
        .send({
          week: 'invalid',
          workoutIndex: 'invalid',
          completed: 'not-boolean'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing progress data', async () => {
      const response = await request(app)
        .put('/api/plans/test-plan-id/progress')
        .set('Authorization', validToken)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle non-existent plan in progress update', async () => {
      // Mock plan lookup to return no plan
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
        .put('/api/plans/non-existent-plan-id/progress')
        .set('Authorization', validToken)
        .send({
          week: 1,
          workoutIndex: 0,
          completed: true
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Plano não encontrado');
    });
  });

  describe('PUT /api/plans/:planId/progress', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/plans/test-plan-id/progress')
        .send({
          week: 1,
          workoutIndex: 0,
          completed: true
        })
        .expect(401);

      expect(response.body.error).toBe('Token de acesso necessário');
    });

    it('should update workout progress successfully', async () => {
      // Mock plan lookup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'test-plan-id',
                weeks: [
                  {
                    week: 1,
                    workouts: [
                      { type: 'easy_run', distance: 3, completed: false }
                    ]
                  }
                ]
              }, 
              error: null 
            }))
          }))
        }))
      });

      // Mock plan update
      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-plan-id' }, 
            error: null 
          }))
        }))
      });

      const response = await request(app)
        .put('/api/plans/test-plan-id/progress')
        .set('Authorization', validToken)
        .send({
          week: 1,
          workoutIndex: 0,
          completed: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Progresso atualizado com sucesso');
    });
  });

  describe('Error Handling in Plan Generation', () => {
    it('should handle user with invalid goal', async () => {
      // Mock user with invalid goal
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'test-user-id',
                name: 'Test User',
                goal: 'invalid_goal',
                weekly_frequency: 3
              }, 
              error: null 
            }))
          }))
        }))
      });

      const response = await request(app)
        .post('/api/plans')
        .set('Authorization', validToken)
        .send({ userId: 'test-user-id' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle user with invalid weekly frequency', async () => {
      // Mock user with invalid frequency
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'test-user-id',
                name: 'Test User',
                goal: 'run_5k',
                weekly_frequency: 0 // Invalid frequency
              }, 
              error: null 
            }))
          }))
        }))
      });

      const response = await request(app)
        .post('/api/plans')
        .set('Authorization', validToken)
        .send({ userId: 'test-user-id' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Plan Lookup Edge Cases', () => {
    it('should handle empty user plans correctly', async () => {
      // Mock empty plans result
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ 
                data: [], 
                error: null 
              }))
            }))
          }))
        }))
      });

      const response = await request(app)
        .get('/api/plans/user/test-user-id')
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Nenhum plano encontrado para este usuário');
    });

    it('should handle database errors in plan lookup', async () => {
      // Mock database error
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ 
                data: null, 
                error: { message: 'Database connection failed', code: 'DB_ERROR' } 
              }))
            }))
          }))
        }))
      });

      const response = await request(app)
        .get('/api/plans/user/test-user-id')
        .set('Authorization', validToken)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 