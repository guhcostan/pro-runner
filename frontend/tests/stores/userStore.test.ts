import { renderHook, act } from '@testing-library/react-native';
import { useUserStore } from '../../store/userStore';

describe('UserStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.getState().clearData();
  });

  describe('setUser', () => {
    it('should set user data correctly', () => {
      const { result } = renderHook(() => useUserStore());
      
      const userData = {
        id: 'user-123',
        name: 'João Silva',
        height: 175,
        weight: 70,
        personal_record_5k: '25:00',
        goal: 'fazer_5km',
        weekly_frequency: 3,
        created_at: '2024-01-01T00:00:00Z'
      };

      act(() => {
        result.current.setUser(userData);
      });

      expect(result.current.user).toEqual(userData);
    });
  });

  describe('clearData', () => {
    it('should clear all user data', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Set some data first
      act(() => {
        result.current.setUser({
          id: 'user-123',
          name: 'João Silva',
          height: 175,
          weight: 70,
          personal_record_5k: '25:00',
          goal: 'fazer_5km',
          weekly_frequency: 3,
          created_at: '2024-01-01T00:00:00Z'
        });
      });

      // Clear data
      act(() => {
        result.current.clearData();
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('setOnboardingComplete', () => {
    it('should set onboarding completion status', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setOnboardingComplete(true);
      });

      expect(result.current.isOnboardingComplete).toBe(true);

      act(() => {
        result.current.setOnboardingComplete(false);
      });

      expect(result.current.isOnboardingComplete).toBe(false);
    });
  });

  describe('setPlan', () => {
    it('should set training plan data', () => {
      const { result } = renderHook(() => useUserStore());
      
      const planData = {
        id: 'plan-123',
        user_id: 'user-123',
        goal: 'fazer_5km',
        fitness_level: 'iniciante',
        base_pace: '5:30',
        vdot: 35,
        training_paces: {
          interval: '5:30',
          tempo: '5:45',
          easy: '6:45',
          long: '6:30',
          recovery: '7:15',
          intervalSeconds: 330,
          tempoSeconds: 345,
          easySeconds: 405,
          longSeconds: 390,
          recoverySeconds: 435
        },
        estimated_capabilities: {
          vdot: 35,
          currentMaxDistance: 10,
          safeWeeklyVolume: 25,
          maxLongRunStart: 8,
          maxLongRunPeak: 12,
          estimatedTimes: {
            '10k': 2400,
            'half': 5400,
            'marathon': 11400
          },
          canHandle: {
            '5k': true,
            '10k': true,
            'half': false,
            'marathon': false
          }
        },
        validation: {
          isRealistic: true,
          isIdeal: true,
          adjustedGoal: 'fazer_5km',
          warning: null,
          recommendedWeeks: 8
        },
        total_weeks: 8,
        weekly_frequency: 3,
        weeks: [],
        created_at: '2024-01-01T00:00:00Z'
      };

      act(() => {
        result.current.setPlan(planData);
      });

      expect(result.current.plan).toEqual(planData);
    });
  });

  describe('updateWorkoutProgress', () => {
    it('should update workout completion status', () => {
      const { result } = renderHook(() => useUserStore());
      
      const planData = {
        id: 'plan-123',
        user_id: 'user-123',
        goal: 'fazer_5km',
        fitness_level: 'iniciante',
        base_pace: '5:30',
        vdot: 35,
        training_paces: {
          interval: '5:30',
          tempo: '5:45',
          easy: '6:45',
          long: '6:30',
          recovery: '7:15',
          intervalSeconds: 330,
          tempoSeconds: 345,
          easySeconds: 405,
          longSeconds: 390,
          recoverySeconds: 435
        },
        estimated_capabilities: {
          vdot: 35,
          currentMaxDistance: 10,
          safeWeeklyVolume: 25,
          maxLongRunStart: 8,
          maxLongRunPeak: 12,
          estimatedTimes: {
            '10k': 2400,
            'half': 5400,
            'marathon': 11400
          },
          canHandle: {
            '5k': true,
            '10k': true,
            'half': false,
            'marathon': false
          }
        },
        validation: {
          isRealistic: true,
          isIdeal: true,
          adjustedGoal: 'fazer_5km',
          warning: null,
          recommendedWeeks: 8
        },
        total_weeks: 8,
        weekly_frequency: 3,
        weeks: [
          {
            week: 1,
            volume: 10,
            workouts: [
              {
                id: 'workout-1',
                day: 'Segunda',
                type: 'tempo' as const,
                workoutDetails: {
                  distance: 5,
                  pace: '5:45',
                  description: 'Corrida moderada'
                },
                detailedDescription: 'Treino Tempo - Corrida moderada'
              }
            ]
          }
        ],
        created_at: '2024-01-01T00:00:00Z'
      };

      // Set plan first
      act(() => {
        result.current.setPlan(planData);
      });

      // Update workout progress
      act(() => {
        result.current.updateWorkoutProgress(1, 0, true, 'Treino completado!');
      });

      const updatedPlan = result.current.plan;
      expect(updatedPlan?.weeks[0].workouts[0].completed).toBe(true);
      expect(updatedPlan?.weeks[0].workouts[0].notes).toBe('Treino completado!');
    });
  });
}); 