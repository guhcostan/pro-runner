const AdaptivePlanService = require('../services/adaptivePlanService');
const ProgressionService = require('../services/progressionService');
const XPCalculatorService = require('../services/xpService');
const { supabase } = require('../config/supabase');

/**
 * Controller para endpoints do sistema adaptativo
 * Task 3.1: Novos Endpoints da API
 */

class AdaptiveController {
  /**
   * GET /api/users/:id/progress
   * Retorna progressão completa do usuário
   */
  static async getUserProgress(req, res) {
    try {
      const { id: userId } = req.params;

      const progressStats = await ProgressionService.getUserProgressionStats(userId);
      
      if (!progressStats.success) {
        return res.status(404).json({
          success: false,
          error: progressStats.error
        });
      }

      res.json({
        success: true,
        data: progressStats.stats
      });

    } catch (error) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/users/:id/adaptive-plan
   * Gera plano adaptativo baseado na fase atual
   */
  static async generateAdaptivePlan(req, res) {
    try {
      const { id: userId } = req.params;
      const options = req.body || {};

      const planResult = await AdaptivePlanService.generateAdaptivePlan(userId, options);
      
      if (!planResult.success) {
        return res.status(400).json({
          success: false,
          error: planResult.error
        });
      }

      res.json({
        success: true,
        data: {
          plan: planResult.plan,
          assessment: planResult.assessment,
          message: planResult.message
        }
      });

    } catch (error) {
      console.error('Error generating adaptive plan:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/workouts/:id/complete
   * Registra conclusão de treino e calcula XP
   */
  static async completeWorkout(req, res) {
    try {
      const { userId, distance, duration, type, difficulty } = req.body;

      if (!userId || !distance || !duration || !type) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, distance, duration, type'
        });
      }

      // Buscar progresso atual do usuário
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        return res.status(404).json({
          success: false,
          error: 'User progress not found'
        });
      }

      // Calcular XP do treino
      const workout = { type, distance, duration, difficulty: difficulty || 'moderate' };
      const xpResult = XPCalculatorService.calculateWorkoutXP(workout, userProgress);

      // Atualizar progresso do usuário
      const newTotalXP = userProgress.total_xp_earned + xpResult.totalXP;
      const newCurrentXP = userProgress.current_xp + xpResult.totalXP;
      
      // Verificar se subiu de nível
      let newLevel = userProgress.current_level;
      let newXPToNext = userProgress.xp_to_next_level;
      let leveledUp = false;

      if (newCurrentXP >= userProgress.xp_to_next_level) {
        const levelResult = XPCalculatorService.calculateLevelProgression(
          userProgress.current_level,
          newCurrentXP
        );
        newLevel = levelResult.newLevel;
        newXPToNext = levelResult.xpToNextLevel;
        leveledUp = levelResult.leveledUp;
      }

      // Atualizar banco de dados
      const { data: updatedProgress, error: updateError } = await supabase
        .from('user_progress')
        .update({
          total_xp_earned: newTotalXP,
          current_xp: newCurrentXP >= newXPToNext ? newCurrentXP - newXPToNext : newCurrentXP,
          current_level: newLevel,
          xp_to_next_level: newXPToNext,
          total_workouts_completed: userProgress.total_workouts_completed + 1,
          total_distance_run: userProgress.total_distance_run + distance,
          last_workout_date: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Verificar conquistas
      const newAchievements = await ProgressionService.checkAndAwardAchievements(
        userId, 
        updatedProgress, 
        workout
      );

      // Verificar avanço de fase
      const phaseAdvancement = await ProgressionService.checkPhaseAdvancement(
        updatedProgress, 
        updatedProgress.current_phase_id
      );

      res.json({
        success: true,
        data: {
          xpEarned: xpResult.totalXP,
          xpBreakdown: xpResult,
          leveledUp,
          newLevel,
          newAchievements,
          phaseAdvancement,
          updatedProgress
        }
      });

    } catch (error) {
      console.error('Error completing workout:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/users/:id/stats
   * Retorna estatísticas gamificadas do usuário
   */
  static async getGamifiedStats(req, res) {
    try {
      const { id: userId } = req.params;

      // Buscar progresso do usuário
      const progressResult = await ProgressionService.getUserProgressionStats(userId);
      
      if (!progressResult.success) {
        return res.status(404).json({
          success: false,
          error: progressResult.error
        });
      }

      const stats = progressResult.stats;

      // Calcular ranking (implementação simplificada)
      const { data: allUsers, error: rankingError } = await supabase
        .from('user_progress')
        .select('user_id, total_xp_earned')
        .order('total_xp_earned', { ascending: false });

      let userRank = 1;
      if (!rankingError && allUsers) {
        userRank = allUsers.findIndex(user => user.user_id === userId) + 1;
      }

      // Estatísticas adicionais
      const gamifiedStats = {
        ...stats,
        ranking: {
          position: userRank,
          totalUsers: allUsers ? allUsers.length : 1,
          percentile: Math.round((1 - (userRank - 1) / allUsers.length) * 100)
        },
        nextMilestones: {
          nextLevel: {
            level: stats.currentLevel + 1,
            xpNeeded: stats.xpToNextLevel - stats.currentXP,
            progressPercentage: Math.round((stats.currentXP / stats.xpToNextLevel) * 100)
          },
          nextPhase: stats.phaseAdvancement.canAdvance ? {
            phase: stats.phaseAdvancement.nextPhase?.name,
            criteria: stats.phaseAdvancement.missingCriteria
          } : null
        },
        weeklyStats: {
          workoutsThisWeek: await this.getWeeklyWorkoutCount(userId),
          distanceThisWeek: await this.getWeeklyDistance(userId),
          xpThisWeek: await this.getWeeklyXP(userId)
        }
      };

      res.json({
        success: true,
        data: gamifiedStats
      });

    } catch (error) {
      console.error('Error fetching gamified stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/users/:id/phase/advance
   * Promove usuário para próxima fase
   */
  static async advanceToNextPhase(req, res) {
    try {
      const { id: userId } = req.params;
      const { newPhaseId } = req.body;

      if (!newPhaseId) {
        return res.status(400).json({
          success: false,
          error: 'newPhaseId is required'
        });
      }

      const result = await ProgressionService.promoteToNextPhase(userId, newPhaseId);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: result,
        message: 'Usuário promovido para a próxima fase com sucesso!'
      });

    } catch (error) {
      console.error('Error advancing to next phase:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/phases
   * Lista todas as fases de treinamento disponíveis
   */
  static async getTrainingPhases(req, res) {
    try {
      const { data: phases, error } = await supabase
        .from('training_phases')
        .select('*')
        .eq('is_active', true)
        .order('phase_order');

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: phases
      });

    } catch (error) {
      console.error('Error fetching training phases:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Métodos auxiliares para estatísticas semanais
   */
  static async getWeeklyWorkoutCount(userId) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', oneWeekAgo.toISOString());

      return count || 0;
    } catch (error) {
      console.error('Error getting weekly workout count:', error);
      return 0;
    }
  }

  static async getWeeklyDistance(userId) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data } = await supabase
        .from('workouts')
        .select('distance')
        .eq('user_id', userId)
        .gte('completed_at', oneWeekAgo.toISOString());

      return data ? data.reduce((total, workout) => total + (workout.distance || 0), 0) : 0;
    } catch (error) {
      console.error('Error getting weekly distance:', error);
      return 0;
    }
  }

  static async getWeeklyXP(userId) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data } = await supabase
        .from('workouts')
        .select('xp_earned')
        .eq('user_id', userId)
        .gte('completed_at', oneWeekAgo.toISOString());

      return data ? data.reduce((total, workout) => total + (workout.xp_earned || 0), 0) : 0;
    } catch (error) {
      console.error('Error getting weekly XP:', error);
      return 0;
    }
  }
}

module.exports = AdaptiveController; 