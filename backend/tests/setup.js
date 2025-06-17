// Configuração global para os testes
require('dotenv').config({ path: '.env.test' });

// Mock do Supabase antes de qualquer importação
jest.mock('../src/config/supabase', () => {
  return require('./__mocks__/supabase');
});

// Mock do console para reduzir verbosidade nos testes
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Timeout padrão para testes
jest.setTimeout(10000);

// Configurações globais de teste
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Porta diferente para testes

// Variáveis de ambiente válidas para testes
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Configuração global para limpar mocks apenas entre suites de teste
afterAll(() => {
  const { supabase } = require('../src/config/supabase');
  if (supabase.clearMockData) {
    supabase.clearMockData();
  }
}); 