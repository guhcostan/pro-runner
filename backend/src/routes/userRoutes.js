const express = require('express');
const { createUser, getUserById, getUserByAuthId } = require('../controllers/userController.js');

const router = express.Router();

// POST /api/users - Criar usuário
router.post('/', createUser);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', getUserById);

// GET /api/users/auth/:authUserId - Buscar usuário por auth_user_id
router.get('/auth/:authUserId', getUserByAuthId);

module.exports = router; 