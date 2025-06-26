const { supabase } = require('../config/supabase.js');
const { userCreateSchema } = require('../validation/schemas.js');
const cacheService = require('../services/cacheService.js');

/**
 * Cria um novo usuário
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createUser = async (req, res) => {
  try {
    // Validação dos dados
    const { error: validationError, value: validatedData } = userCreateSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(detail => detail.message)
      });
    }

    // Verificar se já existe um usuário com este auth_user_id
    if (validatedData.auth_user_id) {
      const { data: existingUsers } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', validatedData.auth_user_id);

      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        
        // Atualiza os dados do usuário existente com os novos dados
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            name: validatedData.name,
            height: validatedData.height,
            weight: validatedData.weight,
            personal_record_5k: validatedData.personal_record_5k,
            goal: validatedData.goal,
            goal_date: validatedData.goal_date,
            weekly_frequency: validatedData.weekly_frequency,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Database update error:', updateError);
          return res.status(500).json({
            error: 'Erro ao atualizar usuário',
            message: 'Não foi possível atualizar os dados no banco'
          });
        }

        // Invalidate cache for updated user
        cacheService.delete(`user:${updatedUser.id}`);
        cacheService.delete(`user:auth:${validatedData.auth_user_id}`);

        return res.status(200).json({
          message: 'Dados do usuário atualizados com sucesso',
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            height: updatedUser.height,
            weight: updatedUser.weight,
            personal_record_5k: updatedUser.personal_record_5k,
            goal: updatedUser.goal,
            goal_date: updatedUser.goal_date,
            weekly_frequency: updatedUser.weekly_frequency,
            created_at: updatedUser.created_at
          }
        });
      }
    }

    // Insere usuário no Supabase
    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert([{
        name: validatedData.name,
        height: validatedData.height,
        weight: validatedData.weight,
        personal_record_5k: validatedData.personal_record_5k,
        goal: validatedData.goal,
        goal_date: validatedData.goal_date,
        weekly_frequency: validatedData.weekly_frequency,
        auth_user_id: validatedData.auth_user_id,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        error: 'Erro ao criar usuário',
        message: 'Não foi possível salvar os dados no banco'
      });
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        height: user.height,
        weight: user.weight,
        personal_record_5k: user.personal_record_5k,
        goal: user.goal,
        goal_date: user.goal_date,
        weekly_frequency: user.weekly_frequency,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Algo deu errado ao processar sua solicitação'
    });
  }
};

/**
 * Busca um usuário por ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'ID do usuário é obrigatório'
      });
    }

    const cacheKey = `user:${id}`;
    
    // Try to get from cache first
    const cachedUser = cacheService.get(cacheKey);
    if (cachedUser) {
      console.log(`Cache hit for user ${id}`);
      return res.json({
        user: cachedUser,
        cached: true
      });
    }

    console.log(`Cache miss for user ${id}, fetching from database`);

    // Optimized query: select only needed fields instead of *
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, name, height, weight, personal_record_5k, goal, goal_date, weekly_frequency, created_at')
      .eq('id', id)
      .single();

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }
      
      console.error('Database error:', dbError);
      return res.status(500).json({
        error: 'Erro ao buscar usuário'
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      height: user.height,
      weight: user.weight,
      personal_record_5k: user.personal_record_5k,
      goal: user.goal,
      goal_date: user.goal_date,
      weekly_frequency: user.weekly_frequency,
      created_at: user.created_at
    };

    // Cache the user data for 10 minutes
    cacheService.set(cacheKey, userData, 600);

    res.json({
      user: userData
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Busca um usuário por auth_user_id (Supabase Auth ID)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserByAuthId = async (req, res) => {
  try {
    const { authUserId } = req.params;

    if (!authUserId || authUserId.trim() === '') {
      return res.status(400).json({
        error: 'Auth User ID é obrigatório'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(authUserId.trim())) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const cacheKey = `user:auth:${authUserId}`;
    
    // Try to get from cache first
    const cachedUser = cacheService.get(cacheKey);
    if (cachedUser) {
      console.log(`Cache hit for auth user ${authUserId}`);
      return res.json({
        user: cachedUser,
        cached: true
      });
    }

    console.log(`Cache miss for auth user ${authUserId}, fetching from database`);

    // Optimized query: select specific fields + use composite index
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id, name, height, weight, personal_record_5k, goal, goal_date, weekly_frequency, created_at')
      .eq('auth_user_id', authUserId.trim())
      .order('created_at', { ascending: false })
      .limit(1);

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        error: 'Erro ao buscar usuário'
      });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    const userData = {
      id: user.id,
      name: user.name,
      height: user.height,
      weight: user.weight,
      personal_record_5k: user.personal_record_5k,
      goal: user.goal,
      goal_date: user.goal_date,
      weekly_frequency: user.weekly_frequency,
      created_at: user.created_at
    };

    // Cache the user data for 10 minutes
    cacheService.set(cacheKey, userData, 600);
    // Also cache by user ID for consistency
    cacheService.set(`user:${user.id}`, userData, 600);

    res.json({
      user: userData
    });

  } catch (error) {
    console.error('Error fetching user by auth ID:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Lista usuários com paginação e filtros (Admin only)
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 */
const getUsersPaginated = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      goal = null, 
      search = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Validate pagination params
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    // Build cache key
    const cacheKey = `users:paginated:${pageNum}:${limitNum}:${goal}:${search}:${sortBy}:${sortOrder}`;
    
    // Try cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for paginated users page ${pageNum}`);
      return res.json({
        ...cachedResult,
        cached: true
      });
    }

    console.log(`Cache miss for paginated users page ${pageNum}, fetching from database`);

    // Build query
    let query = supabase
      .from('users')
      .select('id, name, goal, weekly_frequency, created_at', { count: 'exact' });

    // Apply filters
    if (goal) {
      query = query.eq('goal', goal);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,goal.ilike.%${search}%`);
    }

    // Apply sorting (using indexes)
    const validSortFields = ['created_at', 'name', 'goal'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? { ascending: true } : { ascending: false };
    
    query = query.order(sortField, order);

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: users, count, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Erro ao buscar usuários'
      });
    }

    const totalPages = Math.ceil(count / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    const result = {
      data: users || [],
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
        search,
        sortBy: sortField,
        sortOrder
      }
    };

    // Cache for 5 minutes (user lists change frequently)
    cacheService.set(cacheKey, result, 300);

    res.json(result);

  } catch (error) {
    console.error('Error fetching paginated users:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Analytics de usuários (contadores por goal, etc)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserAnalytics = async (req, res) => {
  try {
    const cacheKey = 'users:analytics';
    
    // Try cache first
    const cachedAnalytics = cacheService.get(cacheKey);
    if (cachedAnalytics) {
      console.log('Cache hit for user analytics');
      return res.json({
        ...cachedAnalytics,
        cached: true
      });
    }

    console.log('Cache miss for user analytics, fetching from database');

    // Optimized analytics queries using indexes
    const [
      totalUsersResult,
      goalStatsResult,
      recentUsersResult,
      weeklyFreqStatsResult
    ] = await Promise.all([
      // Total users count
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true }),
      
      // Users by goal (uses idx_users_goal)
      supabase
        .from('users')
        .select('goal', { count: 'exact' })
        .not('goal', 'is', null),
      
      // Recent users (last 7 days) (uses idx_users_created_at)
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Weekly frequency distribution
      supabase
        .from('users')
        .select('weekly_frequency', { count: 'exact' })
        .not('weekly_frequency', 'is', null)
    ]);

    // Process goal statistics
    const goalCounts = {};
    if (goalStatsResult.data) {
      goalStatsResult.data.forEach(user => {
        goalCounts[user.goal] = (goalCounts[user.goal] || 0) + 1;
      });
    }

    // Process weekly frequency statistics
    const frequencyCounts = {};
    if (weeklyFreqStatsResult.data) {
      weeklyFreqStatsResult.data.forEach(user => {
        const freq = user.weekly_frequency || 0;
        frequencyCounts[freq] = (frequencyCounts[freq] || 0) + 1;
      });
    }

    const analytics = {
      total_users: totalUsersResult.count || 0,
      recent_users_7d: recentUsersResult.count || 0,
      goal_distribution: goalCounts,
      weekly_frequency_distribution: frequencyCounts,
      generated_at: new Date().toISOString()
    };

    // Cache for 30 minutes (analytics don't need real-time updates)
    cacheService.set(cacheKey, analytics, 1800);

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByAuthId,
  getUsersPaginated,
  getUserAnalytics
}; 