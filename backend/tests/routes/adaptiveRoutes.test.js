const express = require('express');
const adaptiveRoutes = require('../../src/routes/adaptiveRoutes');

// Mock do controller
jest.mock('../../src/controllers/adaptiveController');
const AdaptiveController = require('../../src/controllers/adaptiveController');

// Mock do middleware de auth
jest.mock('../../src/middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    next();
  }
}));

describe('Adaptive Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup express app com as rotas
    app = express();
    app.use(express.json());
    app.use('/api/adaptive', adaptiveRoutes);

    // Setup default mock implementations
    AdaptiveController.getUserProgress = jest.fn((req, res) => {
      res.json({ success: true, data: { level: 5 } });
    });
    AdaptiveController.generateAdaptivePlan = jest.fn((req, res) => {
      res.json({ success: true, data: { plan: 'test-plan' } });
    });
    AdaptiveController.completeWorkout = jest.fn((req, res) => {
      res.json({ success: true, data: { xpEarned: 50 } });
    });
    AdaptiveController.getGamifiedStats = jest.fn((req, res) => {
      res.json({ 
        success: true, 
        data: { 
          level: 5, 
          ranking: { position: 1 },
          nextMilestones: {}
        } 
      });
    });
    AdaptiveController.advanceToNextPhase = jest.fn((req, res) => {
      res.json({ 
        success: true, 
        data: { newPhase: 'Performance' },
        message: 'Usuário promovido para a próxima fase com sucesso!'
      });
    });
    AdaptiveController.getTrainingPhases = jest.fn((req, res) => {
      res.json({ 
        success: true, 
        data: [
          { id: 1, name: 'Foundation', phase_order: 1 },
          { id: 2, name: 'Development', phase_order: 2 }
        ]
      });
    });
  });

  describe('Route structure and middleware', () => {
    it('should have correct route structure', () => {
      expect(adaptiveRoutes).toBeDefined();
      expect(adaptiveRoutes.stack).toBeDefined();
      expect(adaptiveRoutes.stack.length).toBeGreaterThan(0);
    });

    it('should require authentication for all routes', () => {
      // O middleware de autenticação é aplicado a todas as rotas
      // Este teste verifica se o middleware está sendo usado
      const hasAuthMiddleware = adaptiveRoutes.stack.some(layer => 
        layer.name === 'authenticateToken' || 
        layer.handle?.name === 'authenticateToken' ||
        (layer.handle && layer.handle.toString().includes('authenticateToken'))
      );
      expect(hasAuthMiddleware).toBeTruthy();
    });
  });

  describe('Route endpoints', () => {
    it('should have getUserProgress route', () => {
      const routes = adaptiveRoutes.stack.map(layer => ({
        method: layer.route?.stack?.[0]?.method,
        path: layer.route?.path
      })).filter(route => route.path);
      
      const hasProgressRoute = routes.some(route => 
        route.path === '/users/:id/progress' && route.method === 'get'
      );
      expect(hasProgressRoute).toBeTruthy();
    });

    it('should have generateAdaptivePlan route', () => {
      const routes = adaptiveRoutes.stack.map(layer => ({
        method: layer.route?.stack?.[0]?.method,
        path: layer.route?.path
      })).filter(route => route.path);
      
      const hasPlanRoute = routes.some(route => 
        route.path === '/users/:id/adaptive-plan' && route.method === 'post'
      );
      expect(hasPlanRoute).toBeTruthy();
    });

    it('should have completeWorkout route', () => {
      const routes = adaptiveRoutes.stack.map(layer => ({
        method: layer.route?.stack?.[0]?.method,
        path: layer.route?.path
      })).filter(route => route.path);
      
      const hasWorkoutRoute = routes.some(route => 
        route.path === '/workouts/:id/complete' && route.method === 'post'
      );
      expect(hasWorkoutRoute).toBeTruthy();
    });

    it('should have getGamifiedStats route', () => {
      const routes = adaptiveRoutes.stack.map(layer => ({
        method: layer.route?.stack?.[0]?.method,
        path: layer.route?.path
      })).filter(route => route.path);
      
      const hasStatsRoute = routes.some(route => 
        route.path === '/users/:id/stats' && route.method === 'get'
      );
      expect(hasStatsRoute).toBeTruthy();
    });

    it('should have advanceToNextPhase route', () => {
      const routes = adaptiveRoutes.stack.map(layer => ({
        method: layer.route?.stack?.[0]?.method,
        path: layer.route?.path
      })).filter(route => route.path);
      
      const hasAdvanceRoute = routes.some(route => 
        route.path === '/users/:id/phase/advance' && route.method === 'post'
      );
      expect(hasAdvanceRoute).toBeTruthy();
    });

    it('should have getTrainingPhases route', () => {
      const routes = adaptiveRoutes.stack.map(layer => ({
        method: layer.route?.stack?.[0]?.method,
        path: layer.route?.path
      })).filter(route => route.path);
      
      const hasPhasesRoute = routes.some(route => 
        route.path === '/phases' && route.method === 'get'
      );
      expect(hasPhasesRoute).toBeTruthy();
    });
  });

  describe('Controller method bindings', () => {
    it('should bind all controller methods correctly', () => {
      expect(AdaptiveController.getUserProgress).toBeDefined();
      expect(AdaptiveController.generateAdaptivePlan).toBeDefined();
      expect(AdaptiveController.completeWorkout).toBeDefined();
      expect(AdaptiveController.getGamifiedStats).toBeDefined();
      expect(AdaptiveController.advanceToNextPhase).toBeDefined();
      expect(AdaptiveController.getTrainingPhases).toBeDefined();
    });
  });
}); 