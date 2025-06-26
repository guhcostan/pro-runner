const { supabase } = require('../config/supabase.js');

/**
 * Serviço para cálculo e gerenciamento de XP (Experience Points)
 * Task 1.2.1: XP Calculator Service
 */

class XPCalculatorService {
  // Configurações base de XP por tipo de treino
  static XP_BASE_RATES = {
    // Corridas básicas
    easy_run: 10,           // 10 XP por km
    recovery_run: 8,        // 8 XP por km
    walk_run_intervals: 12, // 12 XP por km (iniciantes)
    
    // Treinos de resistência
    long_run: 15,           // 15 XP por km
    tempo_run: 18,          // 18 XP por km
    
    // Treinos de velocidade e intensidade
    interval_training: 20,  // 20 XP por km
    hill_repeats: 22,       // 22 XP por km
    vo2max_intervals: 25,   // 25 XP por km
    
    // Treinos especializados
    marathon_pace: 16,      // 16 XP por km
    strength_runs: 20,      // 20 XP por km
    race_specific: 24,      // 24 XP por km
    
    // Treinos de elite
    ultra_long_runs: 18,    // 18 XP por km
    specialized_intervals: 28, // 28 XP por km
    recovery_protocols: 12,  // 12 XP por km
  };

  // Multiplicadores baseados em duração
  static DURATION_MULTIPLIERS = {
    short: 1.0,     // < 30 min
    medium: 1.1,    // 30-60 min
    long: 1.2,      // 60-90 min
    very_long: 1.3, // > 90 min
  };

  // Bônus de consistência
  static CONSISTENCY_BONUS = {
    streak_3_days: 50,
    streak_7_days: 150,
    streak_14_days: 300,
    streak_30_days: 750,
  };

  // Bônus de conclusão por tipo de treino
  static COMPLETION_BONUS = {
    easy_run: 25,
    interval_training: 50,
    long_run: 75,
    tempo_run: 40,
    hill_repeats: 45,
    vo2max_intervals: 60,
  };

  /**
   * Calcula XP para um treino específico
   * @param {Object} workout - Dados do treino
   * @param {string} workout.type - Tipo do treino
   * @param {number} workout.distance - Distância em km
   * @param {number} workout.duration - Duração em minutos
   * @param {Object} userProgress - Progresso atual do usuário
   * @returns {Object} - XP calculado e detalhes
   */
  static calculateWorkoutXP(workout, userProgress = {}) {
    try {
      const { type, distance = 0, duration = 0 } = workout;
      const { current_streak_days = 0 } = userProgress;

      // XP base por distância
      const baseRate = this.XP_BASE_RATES[type] || this.XP_BASE_RATES.easy_run;
      let baseXP = Math.round(distance * baseRate);

      // Multiplicador por duração
      const durationMultiplier = this.getDurationMultiplier(duration);
      baseXP = Math.round(baseXP * durationMultiplier);

      // Bônus de conclusão
      const completionBonus = this.COMPLETION_BONUS[type] || 25;

      // Bônus de consistência (streak)
      const consistencyBonus = this.getConsistencyBonus(current_streak_days);

      // Bônus especiais
      const specialBonuses = this.calculateSpecialBonuses(workout, userProgress);

      const totalXP = baseXP + completionBonus + consistencyBonus + specialBonuses.total;

      return {
        baseXP,
        completionBonus,
        consistencyBonus,
        specialBonuses: specialBonuses.details,
        totalXP,
        calculation: {
          baseRate,
          distance,
          duration,
          durationMultiplier,
          streak: current_streak_days
        }
      };
    } catch (error) {
      console.error('Error calculating workout XP:', error);
      return {
        baseXP: 0,
        completionBonus: 0,
        consistencyBonus: 0,
        specialBonuses: {},
        totalXP: 0,
        error: error.message
      };
    }
  }

  /**
   * Obtém multiplicador baseado na duração do treino
   */
  static getDurationMultiplier(duration) {
    if (duration < 30) return this.DURATION_MULTIPLIERS.short;
    if (duration < 60) return this.DURATION_MULTIPLIERS.medium;
    if (duration < 90) return this.DURATION_MULTIPLIERS.long;
    return this.DURATION_MULTIPLIERS.very_long;
  }

  /**
   * Calcula bônus de consistência baseado no streak atual
   */
  static getConsistencyBonus(streakDays) {
    if (streakDays >= 30) return this.CONSISTENCY_BONUS.streak_30_days;
    if (streakDays >= 14) return this.CONSISTENCY_BONUS.streak_14_days;
    if (streakDays >= 7) return this.CONSISTENCY_BONUS.streak_7_days;
    if (streakDays >= 3) return this.CONSISTENCY_BONUS.streak_3_days;
    return 0;
  }

