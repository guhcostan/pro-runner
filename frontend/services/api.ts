import axios from 'axios';
import { User, TrainingPlan } from '../store/userStore';
import { supabase } from '../lib/supabase';

// Configure the base URL - update this to match your backend URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://pro-runner.onrender.com/api';

// Performance Optimization: In-memory cache for frequently accessed data
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  clearPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new APICache();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication and logging
api.interceptors.request.use(async (config) => {
  // Add authentication token if available
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }

  if (__DEV__) {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export interface CreateUserRequest {
  name: string;
  height: number;
  weight: number;
  personal_record_5k: string;
  goal: string;
  goal_date?: string;
  auth_user_id?: string;
}

export interface CreateUserResponse {
  message: string;
  user: User;
}

export interface CreatePlanRequest {
  userId: string;
  force?: boolean;
}

export interface CreatePlanResponse {
  message: string;
  plan: TrainingPlan;
}

export interface GetPlanResponse {
  plan: TrainingPlan;
}

export interface UpdateProgressRequest {
  week: number;
  workoutIndex: number;
  completed: boolean;
  notes?: string;
}

export interface MotivationalQuoteResponse {
  success: boolean;
  data: {
    quote: string;
    date?: string;
    language: string;
  };
}

// Adaptive System Interfaces
export interface UserProgress {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPEarned: number;
  totalWorkouts: number;
  currentPhase: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_emoji: string;
  criteria_type: string;
  criteria_value: number;
  earned_at?: string;
}

export interface TrainingPhase {
  id: number;
  name: string;
  description: string;
  phase_order: number;
  is_active: boolean;
}

export interface AdaptivePlan {
  id: string;
  workouts: any[];
  assessment: {
    currentFitness: string;
    recommendations: string[];
  };
  message: string;
}

export interface GamifiedStats {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPEarned: number;
  ranking: {
    position: number;
    totalUsers: number;
  };
  nextMilestones: {
    nextLevel: number;
    xpToNextLevel: number;
    nextAchievement?: Achievement;
  };
  phaseAdvancement: {
    canAdvance: boolean;
    nextPhase?: TrainingPhase;
    missingCriteria: string[];
  };
}

export interface WorkoutCompletionRequest {
  userId: string;
  distance: number;
  duration: number;
  type: string;
  difficulty?: string;
}

export interface WorkoutCompletionResponse {
  success: boolean;
  data: {
    xpEarned: number;
    leveledUp: boolean;
    newLevel?: number;
    achievementsEarned: Achievement[];
    updatedProgress: UserProgress;
  };
}

export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },

  // User endpoints
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async getUserById(userId: string): Promise<{ user: User }> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async getUserByAuthId(authUserId: string): Promise<User | null> {
    try {
      const response = await api.get(`/users/auth/${authUserId}`);
      return response.data.user;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Plan endpoints
  async createPlan(request: CreatePlanRequest): Promise<CreatePlanResponse> {
    const response = await api.post('/plans', request);
    return response.data;
  },

  async getPlanByUserId(userId: string): Promise<GetPlanResponse> {
    const response = await api.get(`/plans/user/${userId}`);
    return response.data;
  },

  async updateWorkoutProgress(
    planId: string, 
    request: UpdateProgressRequest
  ): Promise<{ message: string; workout: any }> {
    const response = await api.put(`/plans/${planId}/progress`, request);
    return response.data;
  },

  // Motivational quotes endpoints
  async getDailyQuote(language: string = 'pt'): Promise<MotivationalQuoteResponse> {
    const response = await api.get(`/motivational/daily?language=${language}`);
    return response.data;
  },

  async getRandomQuote(language: string = 'pt'): Promise<MotivationalQuoteResponse> {
    const response = await api.get(`/motivational/random?language=${language}`);
    return response.data;
  },

  // Adaptive System endpoints with performance optimizations
  async getUserProgress(userId: string): Promise<{ success: boolean; data: UserProgress }> {
    const cacheKey = `progress_${userId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await api.get(`/adaptive/users/${userId}/progress`);
    apiCache.set(cacheKey, response.data, 2); // Cache for 2 minutes
    return response.data;
  },

  async generateAdaptivePlan(userId: string, preferences?: any): Promise<{ success: boolean; data: AdaptivePlan }> {
    const response = await api.post(`/adaptive/users/${userId}/adaptive-plan`, preferences || {});
    // Clear user-related cache after plan generation
    apiCache.clearPattern(userId);
    return response.data;
  },

  async completeWorkout(workoutId: string, request: WorkoutCompletionRequest): Promise<WorkoutCompletionResponse> {
    const response = await api.post(`/adaptive/workouts/${workoutId}/complete`, request);
    // Clear user-related cache after workout completion
    apiCache.clearPattern(request.userId);
    return response.data;
  },

  async getGamifiedStats(userId: string): Promise<{ success: boolean; data: GamifiedStats }> {
    const cacheKey = `stats_${userId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await api.get(`/adaptive/users/${userId}/stats`);
    apiCache.set(cacheKey, response.data, 3); // Cache for 3 minutes
    return response.data;
  },

  async advanceToNextPhase(userId: string, newPhaseId: number): Promise<{ success: boolean; data: any; message: string }> {
    const response = await api.post(`/adaptive/users/${userId}/phase/advance`, { newPhaseId });
    // Clear user-related cache after phase advancement
    apiCache.clearPattern(userId);
    return response.data;
  },

  async getTrainingPhases(): Promise<{ success: boolean; data: TrainingPhase[] }> {
    const cacheKey = 'training_phases';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await api.get('/adaptive/phases');
    apiCache.set(cacheKey, response.data, 30); // Cache for 30 minutes (phases rarely change)
    return response.data;
  },

  // Performance utilities
  clearUserCache(userId: string): void {
    apiCache.clearPattern(userId);
  },

  clearAllCache(): void {
    apiCache.clear();
  },
};

export default api; 