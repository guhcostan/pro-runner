const express = require('express');
const AdaptiveController = require('../controllers/adaptiveController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Rotas do Sistema Adaptativo
 * Task 3.1: Novos Endpoints da API
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/users/:id/progress - Progressão completa do usuário
router.get('/users/:id/progress', AdaptiveController.getUserProgress);

// POST /api/users/:id/adaptive-plan - Gerar plano adaptativo
router.post('/users/:id/adaptive-plan', AdaptiveController.generateAdaptivePlan);

// POST /api/workouts/:id/complete - Completar treino e calcular XP
router.post('/workouts/:id/complete', AdaptiveController.completeWorkout);

// GET /api/users/:id/stats - Estatísticas gamificadas
router.get('/users/:id/stats', AdaptiveController.getGamifiedStats);

// POST /api/users/:id/phase/advance - Avançar para próxima fase
router.post('/users/:id/phase/advance', AdaptiveController.advanceToNextPhase);

// GET /api/phases - Listar fases de treinamento
router.get('/phases', AdaptiveController.getTrainingPhases);

module.exports = router; 