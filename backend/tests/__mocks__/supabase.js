// Mock do Supabase para testes
let mockData = {};

const mockSupabase = {
  from: jest.fn((table) => {
    const mockTable = {
      select: jest.fn(() => {
        const mockSelect = {
          eq: jest.fn((column, value) => {
            return {
              single: jest.fn(() => {
                if (table === 'users') {
                  if (column === 'id') {
                    if (value === '99999999-9999-9999-9999-999999999999') {
                      return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
                    }
                    if (mockData.users && mockData.users[value]) {
                      return Promise.resolve({ data: mockData.users[value], error: null });
                    }
                    return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
                  }
                  if (column === 'auth_user_id') {
                    const user = Object.values(mockData.users || {}).find(u => u.auth_user_id === value);
                    if (user) {
                      return Promise.resolve({ data: user, error: null });
                    }
                    return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
                  }
                }
                return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
              }),
              limit: jest.fn(() => {
                if (table === 'users' && column === 'auth_user_id') {
                  const users = Object.values(mockData.users || {}).filter(u => u.auth_user_id === value);
                  return Promise.resolve({ data: users, error: null });
                }
                return Promise.resolve({ data: [], error: null });
              }),
              order: jest.fn(() => ({
                limit: jest.fn((count) => {
                  if (table === 'users' && column === 'auth_user_id') {
                    const users = Object.values(mockData.users || {}).filter(u => u.auth_user_id === value);
                    return Promise.resolve({ data: users.slice(0, count), error: null });
                  }
                  return Promise.resolve({ data: [], error: null });
                })
              }))
            };
          }),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        };
        return mockSelect;
      }),
      insert: jest.fn((data) => ({
        select: jest.fn(() => ({
          single: jest.fn(() => {
            if (table === 'users') {
              const userId = 'user-' + Date.now();
              const newUser = { id: userId, ...data[0] };
              if (!mockData.users) mockData.users = {};
              mockData.users[userId] = newUser;
              return Promise.resolve({ data: newUser, error: null });
            }
            if (table === 'training_plans') {
              const planId = 'plan-' + Date.now();
              const newPlan = { id: planId, ...data[0] };
              if (!mockData.plans) mockData.plans = {};
              mockData.plans[planId] = newPlan;
              return Promise.resolve({ data: newPlan, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          })
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    };

    // Adicionar métodos diretos para suportar cadeias como .eq().order().limit()
    mockTable.eq = jest.fn((column, value) => ({
      order: jest.fn(() => ({
        limit: jest.fn((count) => {
          if (table === 'users' && column === 'auth_user_id') {
            const users = Object.values(mockData.users || {}).filter(u => u.auth_user_id === value);
            return Promise.resolve({ data: users.slice(0, count), error: null });
          }
          return Promise.resolve({ data: [], error: null });
        })
      })),
      single: jest.fn(() => {
        if (table === 'users') {
          if (column === 'id') {
            if (value === '99999999-9999-9999-9999-999999999999') {
              return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
            }
            if (mockData.users && mockData.users[value]) {
              return Promise.resolve({ data: mockData.users[value], error: null });
            }
            return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
          }
          if (column === 'auth_user_id') {
            const user = Object.values(mockData.users || {}).find(u => u.auth_user_id === value);
            if (user) {
              return Promise.resolve({ data: user, error: null });
            }
            return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
          }
        }
        return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
      }),
      limit: jest.fn(() => {
        if (table === 'users' && column === 'auth_user_id') {
          const users = Object.values(mockData.users || {}).filter(u => u.auth_user_id === value);
          return Promise.resolve({ data: users, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      })
    }));

    return mockTable;
  }),
  
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signUp: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signIn: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null }))
  },

  rpc: jest.fn(() => Promise.resolve({ data: null, error: null }))
};

// Função para limpar dados entre testes
mockSupabase.clearMockData = () => {
  mockData = {};
};

module.exports = { supabase: mockSupabase }; 