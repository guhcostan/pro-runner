import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  height: number;
  weight: number;
  personal_record_5k: string;
  goal: string;
  created_at: string;
}

export interface Workout {
  day: string;
  type: 'longao' | 'tiros' | 'tempo' | 'regenerativo';
  title: string;
  distance: number;
  description: string;
  intensity: string;
  completed?: boolean;
  completed_at?: string;
  notes?: string;
}

export interface Week {
  week: number;
  volume: number;
  workouts: Workout[];
}

export interface TrainingPlan {
  id: string;
  user_id: string;
  user_name?: string;
  goal: string;
  fitness_level: string;
  base_pace: string;
  total_weeks: number;
  weeks: Week[];
  created_at: string;
}

interface UserState {
  // User data
  user: User | null;
  plan: TrainingPlan | null;
  isOnboardingComplete: boolean;
  
  // Loading states
  isLoading: boolean;
  isCreatingUser: boolean;
  isCreatingPlan: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setPlan: (plan: TrainingPlan) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCreatingUser: (creating: boolean) => void;
  setCreatingPlan: (creating: boolean) => void;
  updateWorkoutProgress: (week: number, workoutIndex: number, completed: boolean, notes?: string) => void;
  clearData: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      plan: null,
      isOnboardingComplete: false,
      isLoading: false,
      isCreatingUser: false,
      isCreatingPlan: false,
      
      // Actions
      setUser: (user) => set({ user }),
      
      setPlan: (plan) => set({ plan }),
      
      setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setCreatingUser: (creating) => set({ isCreatingUser: creating }),
      
      setCreatingPlan: (creating) => set({ isCreatingPlan: creating }),
      
      updateWorkoutProgress: (week, workoutIndex, completed, notes) => {
        const { plan } = get();
        if (!plan) return;
        
        const updatedWeeks = plan.weeks.map(w => {
          if (w.week === week) {
            const updatedWorkouts = w.workouts.map((workout, index) => {
              if (index === workoutIndex) {
                return {
                  ...workout,
                  completed,
                  completed_at: completed ? new Date().toISOString() : undefined,
                  notes
                };
              }
              return workout;
            });
            return { ...w, workouts: updatedWorkouts };
          }
          return w;
        });
        
        set({ plan: { ...plan, weeks: updatedWeeks } });
      },
      
      clearData: () => set({
        user: null,
        plan: null,
        isOnboardingComplete: false,
        isLoading: false,
        isCreatingUser: false,
        isCreatingPlan: false,
      }),
    }),
    {
      name: 'pro-runner-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        plan: state.plan,
        isOnboardingComplete: state.isOnboardingComplete,
      }),
    }
  )
); 