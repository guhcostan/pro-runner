import axios from 'axios';
import { User, TrainingPlan } from '../store/userStore';
import { supabase } from '../lib/supabase';

// Configure the base URL - update this to match your backend URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://pro-runner.onrender.com/api';

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
};

export default api; 