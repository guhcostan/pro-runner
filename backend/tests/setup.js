// Configuração global para os testes
require('dotenv').config({ path: '.env.test' });

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