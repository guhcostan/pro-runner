const { supabase } = require('../config/supabase.js');
const { generateTrainingPlan } = require('../services/planService.js');
const cacheService = require('../services/cacheService.js');

/**
 * Gera e salva um plano de treino para o usuário
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createPlan(req, res) {
  try {
    const { userId, force = false } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'ID do usuário é obrigatório'
      });
    }

    // Busca dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }
      
      console.error('Database error:', userError);
      return res.status(500).json({
        error: 'Erro ao buscar dados do usuário'
      });
    }

    // Verifica se já existe um plano para o usuário
    const { data: existingPlans } = await supabase
      .from('training_plans')
      .select('id, created_at')
      .eq('user_id', userId);

    if (existingPlans && existingPlans.length > 0) {
      if (force) {
        // Se force=true, deleta planos existentes antes de criar novo
        const { error: deleteError } = await supabase
          .from('training_plans')
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting existing plans:', deleteError);
          return res.status(500).json({
            error: 'Erro ao deletar planos existentes'
          });
        }
      } else {
      return res.status(409).json({
        error: 'Plano já existe para este usuário',
          message: 'Um plano de treino já foi gerado. Use force=true para recriar.',
          plan_id: existingPlans[0].id,
          created_at: existingPlans[0].created_at
      });
      }
    }

    // Gera o plano de treino
    const trainingPlan = generateTrainingPlan(user);

    // Salva o plano no banco
    const { data: savedPlan, error: planError } = await supabase
      .from('training_plans')
      .insert([{
        user_id: userId,
        goal: trainingPlan.goal,
        fitness_level: trainingPlan.fitness_level,
        base_pace: trainingPlan.base_pace,
        total_weeks: trainingPlan.total_weeks,
        plan_data: trainingPlan.weeks,
        created_at: trainingPlan.created_at
      }])
      .select()
      .single();

    if (planError) {
      console.error('Database error:', planError);
      return res.status(500).json({
        error: 'Erro ao salvar plano de treino',
        message: 'Não foi possível salvar o plano no banco de dados'
      });
    }

    // Invalidate cache for user plans when a new plan is created
    cacheService.delete(`plan:user:${userId}`);
    cacheService.deletePattern(`plan:${savedPlan.id}:*`);

    res.status(201).json({
      message: force ? 'Plano de treino recriado com sucesso' : 'Plano de treino criado com sucesso',
      plan: {
        id: savedPlan.id,
        user_id: savedPlan.user_id,
        goal: savedPlan.goal,
        fitness_level: savedPlan.fitness_level,
        base_pace: savedPlan.base_pace,
        total_weeks: savedPlan.total_weeks,
        weekly_frequency: trainingPlan.weekly_frequency,
        weeks: savedPlan.plan_data,
        created_at: savedPlan.created_at,
        vdot: trainingPlan.vdot,
        training_paces: trainingPlan.training_paces,
        estimated_capabilities: trainingPlan.estimated_capabilities,
        validation: trainingPlan.validation,
        progression_data: trainingPlan.progression_data,
        originalGoal: trainingPlan.originalGoal
      }
    });

  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Algo deu errado ao gerar o plano de treino'
    });
  }
}

/**
 * Busca o plano de treino de um usuário
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPlanByUserId(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'ID do usuário é obrigatório'
      });
    }

    const cacheKey = `plan:user:${userId}`;
    
    // Try to get from cache first
    const cachedPlan = cacheService.get(cacheKey);
    if (cachedPlan) {
      console.log(`Cache hit for user plan ${userId}`);
      return res.json({
        plan: cachedPlan,
        cached: true
      });
    }

    console.log(`Cache miss for user plan ${userId}, fetching from database`);

    // Otimized query: JOIN plan with user data in single request (eliminates N+1)
    const { data: planWithUser, error: planError } = await supabase
      .from('training_plans')
      .select(`
        id,
        user_id,
        goal,
        fitness_level,
        base_pace,
        total_weeks,
        weekly_frequency,
        plan_data,
        created_at,
        users!inner (
          name,
          goal
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError) {
      if (planError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Nenhum plano encontrado para este usuário'
        });
      }
      console.error('Database error:', planError);
      return res.status(500).json({
        error: 'Erro ao buscar plano de treino'
      });
    }

    // Format response with joined user data
    const formattedPlan = {
      id: planWithUser.id,
      user_id: planWithUser.user_id,
      user_name: planWithUser.users?.name,
      goal: planWithUser.goal,
      fitness_level: planWithUser.fitness_level,
      base_pace: planWithUser.base_pace,
      total_weeks: planWithUser.total_weeks,
      weekly_frequency: planWithUser.weekly_frequency || 3,
      weeks: planWithUser.plan_data,
      created_at: planWithUser.created_at
    };

    // Cache the plan data for 15 minutes (plans change less frequently than user data)
    cacheService.set(cacheKey, formattedPlan, 900);

    res.json({
      plan: formattedPlan
    });

  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Atualiza o progresso de um treino específico
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateWorkoutProgress(req, res) {
  try {
    const { planId } = req.params;
    const { week, workoutIndex, completed, notes } = req.body;

    if (!planId || week === undefined || workoutIndex === undefined) {
      return res.status(400).json({
        error: 'Dados obrigatórios: planId, week e workoutIndex'
      });
    }

    // Busca o plano atual
    const { data: plan, error: planError } = await supabase
      .from('training_plans')
      .select('plan_data')
      .eq('id', planId)
      .single();

    if (planError) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    // Atualiza os dados do progresso
    const updatedPlanData = [...plan.plan_data];
    const weekData = updatedPlanData.find(w => w.week === week);
    
    if (!weekData || !weekData.workouts[workoutIndex]) {
      return res.status(400).json({
        error: 'Semana ou treino não encontrado'
      });
    }

    weekData.workouts[workoutIndex].completed = completed;
    if (notes) {
      weekData.workouts[workoutIndex].notes = notes;
    }
    weekData.workouts[workoutIndex].completed_at = completed ? new Date().toISOString() : null;

    // Salva as alterações
    const { data: updatedPlan, error: updateError } = await supabase
      .from('training_plans')
      .update({ plan_data: updatedPlanData })
      .eq('id', planId)
      .select('user_id')
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return res.status(500).json({
        error: 'Erro ao atualizar progresso'
      });
    }

    // Invalidate cache for the user's plan when progress is updated
    if (updatedPlan) {
      cacheService.delete(`plan:user:${updatedPlan.user_id}`);
      cacheService.deletePattern(`plan:${planId}:*`);
    }

    res.json({
      message: 'Progresso atualizado com sucesso',
      workout: weekData.workouts[workoutIndex]
    });

  } catch (error) {
    console.error('Error updating workout progress:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
} 

/**
 * Lista planos com paginação e filtros (Admin/Analytics)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPlansPaginated(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      goal = null, 
      fitness_level = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Validate pagination params
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
    const offset = (pageNum - 1) * limitNum;

    // Build cache key
    const cacheKey = `plans:paginated:${pageNum}:${limitNum}:${goal}:${fitness_level}:${sortBy}:${sortOrder}`;
    
    // Try cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for paginated plans page ${pageNum}`);
      return res.json({
        ...cachedResult,
        cached: true
      });
    }

    console.log(`Cache miss for paginated plans page ${pageNum}, fetching from database`);

    // Optimized query with JOIN to get user info
    let query = supabase
      .from('training_plans')
      .select(`
        id,
        user_id,
        goal,
        fitness_level,
        base_pace,
        total_weeks,
        weekly_frequency,
        created_at,
        users!inner (
          name
        )
      `, { count: 'exact' });

    // Apply filters (uses indexes)
    if (goal) {
      query = query.eq('goal', goal);
    }

    if (fitness_level) {
      query = query.eq('fitness_level', fitness_level);
    }

    // Apply sorting (using indexes)
    const validSortFields = ['created_at', 'goal', 'fitness_level'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? { ascending: true } : { ascending: false };
    
    query = query.order(sortField, order);

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: plans, count, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Erro ao buscar planos de treino'
      });
    }

    const totalPages = Math.ceil(count / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    const result = {
      data: plans || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? pageNum + 1 : null,
        prevPage: hasPrev ? pageNum - 1 : null
      },
      filters: {
        goal,
        fitness_level,
        sortBy: sortField,
        sortOrder
      }
    };

    // Cache for 10 minutes (plans change less frequently)
    cacheService.set(cacheKey, result, 600);

    res.json(result);

  } catch (error) {
    console.error('Error fetching paginated plans:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Analytics de planos de treino
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPlanAnalytics(req, res) {
  try {
    const cacheKey = 'plans:analytics';
    
    // Try cache first
    const cachedAnalytics = cacheService.get(cacheKey);
    if (cachedAnalytics) {
      console.log('Cache hit for plan analytics');
      return res.json({
        ...cachedAnalytics,
        cached: true
      });
    }

    console.log('Cache miss for plan analytics, fetching from database');

    // Optimized analytics queries using indexes
    const [
      totalPlansResult,
      goalDistributionResult,
      fitnessLevelDistributionResult,
      recentPlansResult,
      weeklyFreqDistributionResult
    ] = await Promise.all([
      // Total plans count
      supabase
        .from('training_plans')
        .select('*', { count: 'exact', head: true }),
      
      // Plans by goal (uses idx_training_plans_goal)
      supabase
        .from('training_plans')
        .select('goal', { count: 'exact' })
        .not('goal', 'is', null),
      
      // Plans by fitness level (uses idx_training_plans_fitness_level)
      supabase
        .from('training_plans')
        .select('fitness_level', { count: 'exact' })
        .not('fitness_level', 'is', null),
      
      // Recent plans (last 7 days) (uses idx_training_plans_created_at)
      supabase
        .from('training_plans')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Weekly frequency distribution
      supabase
        .from('training_plans')
        .select('weekly_frequency', { count: 'exact' })
        .not('weekly_frequency', 'is', null)
    ]);

    // Process goal distribution
    const goalCounts = {};
    if (goalDistributionResult.data) {
      goalDistributionResult.data.forEach(plan => {
        goalCounts[plan.goal] = (goalCounts[plan.goal] || 0) + 1;
      });
    }

    // Process fitness level distribution
    const fitnessLevelCounts = {};
    if (fitnessLevelDistributionResult.data) {
      fitnessLevelDistributionResult.data.forEach(plan => {
        fitnessLevelCounts[plan.fitness_level] = (fitnessLevelCounts[plan.fitness_level] || 0) + 1;
      });
    }

    // Process weekly frequency distribution
    const weeklyFreqCounts = {};
    if (weeklyFreqDistributionResult.data) {
      weeklyFreqDistributionResult.data.forEach(plan => {
        const freq = plan.weekly_frequency || 3;
        weeklyFreqCounts[freq] = (weeklyFreqCounts[freq] || 0) + 1;
      });
    }

    const analytics = {
      total_plans: totalPlansResult.count || 0,
      recent_plans_7d: recentPlansResult.count || 0,
      goal_distribution: goalCounts,
      fitness_level_distribution: fitnessLevelCounts,
      weekly_frequency_distribution: weeklyFreqCounts,
      generated_at: new Date().toISOString()
    };

    // Cache for 30 minutes (analytics don't need real-time updates)
    cacheService.set(cacheKey, analytics, 1800);

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching plan analytics:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

module.exports = {
  createPlan,
  getPlanByUserId,
  updateWorkoutProgress,
  getPlansPaginated,
  getPlanAnalytics
}; 