  /**
   * Calcula bônus especiais
   */
  static calculateSpecialBonuses(workout, userProgress) {
    const bonuses = {};
    let total = 0;

    // Bônus de primeiro treino do tipo
    if (this.isFirstWorkoutOfType()) {
      bonuses.firstTimeBonus = 100;
      total += 100;
    }

    // Bônus de distância pessoal
    if (this.isPersonalDistanceRecord(workout, userProgress)) {
      bonuses.personalRecordBonus = 200;
      total += 200;
    }

    // Bônus de conclusão de desafio semanal
    if (this.completesWeeklyChallenge()) {
      bonuses.weeklyChallengeBonus = 150;
      total += 150;
    }

    // Bônus de melhoria de pace
    if (this.isPaceImprovement()) {
      bonuses.paceImprovementBonus = 75;
      total += 75;
    }

    return {
      details: bonuses,
      total
    };
  }

  /**
   * Verifica se é o primeiro treino do tipo para o usuário
   */
  static isFirstWorkoutOfType() {
    // Implementação simplificada - em produção, consultar histórico no banco
    return false; // Placeholder
  }

  /**
   * Verifica se é um recorde pessoal de distância
   */
  static isPersonalDistanceRecord(workout, userProgress) {
    // Implementação simplificada - comparar com longest_run_distance
    return workout.distance > (userProgress.longest_run_distance || 0);
  }

  /**
   * Verifica se completa um desafio semanal
   */
  static completesWeeklyChallenge() {
    // Implementação simplificada - verificar metas semanais
    return false; // Placeholder
  }

  /**
   * Verifica se houve melhoria no pace
   */
  static isPaceImprovement() {
    // Implementação simplificada - comparar com paces anteriores
    return false; // Placeholder
  }

  /**
   * Atualiza o progresso do usuário com XP ganho
   * @param {string} userId - ID do usuário
   * @param {number} xpGained - XP ganho
   * @returns {Object} - Progresso atualizado
   */
  static async updateUserProgress(userId, xpGained) {
    try {
      // Buscar progresso atual
      const { data: currentProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let updatedProgress;

      if (!currentProgress) {
        // Criar novo progresso se não existir
        const { data: insertData, error: insertError } = await supabase
          .from('user_progress')
          .insert([{
            user_id: userId,
            current_phase_id: 1, // Começar na fase Foundation
            current_level: 1,
            current_xp: xpGained,
            xp_to_next_level: this.calculateXPToNextLevel(1),
            total_xp_earned: xpGained,
            total_workouts_completed: 1,
            last_workout_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        updatedProgress = insertData;
      } else {
        // Atualizar progresso existente
        const newCurrentXP = currentProgress.current_xp + xpGained;
        const newTotalXP = currentProgress.total_xp_earned + xpGained;
        const newWorkoutCount = currentProgress.total_workouts_completed + 1;

        // Verificar se avançou de nível
        const levelUpResult = this.checkLevelUp(
          currentProgress.current_level,
          newCurrentXP,
          currentProgress.xp_to_next_level
        );

        const { data: updateData, error: updateError } = await supabase
          .from('user_progress')
          .update({
            current_xp: levelUpResult.finalXP,
            current_level: levelUpResult.newLevel,
            xp_to_next_level: levelUpResult.xpToNextLevel,
            total_xp_earned: newTotalXP,
            total_workouts_completed: newWorkoutCount,
            last_workout_at: new Date().toISOString(),
            ...(levelUpResult.leveledUp && { last_level_up_at: new Date().toISOString() })
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;
        updatedProgress = { ...updateData, leveledUp: levelUpResult.leveledUp };
      }

      return {
        success: true,
        progress: updatedProgress,
        xpGained
      };

    } catch (error) {
      console.error('Error updating user progress:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica se o usuário subiu de nível
   */
  static checkLevelUp(currentLevel, newXP, xpToNextLevel) {
    if (newXP >= xpToNextLevel) {
      const newLevel = Math.min(currentLevel + 1, 10); // Max nível 10 por fase
      const remainingXP = newXP - xpToNextLevel;
      const newXPToNextLevel = this.calculateXPToNextLevel(newLevel);

      return {
        leveledUp: true,
        newLevel,
        finalXP: remainingXP,
        xpToNextLevel: newXPToNextLevel
      };
    }

    return {
      leveledUp: false,
      newLevel: currentLevel,
      finalXP: newXP,
      xpToNextLevel: xpToNextLevel
    };
  }

  /**
   * Calcula XP necessário para o próximo nível (progressão exponencial)
   */
  static calculateXPToNextLevel(level) {
    // Fórmula: 100 * (1.5 ^ (level - 1))
    // Nível 1->2: 100 XP
    // Nível 2->3: 150 XP
    // Nível 3->4: 225 XP
    // etc.
    return Math.round(100 * Math.pow(1.5, level - 1));
  }

  /**
   * Calcula XP total necessário para atingir um nível específico
   */
  static calculateTotalXPForLevel(targetLevel) {
    let totalXP = 0;
    for (let level = 1; level < targetLevel; level++) {
      totalXP += this.calculateXPToNextLevel(level);
    }
    return totalXP;
  }
}

module.exports = XPCalculatorService; 