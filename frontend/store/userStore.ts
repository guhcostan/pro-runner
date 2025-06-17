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
  goal_date?: string;
  weekly_frequency: number;
  created_at: string;
}

// Nova estrutura VDOT para paces de treino
export interface TrainingPaces {
  interval: string;
  tempo: string;
  easy: string;
  long: string;
  recovery: string;
  intervalSeconds: number;
  tempoSeconds: number;
  easySeconds: number;
  longSeconds: number;
  recoverySeconds: number;
}

// Capacidades estimadas do atleta baseadas no VDOT
export interface EstimatedCapabilities {
  vdot: number;
  currentMaxDistance: number;
  safeWeeklyVolume: number;
  maxLongRunStart: number;
  maxLongRunPeak: number;
  estimatedTimes: {
    '10k': number;
    'half': number;
    'marathon': number;
  };
  canHandle: {
    '5k': boolean;
    '10k': boolean;
    'half': boolean;
    'marathon': boolean;
  };
}

// Validação de objetivo
export interface GoalValidation {
  isRealistic: boolean;
  isIdeal: boolean;
  adjustedGoal: string;
  warning: string | null;
  recommendedWeeks: number;
}

// Dados de progressão esperada ao longo do plano
export interface ProgressionData {
  current: {
    vdot: number;
    time5k: string;
    pace5k: string;
    paces: TrainingPaces;
    weeklyVolume: number;
    maxLongRun: number;
    estimatedTimes: {
      '5k': string;
      '10k': string;
      'half': string;
      'marathon': string;
    };
  };
  final: {
    vdot: number;
    time5k: string;
    pace5k: string;
    paces: TrainingPaces;
    weeklyVolume: number;
    maxLongRun: number;
    estimatedTimes: {
      '5k': string;
      '10k': string;
      'half': string;
      'marathon': string;
    };
  };
  improvements: {
    vdot: number;
    time5k: string;
    pace5k: string;
    weeklyVolume: number;
    maxLongRun: number;
    percentageImprovement: number;
  };
}

// Nova estrutura de detalhes do treino baseada no VDOT
export interface WorkoutDetails {
  distance?: number;
  duration?: number;
  intervals?: number;
  intervalDuration?: number;
  recoveryTime?: number;
  pace: string;
  description: string;
}

export interface Workout {
  id: string;
  type: 'easy' | 'long' | 'interval' | 'tempo' | 'recovery';
  day: string;
  workoutDetails: WorkoutDetails;
  detailedDescription: string;
  tips?: string;
  completed?: boolean;
  completed_at?: string;
  notes?: string;
  capabilities?: EstimatedCapabilities;
}

export interface Week {
  week: number;
  volume: number;
  workouts: Workout[];
}

export interface TrainingPlan {
  id?: string;
  user_id: string;
  user_name?: string;
  goal: string;
  originalGoal?: string;
  fitness_level: string;
  base_pace: string;
  vdot: number;
  training_paces: TrainingPaces;
  weekly_frequency: number;
  total_weeks: number;
  estimated_capabilities: EstimatedCapabilities;
  validation: GoalValidation;
  progression_data?: ProgressionData;
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
  setPlan: (plan: TrainingPlan | null) => void;
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