const { supabase } = require('../config/supabase.js');
const XPCalculatorService = require('./xpService.js');

/**
 * Serviço para gerenciamento de progressão de usuários
 * Task 1.2.2: Lógica de progressão de níveis
 * Task 1.2.3: Sistema de conquistas e badges
 */

class ProgressionService {
  // Definição de conquistas (achievements)
  static ACHIEVEMENTS = {
    // Conquistas de distância
    first_run: {
      id: 'first_run',
      name: { pt: 'Primeiro Passo', en: 'First Step', es: 'Primer Paso' },
      description: { pt: 'Complete sua primeira corrida', en: 'Complete your first run', es: 'Completa tu primera carrera' },
      icon: '🏃‍♂️',
      xp_reward: 100,
      criteria: { total_workouts_completed: 1 }
    },
    
    distance_5k: {
      id: 'distance_5k',
      name: { pt: '5K Warrior', en: '5K Warrior', es: 'Guerrero 5K' },
      description: { pt: 'Corra 5km em uma sessão', en: 'Run 5km in a single session', es: 'Corre 5km en una sesión' },
      icon: '🏃',
      xp_reward: 200,
      criteria: { single_run_distance: 5 }
    },
    
    distance_10k: {
      id: 'distance_10k',
      name: { pt: '10K Champion', en: '10K Champion', es: 'Campeón 10K' },
      description: { pt: 'Corra 10km em uma sessão', en: 'Run 10km in a single session', es: 'Corre 10km en una sesión' },
      icon: '🏃‍♀️',
      xp_reward: 500,
      criteria: { single_run_distance: 10 }
    },
    
    distance_half_marathon: {
      id: 'distance_half_marathon',
      name: { pt: 'Meio Maratonista', en: 'Half Marathoner', es: 'Medio Maratonista' },
      description: { pt: 'Complete uma meia maratona (21km)', en: 'Complete a half marathon (21km)', es: 'Completa un medio maratón (21km)' },
      icon: '🏅',
      xp_reward: 1000,
      criteria: { single_run_distance: 21 }
    },
    
    distance_marathon: {
      id: 'distance_marathon',
      name: { pt: 'Maratonista', en: 'Marathoner', es: 'Maratonista' },
      description: { pt: 'Complete uma maratona (42km)', en: 'Complete a marathon (42km)', es: 'Completa un maratón (42km)' },
      icon: '🏆',
      xp_reward: 2000,
      criteria: { single_run_distance: 42 }
    },
    
    // Conquistas de volume total
    total_100k: {
      id: 'total_100k',
      name: { pt: 'Centena', en: 'Century', es: 'Centena' },
      description: { pt: '100km de distância total', en: '100km total distance', es: '100km de distancia total' },
      icon: '💯',
      xp_reward: 300,
      criteria: { total_distance_run: 100 }
    },
    
    total_500k: {
      id: 'total_500k',
      name: { pt: 'Quinhentos', en: 'Five Hundred', es: 'Quinientos' },
      description: { pt: '500km de distância total', en: '500km total distance', es: '500km de distancia total' },
      icon: '🚀',
      xp_reward: 750,
      criteria: { total_distance_run: 500 }
    },
    
    total_1000k: {
      id: 'total_1000k',
      name: { pt: 'Mil Quilômetros', en: 'Thousand Kilometers', es: 'Mil Kilómetros' },
      description: { pt: '1000km de distância total', en: '1000km total distance', es: '1000km de distancia total' },
      icon: '⭐',
      xp_reward: 1500,
      criteria: { total_distance_run: 1000 }
    },
    
    // Conquistas de consistência
    streak_7: {
      id: 'streak_7',
      name: { pt: 'Semana Perfeita', en: 'Perfect Week', es: 'Semana Perfecta' },
      description: { pt: '7 dias consecutivos de treino', en: '7 consecutive days of training', es: '7 días consecutivos de entrenamiento' },
      icon: '🔥',
      xp_reward: 200,
      criteria: { current_streak_days: 7 }
    },
    
    streak_30: {
      id: 'streak_30',
      name: { pt: 'Mês Dedicado', en: 'Dedicated Month', es: 'Mes Dedicado' },
      description: { pt: '30 dias consecutivos de treino', en: '30 consecutive days of training', es: '30 días consecutivos de entrenamiento' },
      icon: '🔥🔥',
      xp_reward: 500,
      criteria: { current_streak_days: 30 }
    },
    
    streak_100: {
      id: 'streak_100',
      name: { pt: 'Cem Dias', en: 'Hundred Days', es: 'Cien Días' },
      description: { pt: '100 dias consecutivos de treino', en: '100 consecutive days of training', es: '100 días consecutivos de entrenamiento' },
      icon: '🔥🔥🔥',
      xp_reward: 1000,
      criteria: { current_streak_days: 100 }
    },
    
    // Conquistas de treinos
    workouts_10: {
      id: 'workouts_10',
      name: { pt: 'Dez Treinos', en: 'Ten Workouts', es: 'Diez Entrenamientos' },
      description: { pt: 'Complete 10 treinos', en: 'Complete 10 workouts', es: 'Completa 10 entrenamientos' },
      icon: '💪',
      xp_reward: 150,
      criteria: { total_workouts_completed: 10 }
    },
    
    workouts_50: {
      id: 'workouts_50',
      name: { pt: 'Cinquenta Treinos', en: 'Fifty Workouts', es: 'Cincuenta Entrenamientos' },
      description: { pt: 'Complete 50 treinos', en: 'Complete 50 workouts', es: 'Completa 50 entrenamientos' },
      icon: '💪💪',
      xp_reward: 400,
      criteria: { total_workouts_completed: 50 }
    },
    
    workouts_100: {
      id: 'workouts_100',
      name: { pt: 'Cem Treinos', en: 'Hundred Workouts', es: 'Cien Entrenamientos' },
      description: { pt: 'Complete 100 treinos', en: 'Complete 100 workouts', es: 'Completa 100 entrenamientos' },
      icon: '💪💪💪',
      xp_reward: 750,
      criteria: { total_workouts_completed: 100 }
    },
    
    // Conquistas de progressão de fase
    phase_foundation_complete: {
      id: 'phase_foundation_complete',
      name: { pt: 'Base Sólida', en: 'Solid Foundation', es: 'Base Sólida' },
      description: { pt: 'Complete a fase Fundação', en: 'Complete the Foundation phase', es: 'Completa la fase Fundación' },
      icon: '🏗️',
      xp_reward: 300,
      criteria: { completed_phase: 'foundation' }
    },
    
    phase_endurance_complete: {
      id: 'phase_endurance_complete',
      name: { pt: 'Resistência Construída', en: 'Endurance Built', es: 'Resistencia Construida' },
      description: { pt: 'Complete a fase Construção de Resistência', en: 'Complete the Endurance Building phase', es: 'Completa la fase Construcción de Resistencia' },
      icon: '⛰️',
      xp_reward: 500,
      criteria: { completed_phase: 'endurance_building' }
    },
    
    phase_speed_complete: {
      id: 'phase_speed_complete',
      name: { pt: 'Velocista', en: 'Speedster', es: 'Velocista' },
      description: { pt: 'Complete a fase Velocidade e Força', en: 'Complete the Speed & Strength phase', es: 'Completa la fase Velocidad y Fuerza' },
      icon: '⚡',
      xp_reward: 750,
      criteria: { completed_phase: 'speed_strength' }
    },
    
    level_max_any_phase: {
      id: 'level_max_any_phase',
      name: { pt: 'Nível Máximo', en: 'Max Level', es: 'Nivel Máximo' },
      description: { pt: 'Atinja o nível 10 em qualquer fase', en: 'Reach level 10 in any phase', es: 'Alcanza el nivel 10 en cualquier fase' },
      icon: '⭐',
      xp_reward: 500,
      criteria: { max_level_reached: 10 }
    }
  };

