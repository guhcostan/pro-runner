const { i18n } = require('../../src/constants/i18n');

describe('Backend i18n System', () => {
  describe('Language Structure', () => {
    it('should have all required languages', () => {
      expect(i18n).toHaveProperty('pt');
      expect(i18n).toHaveProperty('en');
      expect(i18n).toHaveProperty('es');
    });

    it('should have consistent structure across languages', () => {
      const languages = ['pt', 'en', 'es'];
      const sections = ['cache', 'errors', 'performance', 'adaptive'];
      
      languages.forEach(lang => {
        sections.forEach(section => {
          expect(i18n[lang]).toHaveProperty(section);
        });
      });
    });
  });

  describe('Cache Messages', () => {
    it('should translate cache messages in Portuguese', () => {
      expect(i18n.pt.cache.stats_retrieved).toBe('Estatísticas do cache obtidas com sucesso');
      expect(i18n.pt.cache.cleared).toBe('Cache limpo com sucesso');
      expect(i18n.pt.cache.not_found).toBe('Cache não encontrado');
    });

    it('should translate cache messages in English', () => {
      expect(i18n.en.cache.stats_retrieved).toBe('Cache statistics retrieved successfully');
      expect(i18n.en.cache.cleared).toBe('Cache cleared successfully');
      expect(i18n.en.cache.not_found).toBe('Cache not found');
    });

    it('should translate cache messages in Spanish', () => {
      expect(i18n.es.cache.stats_retrieved).toBe('Estadísticas de caché obtenidas exitosamente');
      expect(i18n.es.cache.cleared).toBe('Caché limpiado exitosamente');
      expect(i18n.es.cache.not_found).toBe('Caché no encontrado');
    });
  });

  describe('Error Messages', () => {
    const errorCodes = [
      'INTERNAL_ERROR',
      'VALIDATION_ERROR',
      'AUTHENTICATION_ERROR',
      'AUTHORIZATION_ERROR',
      'NOT_FOUND',
      'DATABASE_ERROR',
      'RATE_LIMIT_ERROR'
    ];

    it('should have all error codes in Portuguese', () => {
      errorCodes.forEach(code => {
        expect(i18n.pt.errors).toHaveProperty(code);
        expect(typeof i18n.pt.errors[code]).toBe('string');
        expect(i18n.pt.errors[code].length).toBeGreaterThan(0);
      });
    });

    it('should have all error codes in English', () => {
      errorCodes.forEach(code => {
        expect(i18n.en.errors).toHaveProperty(code);
        expect(typeof i18n.en.errors[code]).toBe('string');
        expect(i18n.en.errors[code].length).toBeGreaterThan(0);
      });
    });

    it('should have all error codes in Spanish', () => {
      errorCodes.forEach(code => {
        expect(i18n.es.errors).toHaveProperty(code);
        expect(typeof i18n.es.errors[code]).toBe('string');
        expect(i18n.es.errors[code].length).toBeGreaterThan(0);
      });
    });

    it('should translate specific error messages correctly', () => {
      expect(i18n.pt.errors.INTERNAL_ERROR).toBe('Erro interno do servidor');
      expect(i18n.en.errors.INTERNAL_ERROR).toBe('Internal server error');
      expect(i18n.es.errors.INTERNAL_ERROR).toBe('Error interno del servidor');

      expect(i18n.pt.errors.NOT_FOUND).toBe('Recurso não encontrado');
      expect(i18n.en.errors.NOT_FOUND).toBe('Resource not found');
      expect(i18n.es.errors.NOT_FOUND).toBe('Recurso no encontrado');
    });
  });

  describe('Performance Messages', () => {
    const performanceKeys = [
      'stats_retrieved',
      'summary_retrieved',
      'recommendations_retrieved',
      'database_stats_retrieved',
      'stats_cleared',
      'overview_retrieved',
      'export_success'
    ];

    it('should have all performance keys in all languages', () => {
      const languages = ['pt', 'en', 'es'];
      languages.forEach(lang => {
        performanceKeys.forEach(key => {
          expect(i18n[lang].performance).toHaveProperty(key);
          expect(typeof i18n[lang].performance[key]).toBe('string');
          expect(i18n[lang].performance[key].length).toBeGreaterThan(0);
        });
      });
    });

    it('should translate performance messages correctly', () => {
      expect(i18n.pt.performance.stats_retrieved).toBe('Estatísticas de performance obtidas com sucesso');
      expect(i18n.en.performance.stats_retrieved).toBe('Performance statistics retrieved successfully');
      expect(i18n.es.performance.stats_retrieved).toBe('Estadísticas de rendimiento obtenidas exitosamente');
    });
  });

  describe('Adaptive System Messages', () => {
    const adaptiveKeys = [
      'plan_generated',
      'plan_generation_failed',
      'progress_updated',
      'progress_not_found',
      'phase_advanced',
      'phase_advancement_failed',
      'max_phase_reached',
      'invalid_phase',
      'xp_calculated',
      'level_up',
      'workout_completed',
      'achievement_unlocked',
      'stats_retrieved',
      'phases_retrieved'
    ];

    it('should have all adaptive keys in all languages', () => {
      const languages = ['pt', 'en', 'es'];
      languages.forEach(lang => {
        adaptiveKeys.forEach(key => {
          expect(i18n[lang].adaptive).toHaveProperty(key);
          expect(typeof i18n[lang].adaptive[key]).toBe('string');
          expect(i18n[lang].adaptive[key].length).toBeGreaterThan(0);
        });
      });
    });

    describe('Plan Generation Messages', () => {
      it('should translate plan generation messages in Portuguese', () => {
        expect(i18n.pt.adaptive.plan_generated).toBe('Plano adaptativo gerado com sucesso');
        expect(i18n.pt.adaptive.plan_generation_failed).toBe('Falha ao gerar plano adaptativo');
      });

      it('should translate plan generation messages in English', () => {
        expect(i18n.en.adaptive.plan_generated).toBe('Adaptive plan generated successfully');
        expect(i18n.en.adaptive.plan_generation_failed).toBe('Failed to generate adaptive plan');
      });

      it('should translate plan generation messages in Spanish', () => {
        expect(i18n.es.adaptive.plan_generated).toBe('Plan adaptativo generado exitosamente');
        expect(i18n.es.adaptive.plan_generation_failed).toBe('Error al generar plan adaptativo');
      });
    });

    describe('Progress Messages', () => {
      it('should translate progress messages in Portuguese', () => {
        expect(i18n.pt.adaptive.progress_updated).toBe('Progresso atualizado com sucesso');
        expect(i18n.pt.adaptive.progress_not_found).toBe('Progresso do usuário não encontrado');
      });

      it('should translate progress messages in English', () => {
        expect(i18n.en.adaptive.progress_updated).toBe('Progress updated successfully');
        expect(i18n.en.adaptive.progress_not_found).toBe('User progress not found');
      });

      it('should translate progress messages in Spanish', () => {
        expect(i18n.es.adaptive.progress_updated).toBe('Progreso actualizado exitosamente');
        expect(i18n.es.adaptive.progress_not_found).toBe('Progreso del usuario no encontrado');
      });
    });

    describe('Phase Advancement Messages', () => {
      it('should translate phase advancement messages in Portuguese', () => {
        expect(i18n.pt.adaptive.phase_advanced).toContain('Fase avançada com sucesso');
        expect(i18n.pt.adaptive.phase_advancement_failed).toBe('Falha ao avançar de fase');
        expect(i18n.pt.adaptive.max_phase_reached).toBe('Fase máxima já alcançada');
        expect(i18n.pt.adaptive.invalid_phase).toBe('Fase inválida especificada');
      });

      it('should translate phase advancement messages in English', () => {
        expect(i18n.en.adaptive.phase_advanced).toContain('Phase advanced successfully');
        expect(i18n.en.adaptive.phase_advancement_failed).toBe('Failed to advance phase');
        expect(i18n.en.adaptive.max_phase_reached).toBe('Maximum phase already reached');
        expect(i18n.en.adaptive.invalid_phase).toBe('Invalid phase specified');
      });

      it('should translate phase advancement messages in Spanish', () => {
        expect(i18n.es.adaptive.phase_advanced).toContain('Fase avanzada exitosamente');
        expect(i18n.es.adaptive.phase_advancement_failed).toBe('Error al avanzar de fase');
        expect(i18n.es.adaptive.max_phase_reached).toBe('Fase máxima ya alcanzada');
        expect(i18n.es.adaptive.invalid_phase).toBe('Fase inválida especificada');
      });

      it('should support parameter interpolation in phase advancement', () => {
        expect(i18n.pt.adaptive.phase_advanced).toContain('{{phase}}');
        expect(i18n.en.adaptive.phase_advanced).toContain('{{phase}}');
        expect(i18n.es.adaptive.phase_advanced).toContain('{{phase}}');
      });
    });

    describe('XP and Level Messages', () => {
      it('should translate XP messages in Portuguese', () => {
        expect(i18n.pt.adaptive.xp_calculated).toContain('XP calculado com sucesso');
        expect(i18n.pt.adaptive.level_up).toContain('Parabéns! Você subiu para o nível');
      });

      it('should translate XP messages in English', () => {
        expect(i18n.en.adaptive.xp_calculated).toContain('XP calculated successfully');
        expect(i18n.en.adaptive.level_up).toContain('Congratulations! You leveled up to level');
      });

      it('should translate XP messages in Spanish', () => {
        expect(i18n.es.adaptive.xp_calculated).toContain('XP calculado exitosamente');
        expect(i18n.es.adaptive.level_up).toContain('¡Felicitaciones! ¡Subiste al nivel');
      });

      it('should support parameter interpolation in XP messages', () => {
        expect(i18n.pt.adaptive.xp_calculated).toContain('{{xp}}');
        expect(i18n.pt.adaptive.level_up).toContain('{{level}}');
        
        expect(i18n.en.adaptive.xp_calculated).toContain('{{xp}}');
        expect(i18n.en.adaptive.level_up).toContain('{{level}}');
        
        expect(i18n.es.adaptive.xp_calculated).toContain('{{xp}}');
        expect(i18n.es.adaptive.level_up).toContain('{{level}}');
      });
    });

    describe('Workout and Achievement Messages', () => {
      it('should translate workout completion messages', () => {
        expect(i18n.pt.adaptive.workout_completed).toBe('Treino completado com sucesso');
        expect(i18n.en.adaptive.workout_completed).toBe('Workout completed successfully');
        expect(i18n.es.adaptive.workout_completed).toBe('Entrenamiento completado exitosamente');
      });

      it('should translate achievement messages', () => {
        expect(i18n.pt.adaptive.achievement_unlocked).toContain('Nova conquista desbloqueada');
        expect(i18n.en.adaptive.achievement_unlocked).toContain('New achievement unlocked');
        expect(i18n.es.adaptive.achievement_unlocked).toContain('Nuevo logro desbloqueado');
      });

      it('should support parameter interpolation in achievement messages', () => {
        expect(i18n.pt.adaptive.achievement_unlocked).toContain('{{achievement}}');
        expect(i18n.en.adaptive.achievement_unlocked).toContain('{{achievement}}');
        expect(i18n.es.adaptive.achievement_unlocked).toContain('{{achievement}}');
      });
    });

    describe('Stats and Phases Messages', () => {
      it('should translate stats retrieval messages', () => {
        expect(i18n.pt.adaptive.stats_retrieved).toBe('Estatísticas gamificadas obtidas com sucesso');
        expect(i18n.en.adaptive.stats_retrieved).toBe('Gamified stats retrieved successfully');
        expect(i18n.es.adaptive.stats_retrieved).toBe('Estadísticas gamificadas obtenidas exitosamente');
      });

      it('should translate phases retrieval messages', () => {
        expect(i18n.pt.adaptive.phases_retrieved).toBe('Fases de treinamento obtidas com sucesso');
        expect(i18n.en.adaptive.phases_retrieved).toBe('Training phases retrieved successfully');
        expect(i18n.es.adaptive.phases_retrieved).toBe('Fases de entrenamiento obtenidas exitosamente');
      });
    });
  });

  describe('Message Consistency', () => {
    it('should have consistent success message patterns', () => {
      const languages = ['pt', 'en', 'es'];
      const successPatterns = {
        pt: ['com sucesso', 'sucesso'],
        en: ['successfully'],
        es: ['exitosamente']
      };

      languages.forEach(lang => {
        const adaptiveMessages = Object.values(i18n[lang].adaptive);
        const successMessages = adaptiveMessages.filter(msg => 
          successPatterns[lang].some(pattern => msg.includes(pattern))
        );
        
        expect(successMessages.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent error message patterns', () => {
      const languages = ['pt', 'en', 'es'];
      const errorPatterns = {
        pt: ['Falha', 'Erro', 'não encontrado'],
        en: ['Failed', 'Error', 'not found'],
        es: ['Error', 'no encontrado']
      };

      languages.forEach(lang => {
        const adaptiveMessages = Object.values(i18n[lang].adaptive);
        const errorMessages = adaptiveMessages.filter(msg => 
          errorPatterns[lang].some(pattern => msg.includes(pattern))
        );
        
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Parameter Interpolation Support', () => {
    it('should identify messages that support parameter interpolation', () => {
      const languages = ['pt', 'en', 'es'];
      const interpolationPattern = /\{\{(\w+)\}\}/;

      languages.forEach(lang => {
        const adaptiveMessages = i18n[lang].adaptive;
        
        // These messages should support interpolation
        expect(adaptiveMessages.phase_advanced).toMatch(interpolationPattern);
        expect(adaptiveMessages.xp_calculated).toMatch(interpolationPattern);
        expect(adaptiveMessages.level_up).toMatch(interpolationPattern);
        expect(adaptiveMessages.achievement_unlocked).toMatch(interpolationPattern);
      });
    });
  });
}); 