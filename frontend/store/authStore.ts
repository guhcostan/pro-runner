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
  resetPassword: (email: string) => Promise<{ error?: any }>;
  resendConfirmation: (email: string) => Promise<{ error?: any }>;
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
        
        if (error) {
          set({ isLoading: false });
          return { error };
        }
        
        // Com confirmação de email desabilitada, o usuário e sessão devem vir imediatamente
        if (data.user && data.session) {
          set({ 
            user: data.user, 
            session: data.session, 
            isAuthenticated: true,
            isLoading: false 
          });
          return { error: null };
        } else if (data.user && !data.session) {
          // Usuário criado mas sem sessão - vamos fazer login imediatamente
          console.log('User created but no session - attempting auto-login');
          
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (loginError) {
          set({ isLoading: false });
            return { error: loginError };
          }
          
          if (loginData.user && loginData.session) {
            set({ 
              user: loginData.user, 
              session: loginData.session, 
              isAuthenticated: true,
              isLoading: false 
            });
            return { error: null };
          }
        }
        
        set({ isLoading: false });
        return { error: new Error('Falha ao autenticar após criar conta') };
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
      
      resetPassword: async (email: string) => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'com.prorunner://reset-password',
          });
          
          set({ isLoading: false });
          return { error };
        } catch (error) {
          set({ isLoading: false });
          return { error };
        }
      },
      
      resendConfirmation: async (email: string) => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
          });
          
          set({ isLoading: false });
          return { error };
        } catch (error) {
          set({ isLoading: false });
          return { error };
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