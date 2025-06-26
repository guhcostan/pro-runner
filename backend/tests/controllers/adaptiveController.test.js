const AdaptiveController = require('../../src/controllers/adaptiveController');
const AdaptivePlanService = require('../../src/services/adaptivePlanService');
const ProgressionService = require('../../src/services/progressionService');
const XPCalculatorService = require('../../src/services/xpService');
const { supabase } = require('../../src/config/supabase');

// Mock dos services
jest.mock('../../src/services/adaptivePlanService');
jest.mock('../../src/services/progressionService');
jest.mock('../../src/services/xpService');
jest.mock('../../src/config/supabase');

describe('AdaptiveController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock request and response objects
    mockReq = {
      params: {},
      body: {},
      user: { id: 'test-user-id', email: 'test@example.com' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock Supabase
    supabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn(),
          order: jest.fn()
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn()
          })
        })
      })
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress successfully', async () => {
      const mockProgressStats = {
        success: true,
        stats: {
          currentLevel: 5,
          currentXP: 250,
          xpToNextLevel: 500,
          totalXPEarned: 1250,
          totalWorkouts: 15,
          currentPhase: 'Development',
          achievements: []
        }
      };

      mockReq.params.id = 'test-user-id';
      ProgressionService.getUserProgressionStats.mockResolvedValue(mockProgressStats);

      await AdaptiveController.getUserProgress(mockReq, mockRes);

      expect(ProgressionService.getUserProgressionStats).toHaveBeenCalledWith('test-user-id');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProgressStats.stats
      });
    });

    it('should return 404 when user progress not found', async () => {
      const mockError = {
        success: false,
        error: 'User progress not found'
      };

      mockReq.params.id = 'test-user-id';
      ProgressionService.getUserProgressionStats.mockResolvedValue(mockError);

      await AdaptiveController.getUserProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User progress not found'
      });
    });

    it('should handle internal server errors', async () => {
      mockReq.params.id = 'test-user-id';
      ProgressionService.getUserProgressionStats.mockRejectedValue(new Error('Database error'));

      await AdaptiveController.getUserProgress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('generateAdaptivePlan', () => {
    it('should generate adaptive plan successfully', async () => {
      const mockPlanResult = {
        success: true,
        plan: {
          id: 'plan-123',
          workouts: [
            { type: 'easy_run', distance: 5, duration: 30 }
          ]
        },
        assessment: {
          currentFitness: 'intermediate',
          recommendations: ['Focus on endurance']
        },
        message: 'Plano gerado com sucesso'
      };

      mockReq.params.id = 'test-user-id';
      mockReq.body = {
        preferences: {
          workoutsPerWeek: 3,
          preferredDays: ['monday', 'wednesday', 'friday']
        }
      };

      AdaptivePlanService.generateAdaptivePlan.mockResolvedValue(mockPlanResult);

      await AdaptiveController.generateAdaptivePlan(mockReq, mockRes);

      expect(AdaptivePlanService.generateAdaptivePlan).toHaveBeenCalledWith('test-user-id', mockReq.body);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          plan: mockPlanResult.plan,
          assessment: mockPlanResult.assessment,
          message: mockPlanResult.message
        }
      });
    });

    it('should handle plan generation errors', async () => {
      const mockError = {
        success: false,
        error: 'Insufficient user data for plan generation'
      };

      mockReq.params.id = 'test-user-id';
      AdaptivePlanService.generateAdaptivePlan.mockResolvedValue(mockError);

      await AdaptiveController.generateAdaptivePlan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient user data for plan generation'
      });
    });
  });

  describe('completeWorkout', () => {
    beforeEach(() => {
      // Setup Supabase mocks for workout completion
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: 'test-user-id',
                current_level: 3,
                current_xp: 150,
                xp_to_next_level: 300,
                total_xp_earned: 650,
                total_workouts_completed: 10,
                total_distance_run: 50,
                current_phase_id: 2
              },
              error: null
            })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  user_id: 'test-user-id',
                  current_level: 3,
                  current_xp: 200,
                  total_xp_earned: 700,
                  total_workouts_completed: 11,
                  total_distance_run: 55
                },
                error: null
              })
            })
          })
        })
      });
    });

    it('should complete workout successfully', async () => {
      const mockXPResult = {
        totalXP: 50,
        baseXP: 40,
        bonusXP: 10
      };

      mockReq.params.id = 'workout-123';
      mockReq.body = {
        userId: 'test-user-id',
        distance: 5,
        duration: 30,
        type: 'easy_run',
        difficulty: 'moderate'
      };

      XPCalculatorService.calculateWorkoutXP.mockReturnValue(mockXPResult);
      ProgressionService.checkAndAwardAchievements.mockResolvedValue([]);
      ProgressionService.checkPhaseAdvancement.mockResolvedValue({
        canAdvance: false
      });

      await AdaptiveController.completeWorkout(mockReq, mockRes);

      expect(XPCalculatorService.calculateWorkoutXP).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          xpEarned: 50,
          leveledUp: false
        })
      });
    });

    it('should return 400 for missing required fields', async () => {
      mockReq.params.id = 'workout-123';
      mockReq.body = {
        userId: 'test-user-id',
        distance: 5
        // Missing duration and type
      };

      await AdaptiveController.completeWorkout(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: userId, distance, duration, type'
      });
    });
  });

  describe('getGamifiedStats', () => {
    it('should return gamified stats successfully', async () => {
      const mockProgressStats = {
        success: true,
        stats: {
          currentLevel: 5,
          currentXP: 250,
          xpToNextLevel: 500,
          totalXPEarned: 1250,
          phaseAdvancement: {
            canAdvance: false,
            nextPhase: null,
            missingCriteria: []
          }
        }
      };

      const mockAllUsers = [
        { user_id: 'user1', total_xp_earned: 2000 },
        { user_id: 'test-user-id', total_xp_earned: 1250 },
        { user_id: 'user3', total_xp_earned: 800 }
      ];

      mockReq.params.id = 'test-user-id';
      ProgressionService.getUserProgressionStats.mockResolvedValue(mockProgressStats);
      
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockAllUsers,
            error: null
          })
        })
      });

      await AdaptiveController.getGamifiedStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          ranking: expect.objectContaining({
            position: 2,
            totalUsers: 3
          }),
          nextMilestones: expect.any(Object)
        })
      });
    });
  });

  describe('advanceToNextPhase', () => {
    it('should advance user to next phase successfully', async () => {
      const mockResult = {
        success: true,
        newPhase: {
          id: 3,
          name: 'Performance',
          description: 'Advanced training phase'
        },
        message: 'Usuário promovido com sucesso!'
      };

      mockReq.params.id = 'test-user-id';
      mockReq.body = { newPhaseId: 3 };

      ProgressionService.promoteToNextPhase.mockResolvedValue(mockResult);

      await AdaptiveController.advanceToNextPhase(mockReq, mockRes);

      expect(ProgressionService.promoteToNextPhase).toHaveBeenCalledWith('test-user-id', 3);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Usuário promovido para a próxima fase com sucesso!'
      });
    });

    it('should return 400 for missing newPhaseId', async () => {
      mockReq.params.id = 'test-user-id';
      mockReq.body = {};

      await AdaptiveController.advanceToNextPhase(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'newPhaseId is required'
      });
    });
  });

  describe('getTrainingPhases', () => {
    it('should return all training phases successfully', async () => {
      const mockPhases = [
        {
          id: 1,
          name: 'Foundation',
          description: 'Base building phase',
          phase_order: 1,
          is_active: true
        },
        {
          id: 2,
          name: 'Development',
          description: 'Endurance building phase',
          phase_order: 2,
          is_active: true
        }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockPhases,
              error: null
            })
          })
        })
      });

      await AdaptiveController.getTrainingPhases(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPhases
      });
    });

    it('should handle database errors', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' }
            })
          })
        })
      });

      await AdaptiveController.getTrainingPhases(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
}); 