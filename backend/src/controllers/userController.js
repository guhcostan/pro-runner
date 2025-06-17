const { supabase } = require('../config/supabase.js');
const { userCreateSchema } = require('../validation/schemas.js');

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

    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
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

    res.json({
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

    // Use order by created_at and limit to get the most recent user
    // This handles cases where there might be duplicate users
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('*')
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

    res.json({
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
    console.error('Error fetching user by auth ID:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByAuthId
}; 