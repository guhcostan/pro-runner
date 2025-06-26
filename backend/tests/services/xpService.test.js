const XPCalculatorService = require('../../src/services/xpService');

describe('XPCalculatorService', () => {
  describe('calculateWorkoutXP', () => {
    it('should calculate base XP correctly for easy run', () => {
      const workout = {
        type: 'easy_run',
        distance: 5,
        duration: 30
      };
      
      const userProgress = {
        current_streak_days: 0
      };

      const result = XPCalculatorService.calculateWorkoutXP(workout, userProgress);

      expect(result.baseXP).toBe(55); // 5 km * 10 XP per km * 1.1 (medium duration, 30 minutes)
      expect(result.completionBonus).toBe(25);
      expect(result.consistencyBonus).toBe(0);
      // Total pode incluir bônus especiais, vamos verificar se é pelo menos o esperado básico
      expect(result.totalXP).toBeGreaterThanOrEqual(75);
    });

    it('should apply duration multiplier correctly', () => {
      const workout = {
        type: 'easy_run',
        distance: 5,
        duration: 60 // Medium duration
      };
      
      const userProgress = {
        current_streak_days: 0
      };

      const result = XPCalculatorService.calculateWorkoutXP(workout, userProgress);

      // Base XP: 5 * 10 = 50, with 1.2 multiplier (long duration) = 60
      expect(result.baseXP).toBe(60);
      expect(result.calculation.durationMultiplier).toBe(1.2); // 60 minutes = long duration
    });

    it('should apply consistency bonus for streak', () => {
      const workout = {
        type: 'easy_run',
        distance: 3,
        duration: 30
      };
      
      const userProgress = {
        current_streak_days: 7
      };

      const result = XPCalculatorService.calculateWorkoutXP(workout, userProgress);

      expect(result.consistencyBonus).toBe(150); // 7-day streak bonus
    });

    it('should calculate XP for interval training correctly', () => {
      const workout = {
        type: 'interval_training',
        distance: 4,
        duration: 45
      };
      
      const userProgress = {
        current_streak_days: 3
      };

      const result = XPCalculatorService.calculateWorkoutXP(workout, userProgress);

      // Base: 4 * 20 = 80 * 1.1 (medium duration) = 88, completion: 50, consistency: 50, special bonuses
      expect(result.baseXP).toBe(88); // 80 * 1.1 (medium duration)
      expect(result.completionBonus).toBe(50);
      expect(result.consistencyBonus).toBe(50);
      // Total pode incluir bônus especiais, então vamos verificar se é pelo menos o mínimo esperado
      expect(result.totalXP).toBeGreaterThanOrEqual(188);
    });

    it('should handle unknown workout type with default values', () => {
      const workout = {
        type: 'unknown_type',
        distance: 3,
        duration: 30
      };
      
      const userProgress = {
        current_streak_days: 0
      };

      const result = XPCalculatorService.calculateWorkoutXP(workout, userProgress);

      // Should use easy_run default (10 XP per km) * 1.1 (medium duration) = 33
      expect(result.baseXP).toBe(33);
      expect(result.completionBonus).toBe(25); // Default completion bonus
    });

    it('should handle personal distance record bonus', () => {
      const workout = {
        type: 'long_run',
        distance: 10,
        duration: 60
      };
      
      const userProgress = {
        current_streak_days: 0,
        longest_run_distance: 8 // Previous longest was 8km
      };

      const result = XPCalculatorService.calculateWorkoutXP(workout, userProgress);

      expect(result.specialBonuses.personalRecordBonus).toBe(200);
    });
  });

  describe('getDurationMultiplier', () => {
    it('should return correct multipliers for different durations', () => {
      expect(XPCalculatorService.getDurationMultiplier(25)).toBe(1.0);  // Short
      expect(XPCalculatorService.getDurationMultiplier(45)).toBe(1.1);  // Medium
      expect(XPCalculatorService.getDurationMultiplier(75)).toBe(1.2);  // Long
      expect(XPCalculatorService.getDurationMultiplier(100)).toBe(1.3); // Very long
    });
  });

  describe('getConsistencyBonus', () => {
    it('should return correct bonuses for different streak lengths', () => {
      expect(XPCalculatorService.getConsistencyBonus(2)).toBe(0);
      expect(XPCalculatorService.getConsistencyBonus(5)).toBe(50);   // 3-day streak
      expect(XPCalculatorService.getConsistencyBonus(10)).toBe(150); // 7-day streak
      expect(XPCalculatorService.getConsistencyBonus(20)).toBe(300); // 14-day streak
      expect(XPCalculatorService.getConsistencyBonus(35)).toBe(750); // 30-day streak
    });
  });

  describe('calculateXPToNextLevel', () => {
    it('should calculate XP requirements with exponential progression', () => {
      expect(XPCalculatorService.calculateXPToNextLevel(1)).toBe(100);  // Level 1->2
      expect(XPCalculatorService.calculateXPToNextLevel(2)).toBe(150);  // Level 2->3
      expect(XPCalculatorService.calculateXPToNextLevel(3)).toBe(225);  // Level 3->4
      expect(XPCalculatorService.calculateXPToNextLevel(5)).toBe(506);  // Level 5->6
    });
  });

  describe('calculateTotalXPForLevel', () => {
    it('should calculate cumulative XP correctly', () => {
      expect(XPCalculatorService.calculateTotalXPForLevel(1)).toBe(0);   // Already at level 1
      expect(XPCalculatorService.calculateTotalXPForLevel(2)).toBe(100); // Need 100 XP to reach level 2
      expect(XPCalculatorService.calculateTotalXPForLevel(3)).toBe(250); // Need 100+150 XP to reach level 3
    });
  });

  describe('checkLevelUp', () => {
    it('should detect level up correctly', () => {
      const result = XPCalculatorService.checkLevelUp(2, 200, 150);
      
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(3);
      expect(result.finalXP).toBe(50); // 200 - 150 = 50 remaining
      expect(result.xpToNextLevel).toBe(225); // XP needed for level 3->4
    });

    it('should not level up when XP is insufficient', () => {
      const result = XPCalculatorService.checkLevelUp(2, 100, 150);
      
      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBe(2);
      expect(result.finalXP).toBe(100);
      expect(result.xpToNextLevel).toBe(150);
    });

    it('should cap level at 10', () => {
      const result = XPCalculatorService.checkLevelUp(10, 1000, 100);
      
      expect(result.newLevel).toBe(10); // Should not exceed level 10
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully and return zero XP', () => {
      const workout = null; // Invalid workout
      
      const result = XPCalculatorService.calculateWorkoutXP(workout);

      expect(result.totalXP).toBe(0);
      expect(result.error).toBeDefined();
    });

    it('should handle missing workout properties', () => {
      const workout = {
        type: 'easy_run'
        // Missing distance and duration
      };
      
      const result = XPCalculatorService.calculateWorkoutXP(workout);

      expect(result.baseXP).toBe(0); // 0 distance * 10 = 0
      expect(result.totalXP).toBeGreaterThan(0); // Should still have completion bonus
    });
  });

  describe('special bonuses calculation', () => {
    it('should identify personal record correctly', () => {
      const workout = { distance: 12, type: 'long_run' };
      const userProgress = { longest_run_distance: 10 };

      expect(XPCalculatorService.isPersonalDistanceRecord(workout, userProgress)).toBe(true);
    });

    it('should not give personal record for shorter distance', () => {
      const workout = { distance: 8, type: 'easy_run' };
      const userProgress = { longest_run_distance: 10 };

      expect(XPCalculatorService.isPersonalDistanceRecord(workout, userProgress)).toBe(false);
    });
  });
}); 