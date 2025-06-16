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
        total_weeks: 8,
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
        total_weeks: 8,
        weeks: [
          {
            week: 1,
            volume: 10,
            workouts: [
              {
                day: 'Segunda',
                type: 'tempo' as const,
                title: 'Treino Tempo',
                distance: 5,
                description: 'Corrida moderada',
                intensity: 'moderada'
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