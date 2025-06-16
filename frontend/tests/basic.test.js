// Teste básico para verificar se o Jest está funcionando

describe('Basic Tests', () => {
  test('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should test string concatenation', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
  });

  test('should test array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
  });
}); 