const express = require('express');
const { createPlan, getPlanByUserId, updateWorkoutProgress } = require('../controllers/planController.js');

const router = express.Router();

// POST /api/plans - Criar plano de treino
router.post('/', createPlan);

// GET /api/plans/user/:userId - Buscar planos por ID do usuário
router.get('/user/:userId', getPlanByUserId);

// PUT /api/plans/:planId/progress - Atualizar progresso de treino
router.put('/:planId/progress', updateWorkoutProgress);

module.exports = router; 