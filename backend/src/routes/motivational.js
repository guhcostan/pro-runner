const express = require('express');
const { getDailyQuote, getRandomQuote } = require('../controllers/motivationalController');

const router = express.Router();

// GET /api/motivational/daily - Get daily motivational quote
router.get('/daily', getDailyQuote);

// GET /api/motivational/random - Get random motivational quote
router.get('/random', getRandomQuote);

module.exports = router; 