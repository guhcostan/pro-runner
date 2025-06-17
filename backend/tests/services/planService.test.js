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
        personal_record_5k: '16:00', // Fast time for advanced (VDOT > 55)
        goal: 'improve_time'
      };

      const slowRunner = {
        id: 'user-slow',
        height: 170,
        weight: 65,
        personal_record_5k: '35:00', // Slow time for beginner (VDOT < 35)
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

    test('should generate progressive weekly volumes with proper build-up and taper', () => {
      const userData = {
        id: 'user-progression',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'run_10k'
      };

      const plan = planService.generateTrainingPlan(userData);

      // Verificar que o primeiro volume é menor que o pico
      const firstWeekVolume = plan.weeks[0].volume;
      const midPlanVolume = plan.weeks[Math.floor(plan.weeks.length / 2)].volume;
      
      // A primeira semana deve ter volume menor que o meio do plano (build-up)
      expect(firstWeekVolume).toBeLessThan(midPlanVolume);
      
      // As últimas semanas devem ter taper (volume menor que o pico)
      const lastWeekVolume = plan.weeks[plan.weeks.length - 1].volume;
      expect(lastWeekVolume).toBeLessThan(midPlanVolume);
      
      // Verificar que temos uma progressão geral no início
      const quarterPlan = Math.floor(plan.weeks.length / 4);
      const firstQuarterVolume = plan.weeks[quarterPlan].volume;
      expect(firstQuarterVolume).toBeGreaterThan(firstWeekVolume);
    });

    test('should include different workout types', () => {
      const userData = {
        id: 'user-workouts',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'run_5k',
        weekly_frequency: 4 // Para garantir que teremos tiros
      };

      const plan = planService.generateTrainingPlan(userData);
      const firstWeek = plan.weeks[0];

      // Verificar se diferentes tipos de treino estão presentes (nova metodologia)
      const workoutTypes = firstWeek.workouts.map(workout => workout.type);
      expect(workoutTypes).toContain('long'); // Novo nome para longao
      expect(workoutTypes).toContain('interval'); // Novo nome para tiros
      expect(workoutTypes).toContain('tempo');
      expect(workoutTypes).toContain('recovery'); // Novo nome para regenerativo
    });

    test('should assign appropriate workout types with VDOT-based structure', () => {
      const userData = {
        id: 'user-intensity',
        height: 175,
        weight: 70,
        personal_record_5k: '22:00',
        goal: 'run_5k',
        weekly_frequency: 4 // Para garantir variedade de treinos
      };

      const plan = planService.generateTrainingPlan(userData);
      const firstWeek = plan.weeks[0];

      // Verifica se o plano tem estrutura VDOT com paces calculados
      expect(plan.training_paces).toBeDefined();
      expect(plan.training_paces.easy).toBeDefined();
      expect(plan.training_paces.interval).toBeDefined();
      expect(plan.training_paces.tempo).toBeDefined();
      expect(plan.training_paces.long).toBeDefined();
      expect(plan.training_paces.recovery).toBeDefined();
      
      // Verifica se os treinos têm estrutura correta
      const workoutTypes = firstWeek.workouts.map(workout => workout.type);
      expect(workoutTypes).toContain('interval'); // Treino intervalado
      expect(workoutTypes).toContain('long'); // Longão
      expect(workoutTypes).toContain('tempo'); // Tempo
      expect(workoutTypes).toContain('recovery'); // Recuperação
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

      // 1x por semana na nova metodologia gera um fallback para 3 treinos (default)
      expect(plan1x.weeks[0].workouts.length).toBeGreaterThanOrEqual(2);
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