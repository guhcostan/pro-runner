const express = require('express');
const { 
  createPlan, 
  getPlanByUserId, 
  updateWorkoutProgress, 
  getPlansPaginated, 
  getPlanAnalytics 
} = require('../controllers/planController.js');
const { authenticateToken, createRateLimit } = require('../middleware/auth.js');

const router = express.Router();

// POST /api/plans - Criar plano de treino (protegido)
router.post('/', authenticateToken, createPlan);

// GET /api/plans/user/:userId - Buscar planos por ID do usuário (protegido)
router.get('/user/:userId', authenticateToken, getPlanByUserId);

// PUT /api/plans/:planId/progress - Atualizar progresso de treino (protegido)
router.put('/:planId/progress', authenticateToken, updateWorkoutProgress);

// GET /api/plans - Lista planos com paginação (protegido, admin)
router.get('/', authenticateToken, createRateLimit(100, 15), getPlansPaginated);

// GET /api/plans/analytics/summary - Analytics de planos (protegido, admin)
router.get('/analytics/summary', authenticateToken, createRateLimit(50, 15), getPlanAnalytics);

module.exports = router; 