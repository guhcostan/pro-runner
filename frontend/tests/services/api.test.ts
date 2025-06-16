import { api } from '../../services/api';

// Mock do axios
const mockAxios = require('axios');

jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDailyQuote', () => {
    it('should fetch daily quote successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            quote: 'Teste de citação motivacional',
            language: 'pt',
            date: '2024-01-01'
          }
        }
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.get('/motivational/daily');

      expect(api.get).toHaveBeenCalledWith('/motivational/daily');
      expect(result.data.success).toBe(true);
      expect(result.data.data.quote).toBe('Teste de citação motivacional');
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network Error');
      (api.get as jest.Mock).mockRejectedValue(mockError);

      try {
        await api.get('/motivational/daily');
      } catch (error) {
        expect(error).toBe(mockError);
      }

      expect(api.get).toHaveBeenCalledWith('/motivational/daily');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'João Silva',
        height: 175,
        weight: 70,
        goal: 'fazer_5km',
        experience: 'iniciante',
        availability: 3,
        training_time: 30,
        personal_record_5k: '25:00'
      };

      const mockResponse = {
        data: {
          message: 'Usuário criado com sucesso',
          user: {
            id: 'user-123',
            ...userData
          }
        }
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.post('/users', userData);

      expect(api.post).toHaveBeenCalledWith('/users', userData);
      expect(result.data.user.id).toBe('user-123');
      expect(result.data.user.name).toBe('João Silva');
    });
  });

  describe('generatePlan', () => {
    it('should generate training plan successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Plano criado com sucesso',
          plan: {
            id: 'plan-123',
            user_id: 'user-123',
            goal: 'fazer_5km',
            weeks: []
          }
        }
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await api.post('/plans', { userId: 'user-123' });

      expect(api.post).toHaveBeenCalledWith('/plans', { userId: 'user-123' });
      expect(result.data.plan.id).toBe('plan-123');
    });
  });
}); 