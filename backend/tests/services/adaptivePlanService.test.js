const AdaptivePlanService = require('../../src/services/adaptivePlanService');
const { supabase } = require('../../src/config/supabase');

// Mock the dependencies
jest.mock('../../src/config/supabase');
jest.mock('../../src/services/xpService');
jest.mock('../../src/services/progressionService');

const XPCalculatorService = require('../../src/services/xpService');
const ProgressionService = require('../../src/services/progressionService');

describe('AdaptivePlanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserComprehensiveData', () => {
    it('should fetch complete user data successfully', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        age: 30,
        sex: 'male',
        goal: 'run_5k'
      };

      const mockProfile = {
        user_id: 'user123',
        age: 30,
        sex: 'male',
        running_experience_years: 2,
        average_weekly_volume: 15
      };

      const mockProgress = {
        user_id: 'user123',
        current_phase_id: 1,
        current_level: 3,
        training_phases: {
          id: 1,
          name: 'foundation'
        }
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
          };
        }
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
          };
        }
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProgress, error: null })
          };
        }
      });

      const result = await AdaptivePlanService.getUserComprehensiveData('user123');

      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(mockUser);
      expect(result.data.profile).toEqual(mockProfile);
      expect(result.data.progress).toEqual(mockProgress);
    });

    it('should create basic profile if none exists', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        age: 25,
        sex: 'female'
      };

      const mockNewProfile = {
        user_id: 'user123',
        age: 25,
        sex: 'female',
        running_experience_years: 0,
        average_weekly_volume: 0
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
          };
        }
        if (table === 'user_profiles') {
          const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            }),
            insert: jest.fn().mockReturnThis()
          };
          // For the insert call
          mockChain.insert.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockNewProfile, error: null })
          });
          return mockChain;
        }
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          };
        }
      });

      const result = await AdaptivePlanService.getUserComprehensiveData('user123');

      expect(result.success).toBe(true);
      expect(result.data.profile).toEqual(mockNewProfile);
      expect(result.data.progress).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      }));

      const result = await AdaptivePlanService.getUserComprehensiveData('user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('assessUserPhaseAndLevel', () => {
    it('should return existing progress for current users', async () => {
      const mockUser = { id: 'user123' };
      const mockProfile = { running_experience_years: 2 };
      const mockProgress = {
        current_phase_id: 2,
        current_level: 4,
        training_phases: { id: 2, name: 'endurance_building' }
      };

      const result = await AdaptivePlanService.assessUserPhaseAndLevel(
        mockUser, 
        mockProfile, 
        mockProgress
      );

      expect(result.recommendedPhaseId).toBe(2);
      expect(result.recommendedLevel).toBe(4);
      expect(result.isNewUser).toBe(false);
      expect(result.assessment).toBe('existing_progress');
    });

    it('should assess new beginner user correctly', async () => {
      const mockUser = { id: 'user123', goal: 'start_running' };
      const mockProfile = { 
        running_experience_years: 0, 
        average_weekly_volume: 0,
        longest_run_distance: 0,
        age: 25
      };

      const mockPhases = [
        { id: 1, name: 'foundation', phase_order: 1 },
        { id: 2, name: 'endurance_building', phase_order: 2 }
      ];

      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPhases, error: null })
      }));

      const result = await AdaptivePlanService.assessUserPhaseAndLevel(
        mockUser, 
        mockProfile, 
        null
      );

      expect(result.recommendedPhaseId).toBe(1);
      expect(result.recommendedLevel).toBe(1);
      expect(result.isNewUser).toBe(true);
      expect(result.assessment).toBe('beginner');
    });

    it('should assess intermediate user correctly', async () => {
      const mockUser = { id: 'user123', goal: 'run_10k' };
      const mockProfile = { 
        running_experience_years: 2, 
        average_weekly_volume: 20,
        longest_run_distance: 10,
        age: 30
      };

      const mockPhases = [
        { id: 1, name: 'foundation', phase_order: 1 },
        { id: 2, name: 'endurance_building', phase_order: 2 },
        { id: 3, name: 'speed_strength', phase_order: 3 }
      ];

      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPhases, error: null })
      }));

      const result = await AdaptivePlanService.assessUserPhaseAndLevel(
        mockUser, 
        mockProfile, 
        null
      );

      expect(result.recommendedPhaseId).toBe(2);
      expect(result.recommendedLevel).toBe(3);
      expect(result.assessment).toBe('intermediate');
    });

    it('should handle errors and fallback to foundation phase', async () => {
      const mockUser = { id: 'user123' };
      const mockProfile = { running_experience_years: 1 };

      supabase.from.mockImplementation((table) => {
        if (table === 'training_phases') {
          const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Database error' } 
            }),
            single: jest.fn().mockResolvedValue({ 
              data: { id: 1, name: 'foundation' }, 
              error: null 
            })
          };
          return mockChain;
        }
      });

      const result = await AdaptivePlanService.assessUserPhaseAndLevel(
        mockUser, 
        mockProfile, 
        null
      );

      expect(result.recommendedPhaseId).toBe(1);
      expect(result.recommendedLevel).toBe(1);
      expect(result.assessment).toBe('beginner');
      expect(result.error).toBeDefined();
    });
  });

  describe('performInitialAssessment', () => {
    it('should assess beginner correctly', () => {
      const mockUser = { goal: 'start_running' };
      const mockProfile = {
        running_experience_years: 0,
        average_weekly_volume: 0,
        longest_run_distance: 0,
        age: 25
      };

      const result = AdaptivePlanService.performInitialAssessment(mockUser, mockProfile);

      expect(result.experienceLevel).toBe('beginner');
      expect(result.experiencePoints).toBeLessThan(25);
    });

    it('should assess intermediate correctly', () => {
      const mockUser = { goal: 'run_10k' };
      const mockProfile = {
        running_experience_years: 2,
        average_weekly_volume: 20,
        longest_run_distance: 15,
        age: 30
      };

      const result = AdaptivePlanService.performInitialAssessment(mockUser, mockProfile);

      expect(result.experienceLevel).toBe('intermediate');
      expect(result.experiencePoints).toBeGreaterThanOrEqual(25);
      expect(result.experiencePoints).toBeLessThan(50);
    });

    it('should assess advanced correctly', () => {
      const mockUser = { goal: 'marathon' };
      const mockProfile = {
        running_experience_years: 5,
        average_weekly_volume: 40,
        longest_run_distance: 25,
        age: 28
      };

      const result = AdaptivePlanService.performInitialAssessment(mockUser, mockProfile);

      expect(result.experienceLevel).toBe('advanced');
      expect(result.experiencePoints).toBeGreaterThanOrEqual(50);
    });
  });

  describe('generateInitialRecommendations', () => {
    it('should generate beginner recommendations', () => {
      const result = AdaptivePlanService.generateInitialRecommendations('beginner');

      expect(result.weeklyFrequency).toBe(3);
      expect(result.sessionDuration).toBe(30);
      expect(result.startingIntensity).toBe('easy');
      expect(result.focusAreas).toContain('establish_routine');
    });

    it('should generate intermediate recommendations', () => {
      const result = AdaptivePlanService.generateInitialRecommendations('intermediate');

      expect(result.weeklyFrequency).toBe(4);
      expect(result.sessionDuration).toBe(45);
      expect(result.startingIntensity).toBe('moderate');
      expect(result.focusAreas).toContain('increase_volume');
    });

    it('should generate advanced recommendations', () => {
      const result = AdaptivePlanService.generateInitialRecommendations('advanced');

      expect(result.weeklyFrequency).toBe(5);
      expect(result.sessionDuration).toBe(60);
      expect(result.startingIntensity).toBe('moderate_hard');
      expect(result.focusAreas).toContain('performance_optimization');
    });

    it('should fallback to beginner for unknown level', () => {
      const result = AdaptivePlanService.generateInitialRecommendations('unknown');

      expect(result.weeklyFrequency).toBe(3);
      expect(result.sessionDuration).toBe(30);
    });
  });

  describe('getWorkoutTemplatesForPhase', () => {
    it('should fetch workout templates successfully', async () => {
      const mockTemplates = [
        { 
          id: 1, 
          phase_id: 1, 
          workout_type: 'easy_run',
          level_range: [1, 3],
          estimated_duration_minutes: 30
        },
        { 
          id: 2, 
          phase_id: 1, 
          workout_type: 'walk_run_intervals',
          level_range: [1, 2],
          estimated_duration_minutes: 25
        }
      ];

      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockTemplates, error: null })
      }));

      const result = await AdaptivePlanService.getWorkoutTemplatesForPhase(1, 2);

      expect(result).toEqual(mockTemplates);
    });

    it('should return empty array on error', async () => {
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      }));

      const result = await AdaptivePlanService.getWorkoutTemplatesForPhase(1, 2);

      expect(result).toEqual([]);
    });
  });

  describe('generateWeeklySchedule', () => {
    const mockTemplates = [
      { id: 1, workout_type: 'easy_run', estimated_duration_minutes: 30 },
      { id: 2, workout_type: 'walk_run_intervals', estimated_duration_minutes: 25 },
      { id: 3, workout_type: 'tempo_run', estimated_duration_minutes: 40 }
    ];

    const mockPhase = { name: 'foundation' };

    it('should generate schedule based on profile preferences', () => {
      const mockProfile = {
        preferred_training_days: ['monday', 'wednesday', 'friday'],
        available_time_per_session: 45
      };

      const result = AdaptivePlanService.generateWeeklySchedule(
        mockProfile, 
        mockTemplates, 
        mockPhase
      );

      expect(result).toHaveLength(3);
      expect(result[0].day).toBe('monday');
      expect(result[1].day).toBe('wednesday');
      expect(result[2].day).toBe('friday');
      expect(result[0].estimated_duration).toBeLessThanOrEqual(45);
    });

    it('should use defaults when profile preferences are missing', () => {
      const mockProfile = {};

      const result = AdaptivePlanService.generateWeeklySchedule(
        mockProfile, 
        mockTemplates, 
        mockPhase
      );

      expect(result).toHaveLength(3);
      expect(result[0].estimated_duration).toBeLessThanOrEqual(60);
    });
  });

  describe('getWorkoutDistribution', () => {
    it('should return foundation distribution', () => {
      const phase = { name: 'foundation' };
      
      const result = AdaptivePlanService.getWorkoutDistribution(phase, 3);
      
      expect(result).toHaveLength(3);
      expect(result).toContain('walk_run_intervals');
      expect(result).toContain('easy_run');
    });

    it('should return endurance building distribution', () => {
      const phase = { name: 'endurance_building' };
      
      const result = AdaptivePlanService.getWorkoutDistribution(phase, 4);
      
      expect(result).toHaveLength(4);
      expect(result).toContain('easy_run');
      expect(result).toContain('long_run');
      expect(result).toContain('interval_training');
    });

    it('should fallback to foundation for unknown phase', () => {
      const phase = { name: 'unknown_phase' };
      
      const result = AdaptivePlanService.getWorkoutDistribution(phase, 3);
      
      expect(result).toHaveLength(3);
      expect(result).toContain('walk_run_intervals');
    });

    it('should fallback to 3-day frequency for unknown frequency', () => {
      const phase = { name: 'foundation' };
      
      const result = AdaptivePlanService.getWorkoutDistribution(phase, 7);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('personalizeWorkoutIntensities', () => {
    const mockSchedule = [
      {
        template: { workout_type: 'easy_run' },
        estimated_duration: 30
      }
    ];

    it('should adjust intensity for older users', () => {
      const mockUser = { age: 55 };
      const mockProfile = { age: 55, injury_history: [] };

      const result = AdaptivePlanService.personalizeWorkoutIntensities(
        mockSchedule, 
        mockUser, 
        mockProfile
      );

      expect(result[0].intensity_adjustment).toBe(0.9);
    });

    it('should adjust intensity for younger users', () => {
      const mockUser = { age: 22 };
      const mockProfile = { age: 22, injury_history: [] };

      const result = AdaptivePlanService.personalizeWorkoutIntensities(
        mockSchedule, 
        mockUser, 
        mockProfile
      );

      expect(result[0].intensity_adjustment).toBe(1.05);
    });

    it('should adjust for recent injuries', () => {
      const mockUser = { age: 30 };
      const recentInjury = {
        type: 'knee',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        recovered: false
      };
      const mockProfile = { 
        age: 30, 
        injury_history: [recentInjury] 
      };

      const result = AdaptivePlanService.personalizeWorkoutIntensities(
        mockSchedule, 
        mockUser, 
        mockProfile
      );

      expect(result[0].intensity_adjustment).toBe(0.85);
      expect(result[0].injury_modifications).toContain('knee');
    });

    it('should mark beginner-friendly for new runners', () => {
      const mockUser = { age: 30, goal: 'start_running' };
      const mockProfile = { age: 30, injury_history: [] };

      const result = AdaptivePlanService.personalizeWorkoutIntensities(
        mockSchedule, 
        mockUser, 
        mockProfile
      );

      expect(result[0].beginner_friendly).toBe(true);
    });
  });

  describe('addGamificationElements', () => {
    const mockPlan = [
      {
        template: { 
          workout_type: 'easy_run',
          completion_bonus_xp: 50
        },
        estimated_duration: 30
      }
    ];

    const mockProgress = { current_streak_days: 5 };
    const mockAssessment = { recommendedLevel: 3 };

    beforeEach(() => {
      XPCalculatorService.calculateWorkoutXP.mockReturnValue({
        totalXP: 120,
        baseXP: 100,
        bonuses: { consistency: 20 }
      });
    });

    it('should add gamification elements to workouts', () => {
      const result = AdaptivePlanService.addGamificationElements(
        mockPlan, 
        mockProgress, 
        mockAssessment
      );

      expect(result[0].gamification).toBeDefined();
      expect(result[0].gamification.expectedXP).toBe(120);
      expect(result[0].gamification.completionReward).toBe(50);
      expect(result[0].gamification.difficultyLevel).toBeGreaterThan(0);
      expect(result[0].gamification.motivationalMessage).toBeDefined();
    });
  });

  describe('estimateWorkoutDistance', () => {
    it('should estimate distance for easy run', () => {
      const workout = {
        estimated_duration: 30,
        template: { workout_type: 'easy_run' }
      };

      const result = AdaptivePlanService.estimateWorkoutDistance(workout);

      expect(result).toBe(3.0); // 30 minutes * 0.10 km/min = 3.0 km
    });

    it('should estimate distance for tempo run', () => {
      const workout = {
        estimated_duration: 40,
        template: { workout_type: 'tempo_run' }
      };

      const result = AdaptivePlanService.estimateWorkoutDistance(workout);

      expect(result).toBe(4.8); // 40 minutes * 0.12 km/min = 4.8 km
    });

    it('should use default pace for unknown workout type', () => {
      const workout = {
        estimated_duration: 25,
        template: { workout_type: 'unknown_workout' }
      };

      const result = AdaptivePlanService.estimateWorkoutDistance(workout);

      expect(result).toBe(2.5); // 25 minutes * 0.10 km/min (default) = 2.5 km
    });
  });

  describe('calculateWorkoutDifficulty', () => {
    it('should calculate difficulty for easy workout', () => {
      const workout = {
        template: { workout_type: 'easy_run' }
      };
      const assessment = { recommendedLevel: 2 };

      const result = AdaptivePlanService.calculateWorkoutDifficulty(workout, assessment);

      expect(result).toBe(2);
    });

    it('should calculate difficulty for hard workout with high level', () => {
      const workout = {
        template: { workout_type: 'vo2max_intervals' }
      };
      const assessment = { recommendedLevel: 9 };

      const result = AdaptivePlanService.calculateWorkoutDifficulty(workout, assessment);

      expect(result).toBe(5); // Capped at 5
    });

    it('should handle unknown workout type', () => {
      const workout = {
        template: { workout_type: 'unknown_workout' }
      };
      const assessment = { recommendedLevel: 1 };

      const result = AdaptivePlanService.calculateWorkoutDifficulty(workout, assessment);

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
    });
  });

  describe('generateMotivationalMessage', () => {
    const mockWorkout = {
      template: { workout_type: 'easy_run' }
    };
    const mockAssessment = { recommendedLevel: 2 };

    it('should generate first workout message', () => {
      const result = AdaptivePlanService.generateMotivationalMessage(
        mockWorkout, 
        0, 
        mockAssessment
      );

      expect(result.pt).toContain('primeiro passo');
      expect(result.en).toContain('first step');
      expect(result.es).toContain('primer paso');
    });

    it('should generate challenging workout message for high difficulty', () => {
      const challengingWorkout = {
        template: { workout_type: 'vo2max_intervals' }
      };

      const result = AdaptivePlanService.generateMotivationalMessage(
        challengingWorkout, 
        1, 
        mockAssessment
      );

      expect(result.pt).toContain('desafio');
      expect(result.en).toContain('Challenge');
      expect(result.es).toContain('desafío');
    });

    it('should generate final workout message', () => {
      const result = AdaptivePlanService.generateMotivationalMessage(
        mockWorkout, 
        3, 
        mockAssessment
      );

      expect(result.pt).toContain('Último treino');
      expect(result.en).toContain('Last workout');
      expect(result.es).toContain('Último entrenamiento');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle null/undefined inputs gracefully', async () => {
      const result = await AdaptivePlanService.getUserComprehensiveData(null);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty templates array', () => {
      const mockProfile = { preferred_training_days: ['monday'] };
      const mockPhase = { name: 'foundation' };

      const result = AdaptivePlanService.generateWeeklySchedule(
        mockProfile, 
        [], 
        mockPhase
      );

      expect(result).toEqual([]);
    });

    it('should handle missing profile data gracefully', () => {
      const result = AdaptivePlanService.performInitialAssessment({}, {});

      expect(result.experienceLevel).toBe('beginner');
      expect(result.experiencePoints).toBeGreaterThanOrEqual(0);
    });
  });
}); 