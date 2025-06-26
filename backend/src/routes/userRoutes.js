const express = require('express');
const { 
  createUser, 
  getUserById, 
  getUserByAuthId, 
  getUsersPaginated, 
  getUserAnalytics 
} = require('../controllers/userController.js');
const { authenticateToken, optionalAuth, createRateLimit } = require('../middleware/auth.js');

const router = express.Router();

// POST /api/users - Criar usuário (público para onboarding)
router.post('/', optionalAuth, createUser);

// GET /api/users/:id - Buscar usuário por ID (protegido)
router.get('/:id', authenticateToken, getUserById);

// GET /api/users/auth/:authUserId - Buscar usuário por auth_user_id (protegido)
router.get('/auth/:authUserId', authenticateToken, getUserByAuthId);

// GET /api/users - Lista usuários com paginação (protegido, admin)
router.get('/', authenticateToken, createRateLimit(100, 15), getUsersPaginated);

// GET /api/users/analytics/summary - Analytics de usuários (protegido, admin)
router.get('/analytics/summary', authenticateToken, createRateLimit(50, 15), getUserAnalytics);

module.exports = router; 