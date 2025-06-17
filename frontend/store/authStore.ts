import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      
      signUp: async (email: string, password: string) => {
        set({ isLoading: true });
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (data.user && data.session) {
          set({ 
            user: data.user, 
            session: data.session, 
            isAuthenticated: true,
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
        }
        
        return { error };
      },
      
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (data.user && data.session) {
          set({ 
            user: data.user, 
            session: data.session, 
            isAuthenticated: true,
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
        }
        
        return { error };
      },
      
      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Error during signOut:', error);
          // Continue with local cleanup even if Supabase fails
        } finally {
          // Always clear local state
          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setSession: (session) => set({ 
        session, 
        user: session?.user || null,
        isAuthenticated: !!session?.user 
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      initialize: async () => {
        set({ isLoading: true });
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          set({ 
            session, 
            user: session.user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
        }
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
          set({ 
            session, 
            user: session?.user || null, 
            isAuthenticated: !!session?.user,
            isLoading: false 
          });
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 