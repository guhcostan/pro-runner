const request = require('supertest');
const app = require('../../src/index');

describe('Motivational Controller', () => {
  describe('GET /api/motivational/daily', () => {
    test('should return daily motivational quote', async () => {
      const response = await request(app)
        .get('/api/motivational/daily')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('quote');
      expect(response.body.data).toHaveProperty('language');
      expect(typeof response.body.data.quote).toBe('string');
    });

    test('should return Portuguese quote by default', async () => {
      const response = await request(app)
        .get('/api/motivational/daily')
        .expect(200);

      expect(response.body.data.language).toBe('pt');
    });

    test('should return English quote when requested', async () => {
      const response = await request(app)
        .get('/api/motivational/daily?language=en')
        .expect(200);

      expect(response.body.data.language).toBe('en');
    });
  });

  describe('GET /api/motivational/random', () => {
    test('should return random motivational quote', async () => {
      const response = await request(app)
        .get('/api/motivational/random')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('quote');
      expect(response.body.data).toHaveProperty('language');
    });

    test('should return different quotes on multiple calls', async () => {
      const quotes = [];
      
      // Fazer múltiplas requisições
      for (let i = 0; i < 10; i++) { // Aumentar tentativas para maior chance de quotes diferentes
        const response = await request(app)
          .get('/api/motivational/random')
          .expect(200);
        
        quotes.push(response.body.data.quote);
      }

      // Verificar se nem todas são iguais (alta probabilidade de serem diferentes)
      const uniqueQuotes = new Set(quotes);
      expect(uniqueQuotes.size).toBeGreaterThan(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid language parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/motivational/daily?language=invalid')
        .expect(200); // Deve retornar sucesso com fallback

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('quote');
    });
  });
}); 