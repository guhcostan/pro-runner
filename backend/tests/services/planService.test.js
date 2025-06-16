const planService = require('../../src/services/planService');

describe('PlanService', () => {
  describe('generateRunningPlan', () => {
    test('should generate a valid running plan for beginner', () => {
      const userProfile = {
        idade: 30,
        peso: 70,
        altura: 175,
        experiencia: 'iniciante',
        objetivo: 'comecar_correr',
        disponibilidade: 3,
        tempo_treino: 30
      };

      const plan = planService.generateRunningPlan(userProfile);

      expect(plan).toBeDefined();
      expect(plan.semanas).toBeDefined();
      expect(Array.isArray(plan.semanas)).toBe(true);
      expect(plan.semanas.length).toBeGreaterThan(0);
      
      // Verificar estrutura da primeira semana
      const firstWeek = plan.semanas[0];
      expect(firstWeek).toHaveProperty('numero');
      expect(firstWeek).toHaveProperty('objetivo');
      expect(firstWeek).toHaveProperty('treinos');
      expect(Array.isArray(firstWeek.treinos)).toBe(true);
    });

    test('should generate plan with correct number of training days', () => {
      const userProfile = {
        idade: 25,
        peso: 65,
        altura: 170,
        experiencia: 'intermediario',
        objetivo: 'fazer_5km',
        disponibilidade: 4,
        tempo_treino: 45
      };

      const plan = planService.generateRunningPlan(userProfile);
      
      // Verificar se respeita a disponibilidade
      plan.semanas.forEach(semana => {
        expect(semana.treinos.length).toBeLessThanOrEqual(userProfile.disponibilidade);
      });
    });

    test('should handle advanced runner profile', () => {
      const userProfile = {
        idade: 35,
        peso: 80,
        altura: 180,
        experiencia: 'avancado',
        objetivo: 'melhorar_tempo',
        disponibilidade: 5,
        tempo_treino: 60
      };

      const plan = planService.generateRunningPlan(userProfile);

      expect(plan).toBeDefined();
      expect(plan.semanas.length).toBeGreaterThan(0);
      
      // Verificar se tem treinos mais intensos para avançado
      const hasIntensiveTraining = plan.semanas.some(semana =>
        semana.treinos.some(treino => 
          treino.tipo === 'intervalado' || treino.tipo === 'tempo'
        )
      );
      expect(hasIntensiveTraining).toBe(true);
    });
  });

  describe('calculateWeeklyProgression', () => {
    test('should calculate proper progression for beginner', () => {
      const progression = planService.calculateWeeklyProgression('iniciante', 8);
      
      expect(Array.isArray(progression)).toBe(true);
      expect(progression.length).toBe(8);
      
      // Verificar progressão gradual
      for (let i = 1; i < progression.length; i++) {
        expect(progression[i]).toBeGreaterThanOrEqual(progression[i - 1]);
      }
    });
  });

  describe('generateTrainingTypes', () => {
    test('should generate appropriate training types for experience level', () => {
      const beginnerTypes = planService.generateTrainingTypes('iniciante');
      const advancedTypes = planService.generateTrainingTypes('avancado');

      expect(Array.isArray(beginnerTypes)).toBe(true);
      expect(Array.isArray(advancedTypes)).toBe(true);
      
      // Iniciantes devem ter menos tipos de treino
      expect(beginnerTypes.length).toBeLessThanOrEqual(advancedTypes.length);
      
      // Ambos devem incluir corrida leve
      expect(beginnerTypes).toContain('corrida_leve');
      expect(advancedTypes).toContain('corrida_leve');
    });
  });
}); 