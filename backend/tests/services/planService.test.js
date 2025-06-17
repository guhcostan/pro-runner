const planService = require('../../src/services/planService');

describe('PlanService', () => {
  describe('generateTrainingPlan', () => {
    test('should generate a valid training plan for beginner', () => {
      const userData = {
        id: 'user-123',
        height: 175,
        weight: 70,
        personal_record_5k: '25:00',
        goal: 'start_running',
        weekly_frequency: 2
      };

      const plan = planService.generateTrainingPlan(userData);

      expect(plan).toBeDefined();
      expect(plan.weeks).toBeDefined();
      expect(Array.isArray(plan.weeks)).toBe(true);
      expect(plan.weeks.length).toBe(8);
      expect(plan.goal).toBe('start_running');
      expect(plan.weekly_frequency).toBe(2);
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
        goal: 'improve_time'
      };

      const slowRunner = {
        id: 'user-slow',
        height: 170,
        weight: 65,
        personal_record_5k: '35:00', // Slow time
        goal: 'start_running'
      };

      const fastPlan = planService.generateTrainingPlan(fastRunner);
      const slowPlan = planService.generateTrainingPlan(slowRunner);

      expect(fastPlan.fitness_level).toBe('advanced');
      expect(slowPlan.fitness_level).toBe('beginner');
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
        goal: 'run_5k'
      });

      const planMarathon = planService.generateTrainingPlan({
        ...baseUserData,
        goal: 'marathon'
      });

      expect(plan5k.goal).toBe('run_5k');
      expect(planMarathon.goal).toBe('marathon');
      
      // Diferentes objetivos devem gerar planos com volumes diferentes
      expect(plan5k.weeks[0].volume).not.toBe(planMarathon.weeks[0].volume);
      // Maratona deve ter volume maior que 5K
      expect(planMarathon.weeks[0].volume).toBeGreaterThan(plan5k.weeks[0].volume);
    });

    test('should generate progressive weekly volumes', () => {
      const userData = {
        id: 'user-progression',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'run_10k'
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

    test('should generate different plans for different weekly frequencies', () => {
      const baseUserData = {
        id: 'user-frequency-test',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'run_5k'
      };

      const plan1x = planService.generateTrainingPlan({
        ...baseUserData,
        weekly_frequency: 1
      });

      const plan2x = planService.generateTrainingPlan({
        ...baseUserData,
        weekly_frequency: 2
      });

      const plan4x = planService.generateTrainingPlan({
        ...baseUserData,
        weekly_frequency: 4
      });

      // 1x por semana deve ter apenas 1 treino
      expect(plan1x.weeks[0].workouts.length).toBe(1);
      expect(plan1x.weekly_frequency).toBe(1);

      // 2x por semana deve ter 2 treinos
      expect(plan2x.weeks[0].workouts.length).toBe(2);
      expect(plan2x.weekly_frequency).toBe(2);

      // 4x por semana deve ter mais treinos
      expect(plan4x.weeks[0].workouts.length).toBeGreaterThanOrEqual(4);
      expect(plan4x.weekly_frequency).toBe(4);

      // Volumes devem ser diferentes
      expect(plan1x.weeks[0].volume).toBeLessThan(plan2x.weeks[0].volume);
      expect(plan2x.weeks[0].volume).toBeLessThan(plan4x.weeks[0].volume);
    });

    test('should handle missing weekly_frequency with default value', () => {
      const userData = {
        id: 'user-no-frequency',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'run_5k'
        // No weekly_frequency specified
      };

      const plan = planService.generateTrainingPlan(userData);

      expect(plan.weekly_frequency).toBe(3); // Default value
      expect(plan.weeks[0].workouts.length).toBeGreaterThanOrEqual(3);
    });
  });
}); 