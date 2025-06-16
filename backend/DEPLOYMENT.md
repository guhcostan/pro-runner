# 🚀 Deployment e CI/CD - ProRunner Backend

Este documento explica como configurar a automação de testes e deploy do backend para o Render usando GitHub Actions.

## 📋 Pré-requisitos

- [ ] Conta no [Render](https://render.com)
- [ ] Repositório no GitHub
- [ ] Projeto Supabase configurado

## 🛠️ Configuração Inicial

### 1. Configurar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🧪 Executando Testes

### Testes Locais

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage

# Executar linting
npm run lint

# Corrigir problemas de linting automaticamente
npm run lint:fix
```

### Estrutura de Testes

```
backend/tests/
├── setup.js                    # Configuração global dos testes
├── app.test.js                 # Testes de integração da aplicação
├── controllers/
│   └── motivationalController.test.js
└── services/
    └── planService.test.js
```

## 🔄 CI/CD com GitHub Actions

### 1. Configuração do Workflow

O workflow está configurado em `.github/workflows/backend-ci-cd.yml` e executa:

- **Testes**: Executa em Node.js 18.x e 20.x
- **Linting**: Verifica qualidade do código
- **Security Audit**: Verifica vulnerabilidades de segurança
- **Deploy**: Deploy automático para o Render (apenas branch main)

### 2. Secrets do GitHub

Configure os seguintes secrets no seu repositório GitHub:

1. Vá para **Settings** > **Secrets and variables** > **Actions**
2. Adicione os seguintes secrets:

```
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key
```

### 3. Como obter as credenciais do Render

#### RENDER_API_KEY:
1. Vá para [Render Dashboard](https://dashboard.render.com)
2. Clique no seu avatar > **Account Settings**
3. Vá para **API Keys**
4. Clique em **Create API Key**
5. Copie a chave gerada

#### RENDER_SERVICE_ID:
1. Crie um novo **Web Service** no Render
2. Conecte seu repositório GitHub
3. Configure:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
4. Copie o Service ID da URL (ex: `srv-xxxxxxxxxxxxx`)

## 🚀 Deploy no Render

### 1. Configuração Manual (Primeira vez)

1. **Criar Web Service**:
   - Vá para [Render Dashboard](https://dashboard.render.com)
   - Clique em **New** > **Web Service**
   - Conecte seu repositório GitHub
   - Selecione a branch `main`

2. **Configurações do Serviço**:
   ```
   Name: prorunner-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Root Directory: backend
   Plan: Free (ou superior)
   ```

3. **Variáveis de Ambiente**:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Health Check**:
   - Path: `/api/health`

### 2. Deploy Automático

Após a configuração inicial, o deploy será automático:

- **Push para `main`**: Deploy automático após testes passarem
- **Pull Request**: Apenas executa testes
- **Push para `develop`**: Apenas executa testes

## 📊 Monitoramento

### 1. Health Check

O endpoint de health check está disponível em:
```
GET /api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "service": "ProRunner API",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Logs

Para visualizar logs no Render:
1. Vá para o seu serviço no Dashboard
2. Clique na aba **Logs**
3. Monitore erros e performance

### 3. Coverage de Testes

Os reports de coverage são enviados automaticamente para o Codecov durante o CI.

## 🔧 Troubleshooting

### Problemas Comuns

1. **Testes falhando localmente**:
   ```bash
   # Verificar se as dependências estão instaladas
   npm install
   
   # Verificar configuração do ambiente de teste
   cat .env.test
   ```

2. **Deploy falhando**:
   - Verificar logs no Render Dashboard
   - Confirmar que todas as variáveis de ambiente estão configuradas
   - Verificar se o build command está correto

3. **GitHub Actions falhando**:
   - Verificar se os secrets estão configurados corretamente
   - Confirmar que o Service ID do Render está correto
   - Verificar logs detalhados na aba Actions do GitHub

## 📝 Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm start

# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar linting
npm run lint

# Corrigir linting
npm run lint:fix
```

## 🔄 Workflow de Desenvolvimento

1. **Desenvolvimento**: Trabalhe na branch `develop`
2. **Testes**: Execute `npm test` antes de fazer commit
3. **Pull Request**: Crie PR para `main`
4. **Review**: Aguarde aprovação e testes passarem
5. **Deploy**: Merge para `main` faz deploy automático

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do Render
2. Consulte os logs do GitHub Actions
3. Verifique a documentação do Render: https://render.com/docs 