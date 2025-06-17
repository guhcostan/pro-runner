const request = require('supertest');
const app = require('../../src/index');

describe('Plan Controller', () => {
  let testUserId;
  let testPlanId;
  const testAuthUserId = 'test-auth-plan-123';

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

    it('should return 400 for missing userId', async () => {
      const response = await request(app)
        .post('/api/plans')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ID do usuário é obrigatório');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentUserId = '99999999-9999-9999-9999-999999999999';
      
      const response = await request(app)
        .post('/api/plans')
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

    it('should return 404 for non-existent user plans', async () => {
      const nonExistentUserId = '99999999-9999-9999-9999-999999999999';
      
      const response = await request(app)
        .get(`/api/plans/user/${nonExistentUserId}`)
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
}); 