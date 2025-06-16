const planService = require('../../src/services/planService');

describe('PlanService', () => {
  describe('generateTrainingPlan', () => {
    test('should generate a valid training plan for beginner', () => {
      const userData = {
        id: 'user-123',
        height: 175,
        weight: 70,
        personal_record_5k: '25:00',
        goal: 'comecar_correr'
      };

      const plan = planService.generateTrainingPlan(userData);

      expect(plan).toBeDefined();
      expect(plan.weeks).toBeDefined();
      expect(Array.isArray(plan.weeks)).toBe(true);
      expect(plan.weeks.length).toBe(8);
      expect(plan.goal).toBe('comecar_correr');
      expect(plan.user_id).toBe('user-123');
      
      // Verificar estrutura da primeira semana
      const firstWeek = plan.weeks[0];
      expect(firstWeek).toHaveProperty('week');
      expect(firstWeek).toHaveProperty('volume');
      expect(firstWeek).toHaveProperty('workouts');
      expect(Array.isArray(firstWeek.workouts)).toBe(true);
    });

    test('should generate plan with appropriate fitness level classification', () => {
      const fastRunner = {
        id: 'user-fast',
        height: 180,
        weight: 75,
        personal_record_5k: '18:00', // Fast time
        goal: 'melhorar_tempo'
      };

      const slowRunner = {
        id: 'user-slow',
        height: 170,
        weight: 65,
        personal_record_5k: '35:00', // Slow time
        goal: 'comecar_correr'
      };

      const fastPlan = planService.generateTrainingPlan(fastRunner);
      const slowPlan = planService.generateTrainingPlan(slowRunner);

      expect(fastPlan.fitness_level).toBe('avançado');
      expect(slowPlan.fitness_level).toBe('iniciante');
    });

    test('should generate different plans for different goals', () => {
      const baseUserData = {
        id: 'user-test',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00'
      };

      const plan5k = planService.generateTrainingPlan({
        ...baseUserData,
        goal: 'fazer_5km'
      });

      const planWeightLoss = planService.generateTrainingPlan({
        ...baseUserData,
        goal: 'perder_peso'
      });

      expect(plan5k.goal).toBe('fazer_5km');
      expect(planWeightLoss.goal).toBe('perder_peso');
      
      // Diferentes objetivos devem gerar planos com volumes diferentes
      expect(plan5k.weeks[0].volume).not.toBe(planWeightLoss.weeks[0].volume);
    });

    test('should generate progressive weekly volumes', () => {
      const userData = {
        id: 'user-progression',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'fazer_10km'
      };

      const plan = planService.generateTrainingPlan(userData);

      // Verificar progressão nos volumes semanais
      for (let i = 1; i < plan.weeks.length; i++) {
        const currentWeek = plan.weeks[i];
        const previousWeek = plan.weeks[i - 1];
        
        // Volume deve ser igual ou maior que a semana anterior
        expect(currentWeek.volume).toBeGreaterThanOrEqual(previousWeek.volume);
      }
    });

    test('should include different workout types', () => {
      const userData = {
        id: 'user-workouts',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'fazer_5km'
      };

      const plan = planService.generateTrainingPlan(userData);
      const firstWeek = plan.weeks[0];

      // Verificar se diferentes tipos de treino estão presentes
      const workoutTypes = firstWeek.workouts.map(workout => workout.type);
      expect(workoutTypes).toContain('longao');
      expect(workoutTypes).toContain('tiros');
      expect(workoutTypes).toContain('tempo');
      expect(workoutTypes).toContain('regenerativo');
    });

    test('should assign appropriate workout intensities', () => {
      const userData = {
        id: 'user-intensity',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'fazer_5km'
      };

      const plan = planService.generateTrainingPlan(userData);
      const firstWeek = plan.weeks[0];

      const intensities = firstWeek.workouts.map(workout => workout.intensity);
      
      // Deve ter diferentes intensidades
      expect(intensities).toContain('fácil');
      expect(intensities).toContain('alta');
      expect(intensities).toContain('moderada');
      expect(intensities).toContain('muito_fácil');
    });
  });
}); 