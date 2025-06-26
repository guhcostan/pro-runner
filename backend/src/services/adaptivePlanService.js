const { supabase } = require('../config/supabase.js');
const XPCalculatorService = require('./xpService.js');
const ProgressionService = require('./progressionService.js');

/**
 * Serviço para geração de planos adaptativos baseados em fases e níveis
 * Task 1.3: Adaptar Geração de Planos
 */

class AdaptivePlanService {
  /**
   * Gera um plano adaptativo baseado no perfil e progresso do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções do plano
   * @returns {Object} - Plano adaptativo gerado
   */
  static async generateAdaptivePlan(userId) {
    try {
      // Buscar dados completos do usuário
      const userData = await this.getUserComprehensiveData(userId);
      if (!userData.success) {
        throw new Error(userData.error);
      }

      const { user, profile, progress } = userData.data;

      // Avaliar fase e nível apropriados
      const assessment = await this.assessUserPhaseAndLevel(user, profile, progress);

      // Buscar templates de treino para a fase
      const templates = await this.getWorkoutTemplatesForPhase(
        assessment.recommendedPhaseId,
        assessment.recommendedLevel
      );

      // Gerar cronograma semanal
      const weeklySchedule = this.generateWeeklySchedule(profile, templates, assessment.currentPhase);

      // Personalizar intensidades baseado no usuário
      const personalizedSchedule = this.personalizeWorkoutIntensities(
        weeklySchedule,
        user,
        profile
      );

      // Adicionar elementos de gamificação
      const gamifiedPlan = this.addGamificationElements(personalizedSchedule, progress, assessment);

      // Salvar plano no banco de dados
      const savedPlan = await this.savePlanToDatabase(userId, gamifiedPlan, assessment);

      return {
        success: true,
        plan: savedPlan,
        assessment,
        message: 'Adaptive plan generated successfully'
      };

    } catch (error) {
      console.error('Error generating adaptive plan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca dados completos do usuário
   */
  static async getUserComprehensiveData(userId) {
    try {
      // Buscar usuário base
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Buscar perfil estendido
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Se não tem perfil, criar um básico
      let userProfile = profile;
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: userId,
            age: user.age || 30,
            sex: user.sex || 'other',
            running_experience_years: 0,
            average_weekly_volume: 0
          }])
          .select()
          .single();

        if (createError) throw createError;
        userProfile = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      // Buscar progresso
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          *,
          training_phases!inner (*)
        `)
        .eq('user_id', userId)
        .single();

      // Se não tem progresso, será criado quando necessário
      let userProgress = progress;
      if (progressError && progressError.code === 'PGRST116') {
        userProgress = null; // Será criado durante o processo
      } else if (progressError) {
        throw progressError;
      }

      return {
        success: true,
        data: {
          user,
          profile: userProfile,
          progress: userProgress
        }
      };

    } catch (error) {
      console.error('Error fetching user comprehensive data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Avalia a fase e nível apropriados para o usuário
   */
  static async assessUserPhaseAndLevel(user, profile, progress) {
    try {
      // Se o usuário já tem progresso, usar dados atuais
      if (progress) {
        return {
          recommendedPhaseId: progress.current_phase_id,
          recommendedLevel: progress.current_level,
          currentPhase: progress.training_phases,
          isNewUser: false,
          assessment: 'existing_progress'
        };
      }

      // Novo usuário - avaliação inicial
      const assessment = this.performInitialAssessment(user, profile);
      
      // Buscar fase apropriada
      const { data: phases, error: phasesError } = await supabase
        .from('training_phases')
        .select('*')
        .eq('is_active', true)
        .order('phase_order');

      if (phasesError) throw phasesError;

      // Determinar fase inicial baseada na avaliação
      let recommendedPhase = phases[0]; // Fundação por padrão
      let recommendedLevel = 1;

      if (assessment.experienceLevel === 'intermediate') {
        recommendedPhase = phases.find(p => p.name === 'endurance_building') || phases[0];
        recommendedLevel = 3;
      } else if (assessment.experienceLevel === 'advanced') {
        recommendedPhase = phases.find(p => p.name === 'speed_strength') || phases[0];
        recommendedLevel = 5;
      }

      return {
        recommendedPhaseId: recommendedPhase.id,
        recommendedLevel,
        currentPhase: recommendedPhase,
        isNewUser: true,
        assessment: assessment.experienceLevel,
        assessmentDetails: assessment
      };

    } catch (error) {
      console.error('Error assessing user phase and level:', error);
      // Fallback para fase inicial
      const { data: foundationPhase } = await supabase
        .from('training_phases')
        .select('*')
        .eq('name', 'foundation')
        .single();

      return {
        recommendedPhaseId: foundationPhase?.id || 1,
        recommendedLevel: 1,
        currentPhase: foundationPhase,
        isNewUser: true,
        assessment: 'beginner',
        error: error.message
      };
    }
  }

  /**
   * Realiza avaliação inicial para novos usuários
   */
  static performInitialAssessment(user, profile) {
    let experiencePoints = 0;

    // Avaliar experiência em corrida
    const runningYears = profile.running_experience_years || 0;
    if (runningYears >= 3) experiencePoints += 30;
    else if (runningYears >= 1) experiencePoints += 15;
    else if (runningYears > 0) experiencePoints += 5;

    // Avaliar volume semanal atual
    const weeklyVolume = profile.average_weekly_volume || 0;
    if (weeklyVolume >= 30) experiencePoints += 25;
    else if (weeklyVolume >= 15) experiencePoints += 15;
    else if (weeklyVolume >= 5) experiencePoints += 8;

    // Avaliar distância mais longa já corrida
    const longestRun = profile.longest_run_distance || 0;
    if (longestRun >= 21) experiencePoints += 20;
    else if (longestRun >= 10) experiencePoints += 12;
    else if (longestRun >= 5) experiencePoints += 6;

    // Avaliar idade (considerando recuperação)
    const age = profile.age || user.age || 30;
    if (age < 25) experiencePoints += 5;
    else if (age > 50) experiencePoints -= 5;

    // Avaliar meta do usuário
    const goal = user.goal;
    if (goal === 'marathon') experiencePoints += 10;
    else if (goal === 'half_marathon') experiencePoints += 7;
    else if (goal === 'run_10k') experiencePoints += 5;

    // Determinar nível de experiência
    let experienceLevel = 'beginner';
    if (experiencePoints >= 50) experienceLevel = 'advanced';
    else if (experiencePoints >= 25) experienceLevel = 'intermediate';

    return {
      experienceLevel,
      experiencePoints,
      factors: {
        runningYears,
        weeklyVolume,
        longestRun,
        age,
        goal
      },
      recommendations: this.generateInitialRecommendations(experienceLevel)
    };
  }

  /**
   * Gera recomendações iniciais baseadas no nível
   */
  static generateInitialRecommendations(experienceLevel) {
    const recommendations = {
      beginner: {
        weeklyFrequency: 3,
        sessionDuration: 30,
        startingIntensity: 'easy',
        focusAreas: ['establish_routine', 'build_base_endurance']
      },
      intermediate: {
        weeklyFrequency: 4,
        sessionDuration: 45,
        startingIntensity: 'moderate',
        focusAreas: ['increase_volume', 'add_variety']
      },
      advanced: {
        weeklyFrequency: 5,
        sessionDuration: 60,
        startingIntensity: 'moderate_hard',
        focusAreas: ['specific_training', 'performance_optimization']
      }
    };

    return recommendations[experienceLevel] || recommendations.beginner;
  }

  /**
   * Busca templates de treino para uma fase e nível específicos
   */
  static async getWorkoutTemplatesForPhase(phaseId, level) {
    try {
      const { data: templates, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('phase_id', phaseId)
        .overlaps('level_range', `[${level},${level}]`)
        .eq('is_active', true)
        .order('usage_frequency_weight', { ascending: false });

      if (error) throw error;

      return templates || [];

    } catch (error) {
      console.error('Error fetching workout templates:', error);
      return [];
    }
  }

  /**
   * Gera cronograma semanal baseado no perfil do usuário
   */
  static generateWeeklySchedule(profile, templates, phase) {
    const weeklyFrequency = profile.preferred_training_days?.length || 3;
    const availableTime = profile.available_time_per_session || 60;
    const trainingDays = profile.preferred_training_days || ['monday', 'wednesday', 'friday'];

    // Distribuir tipos de treino baseado na fase
    const workoutDistribution = this.getWorkoutDistribution(phase, weeklyFrequency);
    
    // Criar cronograma
    const schedule = [];
    for (let i = 0; i < weeklyFrequency; i++) {
      const workoutType = workoutDistribution[i % workoutDistribution.length];
      const template = templates.find(t => t.workout_type === workoutType) || templates[0];
      
      if (template) {
        schedule.push({
          day: trainingDays[i] || `day_${i + 1}`,
          template,
          estimated_duration: Math.min(template.estimated_duration_minutes, availableTime),
          order: i + 1
        });
      }
    }

    return schedule;
  }

  /**
   * Define distribuição de tipos de treino por fase
   */
  static getWorkoutDistribution(phase, frequency) {
    const distributions = {
      foundation: {
        3: ['walk_run_intervals', 'easy_run', 'walk_run_intervals'],
        4: ['walk_run_intervals', 'easy_run', 'walk_run_intervals', 'easy_run'],
        5: ['walk_run_intervals', 'easy_run', 'walk_run_intervals', 'easy_run', 'recovery_run']
      },
      endurance_building: {
        3: ['easy_run', 'tempo_run', 'long_run'],
        4: ['easy_run', 'interval_training', 'easy_run', 'long_run'],
        5: ['easy_run', 'interval_training', 'tempo_run', 'easy_run', 'long_run']
      },
      speed_strength: {
        3: ['interval_training', 'tempo_run', 'long_run'],
        4: ['easy_run', 'interval_training', 'hill_repeats', 'long_run'],
        5: ['easy_run', 'interval_training', 'tempo_run', 'hill_repeats', 'long_run']
      },
      advanced_training: {
        4: ['easy_run', 'vo2max_intervals', 'tempo_run', 'long_run'],
        5: ['easy_run', 'vo2max_intervals', 'tempo_run', 'marathon_pace', 'long_run'],
        6: ['recovery_run', 'easy_run', 'vo2max_intervals', 'tempo_run', 'marathon_pace', 'long_run']
      },
      elite_performance: {
        5: ['recovery_run', 'specialized_intervals', 'tempo_run', 'race_specific', 'ultra_long_runs'],
        6: ['recovery_run', 'easy_run', 'specialized_intervals', 'tempo_run', 'race_specific', 'ultra_long_runs']
      }
    };

    const phaseName = phase.name || 'foundation';
    const phaseDistribution = distributions[phaseName] || distributions.foundation;
    
    return phaseDistribution[frequency] || phaseDistribution[3];
  }

  /**
   * Personaliza intensidades dos treinos baseado no perfil do usuário
   */
  static personalizeWorkoutIntensities(schedule, user, profile) {
    return schedule.map(workout => {
      const personalizedWorkout = { ...workout };
      
      // Ajustar baseado na idade
      const age = profile.age || user.age || 30;
      if (age > 50) {
        personalizedWorkout.intensity_adjustment = 0.9; // 10% menos intenso
      } else if (age < 25) {
        personalizedWorkout.intensity_adjustment = 1.05; // 5% mais intenso
      } else {
        personalizedWorkout.intensity_adjustment = 1.0;
      }

      // Ajustar baseado no histórico de lesões
      const injuryHistory = profile.injury_history || [];
      if (injuryHistory.length > 0) {
        const recentInjuries = injuryHistory.filter(injury => {
          const injuryDate = new Date(injury.date);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return injuryDate > sixMonthsAgo && !injury.recovered;
        });

        if (recentInjuries.length > 0) {
          personalizedWorkout.intensity_adjustment *= 0.85; // 15% menos intenso
          personalizedWorkout.injury_modifications = recentInjuries.map(i => i.type);
        }
      }

      // Personalizar baseado no objetivo
      const goal = user.goal;
      if (goal === 'start_running' || goal === 'run_5k') {
        personalizedWorkout.beginner_friendly = true;
      }

      return personalizedWorkout;
    });
  }

  /**
   * Adiciona elementos de gamificação ao plano
   */
  static addGamificationElements(plan, progress, assessment) {
    return plan.map((workout, index) => {
      const gamifiedWorkout = { ...workout };

      // Calcular XP esperado
      const expectedDistance = this.estimateWorkoutDistance(workout);
      const expectedXP = XPCalculatorService.calculateWorkoutXP({
        type: workout.template.workout_type,
        distance: expectedDistance,
        duration: workout.estimated_duration
      }, progress);

      gamifiedWorkout.gamification = {
        expectedXP: expectedXP.totalXP,
        xpBreakdown: expectedXP,
        completionReward: workout.template.completion_bonus_xp || 0,
        difficultyLevel: this.calculateWorkoutDifficulty(workout, assessment),
        motivationalMessage: this.generateMotivationalMessage(workout, index, assessment)
      };

      return gamifiedWorkout;
    });
  }

  /**
   * Estima distância do treino baseado no template e duração
   */
  static estimateWorkoutDistance(workout) {
    const duration = workout.estimated_duration;
    const workoutType = workout.template.workout_type;

    // Estimativas básicas por tipo de treino (km por minuto)
    const paceEstimates = {
      walk_run_intervals: 0.08,  // ~7.5 km/h
      easy_run: 0.10,           // 6 km/h
      recovery_run: 0.09,       // 5.4 km/h
      tempo_run: 0.12,          // 7.2 km/h
      interval_training: 0.11,   // 6.6 km/h (com descansos)
      long_run: 0.10,           // 6 km/h
      hill_repeats: 0.09,       // 5.4 km/h (com descansos)
      vo2max_intervals: 0.10,   // 6 km/h (com descansos)
      marathon_pace: 0.13,      // 7.8 km/h
      race_specific: 0.14,      // 8.4 km/h
      ultra_long_runs: 0.09     // 5.4 km/h
    };

    const estimatedPace = paceEstimates[workoutType] || 0.10;
    return Math.round((duration * estimatedPace) * 10) / 10; // Arredondar para 1 casa decimal
  }

  /**
   * Calcula nível de dificuldade do treino
   */
  static calculateWorkoutDifficulty(workout, assessment) {
    let difficulty = 1; // Básico

    // Aumentar baseado no tipo de treino
    const difficultyByType = {
      walk_run_intervals: 1,
      recovery_run: 1,
      easy_run: 2,
      tempo_run: 4,
      interval_training: 4,
      long_run: 3,
      hill_repeats: 5,
      vo2max_intervals: 5,
      marathon_pace: 4,
      race_specific: 5,
      ultra_long_runs: 4,
      specialized_intervals: 5
    };

    difficulty = difficultyByType[workout.template.workout_type] || 2;

    // Ajustar baseado no nível do usuário
    if (assessment.recommendedLevel >= 8) difficulty += 1;
    else if (assessment.recommendedLevel >= 5) difficulty += 0.5;

    return Math.min(Math.max(Math.round(difficulty), 1), 5);
  }

  /**
   * Gera mensagem motivacional para o treino
   */
  static generateMotivationalMessage(workout, index, assessment) {
    const messages = {
      pt: {
        first: 'Vamos começar! Todo campeão deu o primeiro passo 🏃‍♂️',
        easy: 'Treino tranquilo hoje! Construindo a base sólida 💪',
        challenging: 'Hora do desafio! Você é mais forte do que imagina 🔥',
        final: 'Último treino da semana! Finalize com estilo 🏆'
      },
      en: {
        first: 'Let\'s start! Every champion took the first step 🏃‍♂️',
        easy: 'Easy training today! Building a solid foundation 💪',
        challenging: 'Challenge time! You\'re stronger than you think 🔥',
        final: 'Last workout of the week! Finish with style 🏆'
      },
      es: {
        first: '¡Empecemos! Todo campeón dio el primer paso 🏃‍♂️',
        easy: 'Entrenamiento fácil hoy! Construyendo una base sólida 💪',
        challenging: '¡Hora del desafío! Eres más fuerte de lo que crees 🔥',
        final: '¡Último entrenamiento de la semana! Termina con estilo 🏆'
      }
    };

    let messageType = 'easy';
    if (index === 0) messageType = 'first';
    else if (this.calculateWorkoutDifficulty(workout, assessment) >= 4) messageType = 'challenging';
    else if (index >= 2) messageType = 'final';

    return {
      pt: messages.pt[messageType],
      en: messages.en[messageType],
      es: messages.es[messageType]
    };
  }

  /**
   * Salva o plano no banco de dados
   */
  static async savePlanToDatabase(userId, plan, assessment) {
    try {
      const planData = {
        user_id: userId,
        goal: 'adaptive_training', // Objetivo adaptativo
        fitness_level: assessment.assessment,
        total_weeks: 52, // Plano contínuo
        phase_id: assessment.recommendedPhaseId,
        level: assessment.recommendedLevel,
        is_adaptive: true,
        adaptation_rules: {
          auto_adjust_intensity: true,
          monitor_performance: true,
          check_progression: true,
          frequency: 'weekly'
        },
        plan_data: {
          weekly_schedule: plan,
          phase_info: assessment.currentPhase,
          assessment_details: assessment.assessmentDetails,
          generated_at: new Date().toISOString(),
          version: '2.0'
        }
      };

      const { data: savedPlan, error } = await supabase
        .from('training_plans')
        .insert([planData])
        .select()
        .single();

      if (error) throw error;

      // Criar ou atualizar progresso do usuário se for novo
      if (assessment.isNewUser) {
        await XPCalculatorService.updateUserProgress(userId, 0); // Inicializar com 0 XP
      }

      return savedPlan;

    } catch (error) {
      console.error('Error saving plan to database:', error);
      throw error;
    }
  }

  /**
   * Adapta um plano existente baseado no desempenho recente
   * @param {string} userId - ID do usuário
   * @param {string} planId - ID do plano atual
   * @returns {Object} - Plano adaptado
   */
  static async adaptExistingPlan(userId, planId) {
    try {
      // Buscar plano atual
      const { data: currentPlan, error: planError } = await supabase
        .from('training_plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (planError) throw planError;

      // Buscar progresso atual
      const progressStats = await ProgressionService.getUserProgressionStats(userId);
      if (!progressStats.success) {
        throw new Error(progressStats.error);
      }

      // Verificar se precisa mudar de fase
      const phaseAdvancement = progressStats.stats.phaseAdvancement;
      if (phaseAdvancement && phaseAdvancement.canAdvance) {
        // Promover para próxima fase e gerar novo plano
        const promotion = await ProgressionService.promoteToNextPhase(
          userId,
          phaseAdvancement.nextPhase.id
        );

        if (promotion.success) {
          return await this.generateAdaptivePlan(userId, {
            forcePhase: phaseAdvancement.nextPhase.id,
            reason: 'phase_advancement'
          });
        }
      }

      // Adaptar plano atual baseado no desempenho
      const adaptedSchedule = await this.adaptWeeklySchedule(
        currentPlan.plan_data.weekly_schedule,
        progressStats.stats
      );

      // Atualizar plano no banco
      const { data: updatedPlan, error: updateError } = await supabase
        .from('training_plans')
        .update({
          plan_data: {
            ...currentPlan.plan_data,
            weekly_schedule: adaptedSchedule,
            last_adapted_at: new Date().toISOString(),
            adaptation_reason: 'performance_adjustment'
          }
        })
        .eq('id', planId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        success: true,
        plan: updatedPlan,
        adaptations: this.getAdaptationSummary(currentPlan.plan_data.weekly_schedule, adaptedSchedule)
      };

    } catch (error) {
      console.error('Error adapting existing plan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Adapta cronograma semanal baseado no desempenho
   */
  static async adaptWeeklySchedule(currentSchedule, progressStats) {
    const adaptedSchedule = currentSchedule.map(workout => {
      const adaptedWorkout = { ...workout };

      // Aumentar intensidade se performance está boa
      if (progressStats.currentStreak >= 7 && progressStats.totalWorkouts >= 10) {
        adaptedWorkout.intensity_adjustment = (adaptedWorkout.intensity_adjustment || 1.0) * 1.05;
      }

      // Diminuir intensidade se muitos treinos perdidos recentemente
      if (progressStats.currentStreak === 0 && progressStats.totalWorkouts > 5) {
        adaptedWorkout.intensity_adjustment = (adaptedWorkout.intensity_adjustment || 1.0) * 0.95;
      }

      // Ajustar baseado no progresso XP
      const xpProgress = progressStats.phaseProgress.xpProgress;
      if (xpProgress > 80) { // Perto de subir de nível
        adaptedWorkout.bonus_challenge = true;
        adaptedWorkout.gamification.expectedXP *= 1.1;
      }

      return adaptedWorkout;
    });

    return adaptedSchedule;
  }

  /**
   * Gera resumo das adaptações feitas
   */
  static getAdaptationSummary(originalSchedule, adaptedSchedule) {
    const changes = [];

    adaptedSchedule.forEach((workout, index) => {
      const original = originalSchedule[index];
      
      if (workout.intensity_adjustment !== original.intensity_adjustment) {
        const change = workout.intensity_adjustment > original.intensity_adjustment ? 
          'increased' : 'decreased';
        changes.push({
          workout: index + 1,
          type: 'intensity',
          change,
          factor: workout.intensity_adjustment / original.intensity_adjustment
        });
      }

      if (workout.bonus_challenge && !original.bonus_challenge) {
        changes.push({
          workout: index + 1,
          type: 'bonus_challenge',
          change: 'added'
        });
      }
    });

    return changes;
  }
}

module.exports = AdaptivePlanService; 