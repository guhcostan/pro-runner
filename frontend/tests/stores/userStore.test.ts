import { renderHook, act } from '@testing-library/react-native';
import { useUserStore } from '../../store/userStore';

describe('UserStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.getState().clearData();
  });

  describe('setUserData', () => {
    it('should set user data correctly', () => {
      const { result } = renderHook(() => useUserStore());
      
      const userData = {
        id: 'user-123',
        name: 'João Silva',
        height: 175,
        weight: 70,
        goal: 'fazer_5km' as const,
        experience: 'iniciante' as const,
        availability: 3,
        training_time: 30,
        personal_record_5k: '25:00'
      };

      act(() => {
        result.current.setUserData(userData);
      });

      expect(result.current.userData).toEqual(userData);
    });
  });

  describe('clearData', () => {
    it('should clear all user data', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Set some data first
      act(() => {
        result.current.setUserData({
          id: 'user-123',
          name: 'João Silva',
          height: 175,
          weight: 70,
          goal: 'fazer_5km' as const,
          experience: 'iniciante' as const,
          availability: 3,
          training_time: 30,
          personal_record_5k: '25:00'
        });
      });

      // Clear data
      act(() => {
        result.current.clearData();
      });

      expect(result.current.userData).toBeNull();
    });
  });

  describe('setIsOnboardingComplete', () => {
    it('should set onboarding completion status', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setIsOnboardingComplete(true);
      });

      expect(result.current.isOnboardingComplete).toBe(true);

      act(() => {
        result.current.setIsOnboardingComplete(false);
      });

      expect(result.current.isOnboardingComplete).toBe(false);
    });
  });
}); 