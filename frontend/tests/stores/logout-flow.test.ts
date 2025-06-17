import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(() => Promise.resolve()),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

describe('Logout Flow', () => {
  beforeEach(() => {
    // Reset stores before each test
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setSession(null);
    useUserStore.getState().clearData();
  });

  describe('Complete logout flow', () => {
    it('should clear all data and update authentication state', async () => {
      const authHook = renderHook(() => useAuthStore());
      const userHook = renderHook(() => useUserStore());

      // Set up initial state (simulating logged in user)
      const mockUser = { id: 'test-id', email: 'test@example.com' } as any;
      const mockUserData = {
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
        authHook.result.current.setUser(mockUser);
        authHook.result.current.setSession({ user: mockUser } as any);
        userHook.result.current.setUser(mockUserData);
        userHook.result.current.setOnboardingComplete(true);
      });

      // Verify initial state
      expect(authHook.result.current.isAuthenticated).toBe(true);
      expect(authHook.result.current.user).toEqual(mockUser);
      expect(userHook.result.current.user).toEqual(mockUserData);
      expect(userHook.result.current.isOnboardingComplete).toBe(true);

      // Perform logout
      await act(async () => {
        await authHook.result.current.signOut();
        userHook.result.current.clearData();
      });

      // Verify post-logout state
      expect(authHook.result.current.isAuthenticated).toBe(false);
      expect(authHook.result.current.user).toBeNull();
      expect(authHook.result.current.session).toBeNull();
      expect(userHook.result.current.user).toBeNull();
      expect(userHook.result.current.plan).toBeNull();
      expect(userHook.result.current.isOnboardingComplete).toBe(false);
    });

    it('should handle logout errors gracefully', async () => {
      const { supabase } = require('../../lib/supabase');
      
      // Mock signOut to throw an error
      supabase.auth.signOut.mockRejectedValueOnce(new Error('Network error'));

      const authHook = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        authHook.result.current.setUser({ id: 'test-id' } as any);
        authHook.result.current.setSession({ user: { id: 'test-id' } } as any);
      });

      // Verify initial authenticated state
      expect(authHook.result.current.isAuthenticated).toBe(true);

      // Attempt logout - should not throw error due to try/catch in signOut
      await act(async () => {
        await authHook.result.current.signOut();
      });

      // Should still clear local state even if Supabase fails
      expect(authHook.result.current.isAuthenticated).toBe(false);
      expect(authHook.result.current.user).toBeNull();
      expect(authHook.result.current.session).toBeNull();
    });
  });

  describe('State synchronization', () => {
    it('should keep auth and user stores in sync during logout', async () => {
      const authHook = renderHook(() => useAuthStore());
      const userHook = renderHook(() => useUserStore());

      // Set up authenticated state
      act(() => {
        authHook.result.current.setUser({ id: 'test-id' } as any);
        userHook.result.current.setUser({
          id: 'user-123',
          name: 'João',
          height: 175,
          weight: 70,
          personal_record_5k: '25:00',
          goal: 'fazer_5km',
          weekly_frequency: 3,
          created_at: '2024-01-01T00:00:00Z'
        });
      });

      // Perform logout steps in correct order
      await act(async () => {
        await authHook.result.current.signOut();
      });

      act(() => {
        userHook.result.current.clearData();
      });

      // Verify both stores are cleared
      expect(authHook.result.current.isAuthenticated).toBe(false);
      expect(userHook.result.current.user).toBeNull();
    });
  });
}); 