import { t, setLanguage, getCurrentLanguage, Language } from '../../constants/i18n';

describe('i18n System', () => {
  beforeEach(() => {
    setLanguage('pt'); // Reset to default
  });

  describe('Language Management', () => {
    it('should set and get current language', () => {
      expect(getCurrentLanguage()).toBe('pt');
      
      setLanguage('en');
      expect(getCurrentLanguage()).toBe('en');
      
      setLanguage('es');
      expect(getCurrentLanguage()).toBe('es');
    });
  });

  describe('Basic Translation Function', () => {
    it('should translate basic keys in Portuguese', () => {
      setLanguage('pt');
      expect(t('cancel')).toBe('Cancelar');
      expect(t('save')).toBe('Salvar');
      expect(t('loading')).toBe('Carregando...');
    });

    it('should translate basic keys in English', () => {
      setLanguage('en');
      expect(t('cancel')).toBe('Cancel');
      expect(t('save')).toBe('Save');
      expect(t('loading')).toBe('Loading...');
    });

    it('should translate basic keys in Spanish', () => {
      setLanguage('es');
      expect(t('cancel')).toBe('Cancelar');
      expect(t('save')).toBe('Guardar');
      expect(t('loading')).toBe('Cargando...');
    });

    it('should handle parameter interpolation', () => {
      setLanguage('pt');
      expect(t('xp_remaining', { xp: '500' })).toBe('Faltam 500 XP');
      
      setLanguage('en');
      expect(t('xp_remaining', { xp: '500' })).toBe('500 XP remaining');
      
      setLanguage('es');
      expect(t('xp_remaining', { xp: '500' })).toBe('Faltan 500 XP');
    });

    it('should return key if translation not found', () => {
      expect(t('non_existent_key')).toBe('non_existent_key');
    });
  });

  describe('Adaptive System Translations', () => {
    describe('Level Titles', () => {
      const levels = ['level_beginner', 'level_intermediate', 'level_advanced', 'level_expert', 'level_elite'];
      
      it('should translate all level titles in Portuguese', () => {
        setLanguage('pt');
        expect(t('level_beginner')).toBe('Iniciante');
        expect(t('level_intermediate')).toBe('Intermediário');
        expect(t('level_advanced')).toBe('Avançado');
        expect(t('level_expert')).toBe('Expert');
        expect(t('level_elite')).toBe('Elite');
      });

      it('should translate all level titles in English', () => {
        setLanguage('en');
        expect(t('level_beginner')).toBe('Beginner');
        expect(t('level_intermediate')).toBe('Intermediate');
        expect(t('level_advanced')).toBe('Advanced');
        expect(t('level_expert')).toBe('Expert');
        expect(t('level_elite')).toBe('Elite');
      });

      it('should translate all level titles in Spanish', () => {
        setLanguage('es');
        expect(t('level_beginner')).toBe('Principiante');
        expect(t('level_intermediate')).toBe('Intermedio');
        expect(t('level_advanced')).toBe('Avanzado');
        expect(t('level_expert')).toBe('Experto');
        expect(t('level_elite')).toBe('Elite');
      });
    });

    describe('Training Phases', () => {
      const phases = ['phase_foundation', 'phase_development', 'phase_performance', 'phase_specialization', 'phase_mastery'];
      
      it('should translate all phase names in Portuguese', () => {
        setLanguage('pt');
        expect(t('phase_foundation')).toBe('Fundação');
        expect(t('phase_development')).toBe('Desenvolvimento');
        expect(t('phase_performance')).toBe('Desempenho');
        expect(t('phase_specialization')).toBe('Especialização');
        expect(t('phase_mastery')).toBe('Maestria');
      });

      it('should translate all phase names in English', () => {
        setLanguage('en');
        expect(t('phase_foundation')).toBe('Foundation');
        expect(t('phase_development')).toBe('Development');
        expect(t('phase_performance')).toBe('Performance');
        expect(t('phase_specialization')).toBe('Specialization');
        expect(t('phase_mastery')).toBe('Mastery');
      });

      it('should translate all phase names in Spanish', () => {
        setLanguage('es');
        expect(t('phase_foundation')).toBe('Fundación');
        expect(t('phase_development')).toBe('Desarrollo');
        expect(t('phase_performance')).toBe('Rendimiento');
        expect(t('phase_specialization')).toBe('Especialización');
        expect(t('phase_mastery')).toBe('Maestría');
      });

      it('should translate phase descriptions in all languages', () => {
        setLanguage('pt');
        expect(t('phase_foundation_desc')).toContain('Construindo base aeróbica');
        
        setLanguage('en');
        expect(t('phase_foundation_desc')).toContain('Building aerobic base');
        
        setLanguage('es');
        expect(t('phase_foundation_desc')).toContain('Construyendo base aeróbica');
      });
    });

    describe('Achievement System', () => {
      it('should translate achievement-related terms', () => {
        setLanguage('pt');
        expect(t('achievements')).toBe('Conquistas');
        expect(t('achievement_earned')).toBe('Conquista Desbloqueada!');
        expect(t('recent_achievements')).toBe('Recentes');
        expect(t('all_achievements')).toBe('Todas as Conquistas');

        setLanguage('en');
        expect(t('achievements')).toBe('Achievements');
        expect(t('achievement_earned')).toBe('Achievement Unlocked!');
        expect(t('recent_achievements')).toBe('Recent');
        expect(t('all_achievements')).toBe('All Achievements');

        setLanguage('es');
        expect(t('achievements')).toBe('Logros');
        expect(t('achievement_earned')).toBe('¡Logro Desbloqueado!');
        expect(t('recent_achievements')).toBe('Recientes');
        expect(t('all_achievements')).toBe('Todos los Logros');
      });

      it('should handle achievement count interpolation', () => {
        setLanguage('pt');
        expect(t('achievements_unlocked', { count: '5', total: '10' })).toBe('5 de 10 desbloqueadas');
        
        setLanguage('en');
        expect(t('achievements_unlocked', { count: '5', total: '10' })).toBe('5 of 10 unlocked');
        
        setLanguage('es');
        expect(t('achievements_unlocked', { count: '5', total: '10' })).toBe('5 de 10 desbloqueados');
      });
    });

    describe('XP and Gamification', () => {
      it('should translate XP-related terms', () => {
        setLanguage('pt');
        expect(t('xp')).toBe('XP');
        expect(t('total_xp')).toBe('XP Total');
        expect(t('next_level')).toBe('Próximo nível');
        expect(t('level_up')).toBe('Subiu de Nível!');

        setLanguage('en');
        expect(t('xp')).toBe('XP');
        expect(t('total_xp')).toBe('Total XP');
        expect(t('next_level')).toBe('Next level');
        expect(t('level_up')).toBe('Level Up!');

        setLanguage('es');
        expect(t('xp')).toBe('XP');
        expect(t('total_xp')).toBe('XP Total');
        expect(t('next_level')).toBe('Siguiente nivel');
        expect(t('level_up')).toBe('¡Subiste de Nivel!');
      });

      it('should handle XP earned interpolation', () => {
        setLanguage('pt');
        expect(t('xp_earned', { xp: '250' })).toBe('250 XP Ganhos');
        
        setLanguage('en');
        expect(t('xp_earned', { xp: '250' })).toBe('250 XP Earned');
        
        setLanguage('es');
        expect(t('xp_earned', { xp: '250' })).toBe('250 XP Ganados');
      });
    });

    describe('Phase Advancement', () => {
      it('should translate phase advancement terms', () => {
        setLanguage('pt');
        expect(t('phase_advancement')).toBe('Avanço de Fase');
        expect(t('next_phase')).toBe('Próxima Fase');
        expect(t('advancement_criteria')).toBe('Para avançar, você precisa:');
        expect(t('mastery_reached')).toBe('Parabéns! Você alcançou a fase máxima!');

        setLanguage('en');
        expect(t('phase_advancement')).toBe('Phase Advancement');
        expect(t('next_phase')).toBe('Next Phase');
        expect(t('advancement_criteria')).toBe('To advance, you need:');
        expect(t('mastery_reached')).toBe('Congratulations! You reached the maximum phase!');

        setLanguage('es');
        expect(t('phase_advancement')).toBe('Avance de Fase');
        expect(t('next_phase')).toBe('Siguiente Fase');
        expect(t('advancement_criteria')).toBe('Para avanzar, necesitas:');
        expect(t('mastery_reached')).toBe('¡Felicitaciones! ¡Alcanzaste la fase máxima!');
      });

      it('should handle phase advancement interpolation', () => {
        setLanguage('pt');
        expect(t('advance_to_phase', { phase: 'Desenvolvimento' })).toBe('Avançar para Desenvolvimento');
        
        setLanguage('en');
        expect(t('advance_to_phase', { phase: 'Development' })).toBe('Advance to Development');
        
        setLanguage('es');
        expect(t('advance_to_phase', { phase: 'Desarrollo' })).toBe('Avanzar a Desarrollo');
      });
    });

    describe('Adaptive Plan Generation', () => {
      it('should translate plan generation terms', () => {
        setLanguage('pt');
        expect(t('adaptive_plan')).toBe('Plano Adaptativo');
        expect(t('generating_adaptive_plan')).toBe('Gerando Plano Adaptativo...');
        expect(t('adaptive_plan_generated')).toBe('Plano Adaptativo Gerado!');
        expect(t('generate_new_plan')).toBe('Gerar Novo Plano');

        setLanguage('en');
        expect(t('adaptive_plan')).toBe('Adaptive Plan');
        expect(t('generating_adaptive_plan')).toBe('Generating Adaptive Plan...');
        expect(t('adaptive_plan_generated')).toBe('Adaptive Plan Generated!');
        expect(t('generate_new_plan')).toBe('Generate New Plan');

        setLanguage('es');
        expect(t('adaptive_plan')).toBe('Plan Adaptativo');
        expect(t('generating_adaptive_plan')).toBe('Generando Plan Adaptativo...');
        expect(t('adaptive_plan_generated')).toBe('¡Plan Adaptativo Generado!');
        expect(t('generate_new_plan')).toBe('Generar Nuevo Plan');
      });
    });

    describe('Motivational Messages', () => {
      it('should translate motivational messages', () => {
        setLanguage('pt');
        expect(t('first_workout_motivation')).toContain('Complete seu primeiro treino');
        expect(t('continue_training_motivation')).toContain('Continue treinando');
        expect(t('all_achievements_motivation')).toContain('Parabéns! Você desbloqueou');

        setLanguage('en');
        expect(t('first_workout_motivation')).toContain('Complete your first workout');
        expect(t('continue_training_motivation')).toContain('Keep training');
        expect(t('all_achievements_motivation')).toContain('Congratulations! You unlocked');

        setLanguage('es');
        expect(t('first_workout_motivation')).toContain('Completa tu primer entrenamiento');
        expect(t('continue_training_motivation')).toContain('Continúa entrenando');
        expect(t('all_achievements_motivation')).toContain('¡Felicitaciones! ¡Desbloqueaste');
      });
    });

    describe('Legacy Plan Support', () => {
      it('should translate legacy plan terms', () => {
        setLanguage('pt');
        expect(t('legacy_plan')).toBe('Plano Legado');
        expect(t('continuous_training')).toBe('Treino contínuo baseado na sua progressão');
        expect(t('plans_evolve')).toBe('Planos que evoluem com você');

        setLanguage('en');
        expect(t('legacy_plan')).toBe('Legacy Plan');
        expect(t('continuous_training')).toBe('Continuous training based on your progression');
        expect(t('plans_evolve')).toBe('Plans that evolve with you');

        setLanguage('es');
        expect(t('legacy_plan')).toBe('Plan Legado');
        expect(t('continuous_training')).toBe('Entrenamiento continuo basado en tu progresión');
        expect(t('plans_evolve')).toBe('Planes que evolucionan contigo');
      });
    });
  });

  describe('Workout Completion', () => {
    it('should translate workout completion terms', () => {
      setLanguage('pt');
      expect(t('workout_completed')).toBe('Treino Concluído!');
      expect(t('new_level_reached', { level: '5' })).toBe('Nível 5 Alcançado!');

      setLanguage('en');
      expect(t('workout_completed')).toBe('Workout Completed!');
      expect(t('new_level_reached', { level: '5' })).toBe('Level 5 Reached!');

      setLanguage('es');
      expect(t('workout_completed')).toBe('¡Entrenamiento Completado!');
      expect(t('new_level_reached', { level: '5' })).toBe('¡Nivel 5 Alcanzado!');
    });
  });

  describe('Progress & Stats', () => {
    it('should translate progress and stats terms', () => {
      setLanguage('pt');
      expect(t('gamified_stats')).toBe('Estatísticas Gamificadas');
      expect(t('current_phase')).toBe('Fase Atual');
      expect(t('phase_progress')).toBe('Progresso da Fase');

      setLanguage('en');
      expect(t('gamified_stats')).toBe('Gamified Stats');
      expect(t('current_phase')).toBe('Current Phase');
      expect(t('phase_progress')).toBe('Phase Progress');

      setLanguage('es');
      expect(t('gamified_stats')).toBe('Estadísticas Gamificadas');
      expect(t('current_phase')).toBe('Fase Actual');
      expect(t('phase_progress')).toBe('Progreso de Fase');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing parameters gracefully', () => {
      setLanguage('pt');
      expect(t('xp_remaining')).toBe('Faltam {{xp}} XP'); // Should return with placeholder
    });

    it('should handle empty string parameters', () => {
      setLanguage('pt');
      expect(t('xp_remaining', { xp: '' })).toBe('Faltam  XP');
    });

    it('should handle numeric parameters', () => {
      setLanguage('pt');
      expect(t('xp_remaining', { xp: 1000 })).toBe('Faltam 1000 XP');
    });
  });
}); 