  /**
   * Verifica e atribui conquistas para um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} userProgress - Progresso atual do usuário
   * @param {Object} recentWorkout - Dados do treino recém concluído (opcional)
   * @returns {Array} - Conquistas desbloqueadas
   */
  static async checkAndAwardAchievements(userId, userProgress, recentWorkout = null) {
    try {
      const currentAchievements = userProgress.achievements || [];
      const newAchievements = [];
      let totalXPFromAchievements = 0;

      // Verificar cada conquista
      for (const [achievementId, achievement] of Object.entries(this.ACHIEVEMENTS)) {
        // Pular se já possui a conquista
        if (currentAchievements.includes(achievementId)) {
          continue;
        }

        // Verificar se atende aos critérios
        if (this.meetsAchievementCriteria(achievement.criteria, userProgress, recentWorkout)) {
          newAchievements.push({
            ...achievement,
            unlocked_at: new Date().toISOString()
          });
          totalXPFromAchievements += achievement.xp_reward;
        }
      }

      // Atualizar banco de dados se houver novas conquistas
      if (newAchievements.length > 0) {
        const updatedAchievements = [...currentAchievements, ...newAchievements.map(a => a.id)];
        
        // Atualizar progresso no banco
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            achievements: updatedAchievements,
            total_xp_earned: userProgress.total_xp_earned + totalXPFromAchievements
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating achievements:', updateError);
          return [];
        }

        console.log(`User ${userId} unlocked ${newAchievements.length} new achievements, gaining ${totalXPFromAchievements} XP`);
      }

      return newAchievements;

    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Verifica se um usuário atende aos critérios de uma conquista
   */
  static meetsAchievementCriteria(criteria, userProgress, recentWorkout) {
    // Verificar se userProgress existe
    if (!userProgress) return false;
    
    // Verificar critérios de progresso
    for (const [key, value] of Object.entries(criteria)) {
      switch (key) {
      case 'total_workouts_completed':
        if (userProgress.total_workouts_completed < value) return false;
        break;
          
      case 'total_distance_run':
        if (userProgress.total_distance_run < value) return false;
        break;
          
      case 'current_streak_days':
        if (userProgress.current_streak_days < value) return false;
        break;
          
      case 'single_run_distance':
        if (!recentWorkout || recentWorkout.distance < value) return false;
        break;
          
      case 'completed_phase':
        // Verificar se completou uma fase específica (implementação futura)
        return false; // Placeholder
          
      case 'max_level_reached':
        if (userProgress.current_level < value) return false;
        break;
          
      default:
        console.warn(`Unknown achievement criteria: ${key}`);
        break;
      }
    }
    
    return true;
  }

  /**
   * Verifica critérios de avanço de fase
   * @param {Object} userProgress - Progresso do usuário
   * @param {number} currentPhaseId - ID da fase atual
   * @returns {Object} - Informações sobre elegibilidade para avanço
   */
  static async checkPhaseAdvancement(userProgress, currentPhaseId) {
    try {
      // Buscar dados da fase atual
      const { data: currentPhase, error: phaseError } = await supabase
        .from('training_phases')
        .select('*')
        .eq('id', currentPhaseId)
        .single();

      if (phaseError) throw phaseError;

      // Verificar se atingiu nível máximo da fase
      const maxLevelReached = userProgress.current_level >= currentPhase.max_level;

      // Verificar critérios de saída da fase
      const meetsExitCriteria = this.evaluateExitCriteria(
        currentPhase.exit_criteria,
        userProgress
      );

      // Determinar próxima fase
      let nextPhase = null;
      if (maxLevelReached && meetsExitCriteria) {
        const { data: nextPhaseData } = await supabase
          .from('training_phases')
          .select('*')
          .eq('phase_order', currentPhase.phase_order + 1)
          .eq('is_active', true)
          .single();

        nextPhase = nextPhaseData;
      }

      return {
        canAdvance: maxLevelReached && meetsExitCriteria,
        maxLevelReached,
        meetsExitCriteria,
        nextPhase,
        currentPhase,
        missingCriteria: this.getMissingCriteria(currentPhase.exit_criteria, userProgress)
      };

    } catch (error) {
      console.error('Error checking phase advancement:', error);
      return {
        canAdvance: false,
        error: error.message
      };
    }
  }

  /**
   * Avalia critérios de saída de uma fase
   */
  static evaluateExitCriteria(exitCriteria, userProgress) {
    for (const [key, value] of Object.entries(exitCriteria)) {
      switch (key) {
      case 'can_run_continuous_minutes':
        // Verificar se consegue correr X minutos contínuos
        // Implementação simplificada baseada em treinos recentes
        if (userProgress.total_workouts_completed < 8) return false;
        break;
          
      case 'completed_weeks': {
        // Verificar se completou X semanas na fase
        const weeksInPhase = this.calculateWeeksInCurrentPhase(userProgress.phase_started_at);
        if (weeksInPhase < value) return false;
        break;
      }
          
      case 'can_complete_10k':
        // Verificar se consegue completar 10k
        if (userProgress.total_distance_run < 50) return false; // Heurística simples
        break;
          
      case 'weekly_volume_km': {
        // Verificar volume semanal médio
        const avgWeeklyVolume = this.calculateAverageWeeklyVolume(userProgress);
        if (avgWeeklyVolume < value) return false;
        break;
      }
          
      case 'can_complete_half_marathon':
        // Verificar se consegue completar meia maratona
        if (userProgress.total_distance_run < 200) return false; // Heurística
        break;
          
      case 'improved_5k_time':
        // Verificar se melhorou tempo nos 5k
        if (!userProgress.best_5k_time) return false;
        break;
          
      case 'can_complete_marathon':
        // Verificar se consegue completar maratona
        if (userProgress.total_distance_run < 500) return false; // Heurística
        break;
          
      case 'personal_records':
        // Verificar se estabeleceu recordes pessoais
        if (!userProgress.best_5k_time && !userProgress.best_10k_time) return false;
        break;
          
      case 'completed_marathons':
        // Verificar número de maratonas completadas
        // Implementação futura - consultar histórico de corridas
        return false; // Placeholder
          
      case 'competitive_times':
        // Verificar tempos competitivos
        // Implementação futura
        return false; // Placeholder
          
      case 'continuous_improvement':
        // Para fase elite - sempre em melhoria contínua
        return true;
          
      default:
        console.warn(`Unknown exit criteria: ${key}`);
        break;
      }
    }
    
    return true;
  }

  /**
   * Calcula semanas na fase atual
   */
  static calculateWeeksInCurrentPhase(phaseStartedAt) {
    if (!phaseStartedAt) return 0;
    
    const startDate = new Date(phaseStartedAt);
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return diffWeeks;
  }

  /**
   * Calcula volume semanal médio
   */
  static calculateAverageWeeklyVolume(userProgress) {
    const weeksInPhase = this.calculateWeeksInCurrentPhase(userProgress.phase_started_at);
    
    // Se não há data de início da fase, retorna 0
    if (!userProgress.phase_started_at) return 0;
    
    // Divide pelo máximo entre semanas na fase e 1 (para evitar divisão por zero)
    return userProgress.total_distance_run / Math.max(weeksInPhase, 1);
  }

  /**
   * Identifica critérios em falta para avanço de fase
   */
  static getMissingCriteria(exitCriteria, userProgress) {
    const missing = [];
    
    for (const [key, value] of Object.entries(exitCriteria)) {
      if (!this.evaluateExitCriteria({ [key]: value }, userProgress)) {
        missing.push({ criteria: key, required: value });
      }
    }
    
    return missing;
  }

  /**
   * Promove usuário para a próxima fase
   * @param {string} userId - ID do usuário
   * @param {number} newPhaseId - ID da nova fase
   * @returns {Object} - Resultado da promoção
   */
  static async promoteToNextPhase(userId, newPhaseId) {
    try {
      const { data: updatedProgress, error: updateError } = await supabase
        .from('user_progress')
        .update({
          current_phase_id: newPhaseId,
          current_level: 1, // Reiniciar no nível 1 da nova fase
          current_xp: 0,
          xp_to_next_level: XPCalculatorService.calculateXPToNextLevel(1),
          phase_started_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Verificar e atribuir conquista de conclusão de fase
      await this.checkAndAwardAchievements(userId, updatedProgress);

      return {
        success: true,
        progress: updatedProgress,
        message: 'Promovido para a próxima fase com sucesso!'
      };

    } catch (error) {
      console.error('Error promoting to next phase:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém estatísticas de progressão de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} - Estatísticas completas
   */
  static async getUserProgressionStats(userId) {
    try {
      // Buscar progresso do usuário com dados da fase
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          *,
          training_phases!inner (
            id,
            name,
            display_name,
            description,
            phase_order,
            max_level
          )
        `)
        .eq('user_id', userId)
        .single();

      if (progressError) throw progressError;

      // Calcular estatísticas
      const stats = {
        currentPhase: progressData.training_phases,
        currentLevel: progressData.current_level,
        currentXP: progressData.current_xp,
        xpToNextLevel: progressData.xp_to_next_level,
        totalXP: progressData.total_xp_earned,
        
        // Estatísticas de treino
        totalWorkouts: progressData.total_workouts_completed,
        totalDistance: progressData.total_distance_run,
        currentStreak: progressData.current_streak_days,
        longestStreak: progressData.longest_streak_days,
        
        // Recordes pessoais
        personalRecords: {
          '5k': progressData.best_5k_time,
          '10k': progressData.best_10k_time,
          'half_marathon': progressData.best_half_marathon_time,
          'marathon': progressData.best_marathon_time
        },
        
        // Conquistas
        achievements: progressData.achievements || [],
        achievementCount: (progressData.achievements || []).length,
        
        // Progresso na fase
        phaseProgress: {
          level: progressData.current_level,
          maxLevel: progressData.training_phases.max_level,
          levelProgress: (progressData.current_level / progressData.training_phases.max_level) * 100,
          xpProgress: (progressData.current_xp / progressData.xp_to_next_level) * 100,
          weeksInPhase: this.calculateWeeksInCurrentPhase(progressData.phase_started_at)
        },
        
        // Timestamps
        phaseStartedAt: progressData.phase_started_at,
        lastWorkoutAt: progressData.last_workout_at,
        lastLevelUpAt: progressData.last_level_up_at
      };

      // Verificar elegibilidade para avanço de fase
      const advancementCheck = await this.checkPhaseAdvancement(
        progressData,
        progressData.current_phase_id
      );
      
      stats.phaseAdvancement = advancementCheck;

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('Error getting user progression stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ProgressionService; 