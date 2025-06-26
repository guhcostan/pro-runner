const ProgressionService = require('../../src/services/progressionService');
const { supabase } = require('../../src/config/supabase');

// Mock do Supabase
jest.mock('../../src/config/supabase.js', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      }))
    }))
  }
}));

describe('ProgressionService', () => {
  describe('meetsAchievementCriteria', () => {
    it('should validate total workouts completed criteria', () => {
      const criteria = { total_workouts_completed: 10 };
      const userProgress = { total_workouts_completed: 15 };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(true);
    });

    it('should fail when workouts are insufficient', () => {
      const criteria = { total_workouts_completed: 10 };
      const userProgress = { total_workouts_completed: 5 };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(false);
    });

    it('should validate total distance criteria', () => {
      const criteria = { total_distance_run: 100 };
      const userProgress = { total_distance_run: 150 };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(true);
    });

    it('should validate streak criteria', () => {
      const criteria = { current_streak_days: 7 };
      const userProgress = { current_streak_days: 10 };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(true);
    });

    it('should validate single run distance criteria with recent workout', () => {
      const criteria = { single_run_distance: 5 };
      const userProgress = {};
      const recentWorkout = { distance: 6 };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress, recentWorkout);
      
      expect(result).toBe(true);
    });

    it('should fail single run distance without recent workout', () => {
      const criteria = { single_run_distance: 5 };
      const userProgress = {};
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(false);
    });

    it('should validate max level reached criteria', () => {
      const criteria = { max_level_reached: 8 };
      const userProgress = { current_level: 10 };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(true);
    });

    it('should handle multiple criteria (all must pass)', () => {
      const criteria = { 
        total_workouts_completed: 10, 
        total_distance_run: 50 
      };
      const userProgress = { 
        total_workouts_completed: 15, 
        total_distance_run: 60 
      };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(true);
    });

    it('should fail if any criteria is not met', () => {
      const criteria = { 
        total_workouts_completed: 10, 
        total_distance_run: 50 
      };
      const userProgress = { 
        total_workouts_completed: 15, 
        total_distance_run: 30 // This fails
      };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(false);
    });
  });

  describe('evaluateExitCriteria', () => {
    it('should pass continuous run minutes criteria for experienced user', () => {
      const exitCriteria = { can_run_continuous_minutes: 30 };
      const userProgress = { total_workouts_completed: 15 };
      
      const result = ProgressionService.evaluateExitCriteria(exitCriteria, userProgress);
      
      expect(result).toBe(true);
    });

    it('should fail continuous run minutes for new user', () => {
      const exitCriteria = { can_run_continuous_minutes: 30 };
      const userProgress = { total_workouts_completed: 5 };
      
      const result = ProgressionService.evaluateExitCriteria(exitCriteria, userProgress);
      
      expect(result).toBe(false);
    });

    it('should evaluate weekly volume criteria', () => {
      const exitCriteria = { weekly_volume_km: 15 };
      const userProgress = { 
        total_distance_run: 100,
        phase_started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      };
      
      const result = ProgressionService.evaluateExitCriteria(exitCriteria, userProgress);
      
      expect(result).toBe(true); // 100km / 1 week = 100km/week > 15km
    });

    it('should check 10k completion ability', () => {
      const exitCriteria = { can_complete_10k: true };
      const userProgress = { total_distance_run: 60 };
      
      const result = ProgressionService.evaluateExitCriteria(exitCriteria, userProgress);
      
      expect(result).toBe(true); // 60km total > 50km threshold
    });

    it('should check half marathon ability', () => {
      const exitCriteria = { can_complete_half_marathon: true };
      const userProgress = { total_distance_run: 250 };
      
      const result = ProgressionService.evaluateExitCriteria(exitCriteria, userProgress);
      
      expect(result).toBe(true); // 250km total > 200km threshold
    });

    it('should require 5k time improvement', () => {
      const exitCriteria = { improved_5k_time: true };
      const userProgress = { best_5k_time: '25:30' };
      
      const result = ProgressionService.evaluateExitCriteria(exitCriteria, userProgress);
      
      expect(result).toBe(true);
    });

    it('should fail 5k time improvement without recorded time', () => {
      const exitCriteria = { improved_5k_time: true };
      const userProgress = { best_5k_time: null };
      
      const result = ProgressionService.evaluateExitCriteria(exitCriteria, userProgress);
      
      expect(result).toBe(false);
    });
  });

  describe('calculateWeeksInCurrentPhase', () => {
    it('should calculate weeks correctly', () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const weeks = ProgressionService.calculateWeeksInCurrentPhase(oneWeekAgo);
      
      expect(weeks).toBe(1);
    });

    it('should return 0 for recent start', () => {
      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      
      const weeks = ProgressionService.calculateWeeksInCurrentPhase(oneDayAgo);
      
      expect(weeks).toBe(0);
    });

    it('should handle null date', () => {
      const weeks = ProgressionService.calculateWeeksInCurrentPhase(null);
      
      expect(weeks).toBe(0);
    });

    it('should calculate multiple weeks correctly', () => {
      const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
      
      const weeks = ProgressionService.calculateWeeksInCurrentPhase(threeWeeksAgo);
      
      expect(weeks).toBe(3);
    });
  });

  describe('calculateAverageWeeklyVolume', () => {
    it('should calculate average weekly volume', () => {
      const userProgress = {
        total_distance_run: 60,
        phase_started_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // 3 weeks ago
      };
      
      const avgVolume = ProgressionService.calculateAverageWeeklyVolume(userProgress);
      
      expect(avgVolume).toBe(20); // 60km / 3 weeks = 20km/week
    });

    it('should handle zero weeks (new phase)', () => {
      const userProgress = {
        total_distance_run: 10,
        phase_started_at: new Date() // Started today
      };
      
      const avgVolume = ProgressionService.calculateAverageWeeklyVolume(userProgress);
      
      expect(avgVolume).toBe(10); // Should divide by 1 (minimum)
    });

    it('should handle null phase start date', () => {
      const userProgress = {
        total_distance_run: 30,
        phase_started_at: null
      };
      
      const avgVolume = ProgressionService.calculateAverageWeeklyVolume(userProgress);
      
      expect(avgVolume).toBe(0);
    });
  });

  describe('getMissingCriteria', () => {
    it('should identify missing criteria', () => {
      const exitCriteria = {
        can_run_continuous_minutes: 30,
        weekly_volume_km: 20,
        improved_5k_time: true
      };
      
      const userProgress = {
        total_workouts_completed: 15, // Passes continuous run
        total_distance_run: 30,       // Fails weekly volume (low volume)
        phase_started_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks
        best_5k_time: null            // Fails 5k time
      };
      
      const missing = ProgressionService.getMissingCriteria(exitCriteria, userProgress);
      
      expect(missing).toHaveLength(2);
      expect(missing.find(m => m.criteria === 'weekly_volume_km')).toBeDefined();
      expect(missing.find(m => m.criteria === 'improved_5k_time')).toBeDefined();
    });

    it('should return empty array when all criteria are met', () => {
      const exitCriteria = {
        can_run_continuous_minutes: 30
      };
      
      const userProgress = {
        total_workouts_completed: 15 // Passes
      };
      
      const missing = ProgressionService.getMissingCriteria(exitCriteria, userProgress);
      
      expect(missing).toHaveLength(0);
    });
  });

  describe('ACHIEVEMENTS definitions', () => {
    it('should have proper structure for achievements', () => {
      const achievements = ProgressionService.ACHIEVEMENTS;
      
      expect(achievements.first_run).toBeDefined();
      expect(achievements.first_run.id).toBe('first_run');
      expect(achievements.first_run.name.pt).toBeDefined();
      expect(achievements.first_run.name.en).toBeDefined();
      expect(achievements.first_run.name.es).toBeDefined();
      expect(achievements.first_run.xp_reward).toBeGreaterThan(0);
      expect(achievements.first_run.criteria).toBeDefined();
    });

    it('should have distance achievements with proper progression', () => {
      const { distance_5k, distance_10k, distance_half_marathon, distance_marathon } = ProgressionService.ACHIEVEMENTS;
      
      expect(distance_5k.xp_reward).toBeLessThan(distance_10k.xp_reward);
      expect(distance_10k.xp_reward).toBeLessThan(distance_half_marathon.xp_reward);
      expect(distance_half_marathon.xp_reward).toBeLessThan(distance_marathon.xp_reward);
    });

    it('should have streak achievements with increasing rewards', () => {
      const { streak_7, streak_30, streak_100 } = ProgressionService.ACHIEVEMENTS;
      
      expect(streak_7.xp_reward).toBeLessThan(streak_30.xp_reward);
      expect(streak_30.xp_reward).toBeLessThan(streak_100.xp_reward);
    });

    it('should have workout count achievements', () => {
      const { workouts_10, workouts_50, workouts_100 } = ProgressionService.ACHIEVEMENTS;
      
      expect(workouts_10.criteria.total_workouts_completed).toBe(10);
      expect(workouts_50.criteria.total_workouts_completed).toBe(50);
      expect(workouts_100.criteria.total_workouts_completed).toBe(100);
    });

    it('should have phase completion achievements', () => {
      const { phase_foundation_complete, phase_endurance_complete, phase_speed_complete } = ProgressionService.ACHIEVEMENTS;
      
      expect(phase_foundation_complete.criteria.completed_phase).toBe('foundation');
      expect(phase_endurance_complete.criteria.completed_phase).toBe('endurance_building');
      expect(phase_speed_complete.criteria.completed_phase).toBe('speed_strength');
    });
  });

  describe('checkPhaseAdvancement', () => {
    it('should check phase advancement successfully', async () => {
      const mockUserProgress = {
        current_level: 10,
        total_workouts_completed: 20,
        total_distance_run: 100,
        phase_started_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 5 weeks ago
        best_5k_time: '25:00'
      };

      const mockCurrentPhase = {
        id: 1,
        max_level: 10,
        phase_order: 1,
        exit_criteria: {
          can_run_continuous_minutes: 30,
          weekly_volume_km: 15
        }
      };

      const mockNextPhase = {
        id: 2,
        name: 'endurance_building',
        phase_order: 2
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'training_phases') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn((field, value) => {
              if (field === 'id') {
                return {
                  single: jest.fn().mockResolvedValue({ data: mockCurrentPhase, error: null })
                };
              } else if (field === 'phase_order') {
                return {
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({ data: mockNextPhase, error: null })
                };
              }
              return {
                single: jest.fn().mockResolvedValue({ data: null, error: null })
              };
            })
          };
        }
      });

      const result = await ProgressionService.checkPhaseAdvancement(mockUserProgress, 1);

      expect(result.canAdvance).toBe(true);
      expect(result.maxLevelReached).toBe(true);
      expect(result.meetsExitCriteria).toBe(true);
      expect(result.nextPhase).toEqual(mockNextPhase);
    });

    it('should handle errors in phase advancement check', async () => {
      const mockUserProgress = { current_level: 5 };

      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Phase not found' } 
        })
      }));

      const result = await ProgressionService.checkPhaseAdvancement(mockUserProgress, 999);

      expect(result.canAdvance).toBe(false);
      expect(result.error).toBe('Phase not found');
    });
  });

  describe('promoteToNextPhase', () => {
    it('should promote user to next phase successfully', async () => {
      const mockUpdatedProgress = {
        user_id: 'user123',
        current_phase_id: 2,
        current_level: 1,
        current_xp: 0
      };

      supabase.from.mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdatedProgress, error: null })
      }));

      // Mock the checkAndAwardAchievements method
      jest.spyOn(ProgressionService, 'checkAndAwardAchievements').mockResolvedValue([]);

      const result = await ProgressionService.promoteToNextPhase('user123', 2);

      expect(result.success).toBe(true);
      expect(result.progress).toEqual(mockUpdatedProgress);
      expect(result.message).toContain('sucesso');
    });

    it('should handle promotion errors', async () => {
      supabase.from.mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Update failed' } 
        })
      }));

      const result = await ProgressionService.promoteToNextPhase('user123', 2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('checkAndAwardAchievements', () => {
    it('should award new achievements', async () => {
      const mockUserProgress = {
        achievements: ['first_run'],
        total_workouts_completed: 10,
        total_distance_run: 50,
        current_streak_days: 7,
        total_xp_earned: 500
      };

      supabase.from.mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      }));

      const result = await ProgressionService.checkAndAwardAchievements('user123', mockUserProgress);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle achievement errors gracefully', async () => {
      const mockUserProgress = {
        achievements: [],
        total_workouts_completed: 5
      };

      supabase.from.mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ 
          error: { message: 'Database error' } 
        })
      }));

      const result = await ProgressionService.checkAndAwardAchievements('user123', mockUserProgress);

      expect(result).toEqual([]);
    });
  });

  describe('getUserProgressionStats', () => {
    it('should get user progression stats successfully', async () => {
      const mockProgressData = {
        user_id: 'user123',
        current_level: 5,
        current_xp: 750,
        xp_to_next_level: 1000,
        total_xp_earned: 2500,
        total_workouts_completed: 25,
        total_distance_run: 150,
        current_streak_days: 10,
        longest_streak_days: 15,
        best_5k_time: '24:30',
        best_10k_time: null,
        achievements: ['first_run', 'distance_5k'],
        phase_started_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        training_phases: {
          id: 1,
          name: 'foundation',
          max_level: 10
        },
        current_phase_id: 1
      };

      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProgressData, error: null })
      }));

      // Mock checkPhaseAdvancement
      jest.spyOn(ProgressionService, 'checkPhaseAdvancement').mockResolvedValue({
        canAdvance: false,
        maxLevelReached: false,
        meetsExitCriteria: false
      });

      const result = await ProgressionService.getUserProgressionStats('user123');

      expect(result.success).toBe(true);
      expect(result.stats.currentLevel).toBe(5);
      expect(result.stats.totalWorkouts).toBe(25);
      expect(result.stats.achievementCount).toBe(2);
      expect(result.stats.phaseProgress.level).toBe(5);
      expect(result.stats.phaseAdvancement).toBeDefined();
    });

    it('should handle stats retrieval errors', async () => {
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'User not found' } 
        })
      }));

      const result = await ProgressionService.getUserProgressionStats('user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle undefined user progress gracefully', () => {
      const criteria = { total_workouts_completed: 10 };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, undefined);
      
      expect(result).toBe(false);
    });

    it('should handle empty criteria object', () => {
      const criteria = {};
      const userProgress = { total_workouts_completed: 5 };
      
      const result = ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      
      expect(result).toBe(true); // Empty criteria should pass
    });

    it('should handle unknown criteria gracefully', () => {
      const criteria = { unknown_criteria: 100 };
      const userProgress = { total_workouts_completed: 5 };
      
      // Should not throw error and should handle unknown criteria
      expect(() => {
        ProgressionService.meetsAchievementCriteria(criteria, userProgress);
      }).not.toThrow();
    });

    it('should handle evaluateExitCriteria edge cases', () => {
      // Test competitive_times criteria
      const competitiveCriteria = { competitive_times: true };
      const userProgress = { total_workouts_completed: 10 };
      
      const result1 = ProgressionService.evaluateExitCriteria(competitiveCriteria, userProgress);
      expect(result1).toBe(false); // Should return false for placeholder

      // Test completed_marathons criteria
      const marathonCriteria = { completed_marathons: 1 };
      const result2 = ProgressionService.evaluateExitCriteria(marathonCriteria, userProgress);
      expect(result2).toBe(false); // Should return false for placeholder

      // Test continuous_improvement criteria
      const improvementCriteria = { continuous_improvement: true };
      const result3 = ProgressionService.evaluateExitCriteria(improvementCriteria, userProgress);
      expect(result3).toBe(true); // Should return true for elite phase
    });
  });
}); 