# 🏃‍♂️ ProRunner Backend

API backend para o aplicativo ProRunner - Gerador de Planos de Treino de Corrida.

## 📋 Funcionalidades

- **Geração de Planos**: Criação automática de planos de treino personalizados
- **Citações Motivacionais**: Sistema de citações diárias e aleatórias em PT/EN
- **Multi-idioma**: Suporte completo para português e inglês
- **Integração Supabase**: Persistência de dados e autenticação
- **API RESTful**: Endpoints bem documentados e estruturados

## 🚀 Tecnologias

- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL + Auth)
- **Jest** + **Supertest** (Testes)
- **ESLint** (Qualidade de código)
- **GitHub Actions** (CI/CD)
- **Render** (Deploy)

## 🛠️ Configuração Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS (opcional)
CORS_ORIGIN=true
```

### 3. Executar o Servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Com coverage
npm run test:coverage
```

### Estrutura de Testes

```
tests/
├── setup.js                    # Configuração global
├── __mocks__/
│   └── supabase.js             # Mock do Supabase
├── app.test.js                 # Testes de integração
├── controllers/
│   └── motivationalController.test.js
└── services/
    └── planService.test.js
```

### Coverage Atual

- **Statements**: 38%
- **Branches**: 10%
- **Functions**: 40%
- **Lines**: 38%

## 🔍 Qualidade de Código

```bash
# Verificar linting
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Usuários
```
POST /api/users          # Criar usuário
GET /api/users/:id       # Buscar usuário
PUT /api/users/:id       # Atualizar usuário
```

### Planos de Treino
```
POST /api/plans          # Criar plano
GET /api/plans/:userId   # Buscar plano do usuário
PUT /api/plans/:planId/progress  # Atualizar progresso
```

### Citações Motivacionais
```
GET /api/motivational/daily?language=pt    # Citação diária
GET /api/motivational/random?language=en   # Citação aleatória
```

## 🚀 CI/CD e Deploy

### GitHub Actions

O projeto inclui automação completa com GitHub Actions:

- **Testes**: Executa em Node.js 18.x e 20.x
- **Linting**: Verificação de qualidade de código
- **Security Audit**: Verificação de vulnerabilidades
- **Deploy**: Deploy automático para Render (branch main)

### Configuração para Deploy

1. **Fork/Clone** o repositório
2. **Configure os secrets** no GitHub:
   - `RENDER_SERVICE_ID`
   - `RENDER_API_KEY`

3. **Push para main** faz deploy automático

### Logs e Monitoramento

- **Health Check**: `/api/health`
- **Logs**: Render Dashboard
- **Coverage**: Codecov (automático)

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/           # Configurações (Supabase)
│   ├── controllers/      # Controladores da API
│   ├── routes/           # Definição de rotas
│   ├── services/         # Lógica de negócio
│   └── validation/       # Esquemas de validação
├── tests/                # Testes automatizados
├── database/             # Scripts SQL e migrações
├── .github/workflows/    # GitHub Actions
└── docs/                 # Documentação adicional
```

## 🔧 Desenvolvimento

### Workflow Recomendado

1. **Branch**: Trabalhe em feature branches
2. **Testes**: Execute `npm test` antes do commit
3. **Lint**: Execute `npm run lint` para verificar qualidade
4. **PR**: Crie Pull Request para main
5. **Deploy**: Merge para main faz deploy automático

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor com hot reload
npm test                 # Executar testes
npm run test:watch       # Testes em modo watch
npm run lint             # Verificar código
npm run lint:fix         # Corrigir problemas de lint

# Produção
npm start                # Servidor de produção
npm run test:coverage    # Testes com coverage
```

## 📊 Banco de Dados

### Tabelas Principais

- `users` - Dados dos usuários
- `training_plans` - Planos de treino gerados
- `motivational_quotes` - Citações motivacionais
- `translations` - Traduções dinâmicas

### Migrações

```sql
-- Arquivo: database/multi_language_support.sql
-- Contém estrutura completa do banco
```

## 🔒 Segurança

- **Environment Variables**: Dados sensíveis em .env
- **Supabase RLS**: Row Level Security habilitado
- **CORS**: Configurado para origins específicos
- **Input Validation**: Joi schemas para validação
- **Security Audit**: NPM audit automático no CI

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão Supabase**:
   - Verificar variáveis de ambiente
   - Confirmar URLs e chaves corretas

2. **Testes falhando**:
   - Verificar se dependências estão instaladas
   - Confirmar configuração do ambiente de teste

3. **Deploy falhando**:
   - Verificar secrets do GitHub
   - Consultar logs no Render Dashboard

### Logs

```bash
# Logs locais
npm run dev

# Logs de produção
# Consultar Render Dashboard > Logs
```

## 📞 Suporte

- **Issues**: [GitHub Issues](link-para-issues)
- **Documentação Completa**: `DEPLOYMENT.md`
- **Render Docs**: https://render.com/docs

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC. 