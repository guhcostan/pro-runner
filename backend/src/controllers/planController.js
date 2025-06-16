import { supabase } from '../config/supabase.js';
import { generateTrainingPlan } from '../services/planService.js';

/**
 * Gera e salva um plano de treino para o usuário
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function createPlan(req, res) {
  try {
    const { userId } = req.body;

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
    const { data: existingPlan } = await supabase
      .from('training_plans')
      .select('id, created_at')
      .eq('user_id', userId)
      .single();

    if (existingPlan) {
      return res.status(409).json({
        error: 'Plano já existe para este usuário',
        message: 'Um plano de treino já foi gerado. Use o endpoint GET para recuperá-lo.',
        plan_id: existingPlan.id,
        created_at: existingPlan.created_at
      });
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

    res.status(201).json({
      message: 'Plano de treino criado com sucesso',
      plan: {
        id: savedPlan.id,
        user_id: savedPlan.user_id,
        goal: savedPlan.goal,
        fitness_level: savedPlan.fitness_level,
        base_pace: savedPlan.base_pace,
        total_weeks: savedPlan.total_weeks,
        weeks: savedPlan.plan_data,
        created_at: savedPlan.created_at
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
export async function getPlanByUserId(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'ID do usuário é obrigatório'
      });
    }

    // Busca o plano de treino
    const { data: plan, error: planError } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (planError) {
      if (planError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Plano não encontrado',
          message: 'Nenhum plano de treino foi gerado para este usuário'
        });
      }
      
      console.error('Database error:', planError);
      return res.status(500).json({
        error: 'Erro ao buscar plano de treino'
      });
    }

    // Busca dados do usuário para retornar junto
    const { data: user } = await supabase
      .from('users')
      .select('name, goal')
      .eq('id', userId)
      .single();

    res.json({
      plan: {
        id: plan.id,
        user_id: plan.user_id,
        user_name: user?.name,
        goal: plan.goal,
        fitness_level: plan.fitness_level,
        base_pace: plan.base_pace,
        total_weeks: plan.total_weeks,
        weeks: plan.plan_data,
        created_at: plan.created_at
      }
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
export async function updateWorkoutProgress(req, res) {
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
    const { error: updateError } = await supabase
      .from('training_plans')
      .update({ plan_data: updatedPlanData })
      .eq('id', planId);

    if (updateError) {
      console.error('Database error:', updateError);
      return res.status(500).json({
        error: 'Erro ao atualizar progresso'
      });
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