# Deployment do Frontend - ProRunner

## Visão Geral

O frontend do ProRunner é uma aplicação React Native/Expo com suporte para Web, iOS e Android. Este documento descreve o processo de CI/CD configurado para automação de testes e deployment.

## Arquitetura de Deployment

### Plataformas de Deploy

1. **Web**: Netlify (para versão web do Expo)
2. **Mobile**: Expo Application Services (EAS)
3. **CI/CD**: GitHub Actions

### Fluxo de CI/CD

```
Push/PR → GitHub Actions → Tests → Build → Deploy
```

## Configuração do CI/CD

### 1. GitHub Actions Workflows

O arquivo `.github/workflows/frontend-ci-cd.yml` contém:

- **Test Job**: Executa testes, lint e typecheck
- **Build Job**: Cria build de produção
- **Security Job**: Executa auditoria de segurança
- **Deploy Preview**: Deploy de preview para PRs
- **Deploy Production**: Deploy de produção (branch main)

### 2. Secrets Necessários

Configure os seguintes secrets no GitHub:

```bash
# Netlify
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id

# Expo (para builds mobile)
EXPO_TOKEN=your_expo_token
```

### 3. Obter Tokens

#### Netlify
1. Acesse [Netlify](https://app.netlify.com/)
2. Vá em User settings → Applications → Personal access tokens
3. Gere um novo token
4. Para SITE_ID: Vá no seu site → Site settings → General → Site details

#### Expo
1. Acesse [Expo](https://expo.dev/)
2. Vá em Account settings → Access tokens
3. Gere um novo token

## Setup Local

### 1. Instalação

```bash
cd frontend
npm install
```

### 2. Scripts Disponíveis

```bash
# Desenvolvimento
npm start          # Inicia o servidor Expo
npm run android    # Executa no Android
npm run ios        # Executa no iOS
npm run web        # Executa na web

# Testes
npm test           # Executa testes
npm run test:watch # Executa testes em modo watch
npm run test:coverage # Executa testes com coverage

# Qualidade
npm run lint       # Executa ESLint
npm run lint:fix   # Executa ESLint com correções automáticas
npm run typecheck  # Verifica tipos TypeScript

# Build
npm run build:web  # Build para web
npm run build:android # Build para Android (EAS)
npm run build:ios  # Build para iOS (EAS)
```

### 3. Variáveis de Ambiente

Crie os arquivos de ambiente:

```bash
# .env.local (desenvolvimento local)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# .env.production (produção)
EXPO_PUBLIC_API_URL=https://your-backend-url.com
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Manual

### 1. Web (Netlify)

```bash
# Build
npm run build:web

# Deploy manual via Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### 2. Mobile (EAS)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login
eas login

# Build Android
eas build --platform android

# Build iOS  
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## Estrutura de Testes

### 1. Configuração

- **Framework**: Jest + Testing Library
- **Coverage**: Configurado para gerar relatórios
- **Mocks**: Configurados para Expo modules

### 2. Tipos de Testes

```bash
tests/
├── setup.ts              # Configuração global
├── stores/               # Testes de stores (Zustand)
├── components/          # Testes de componentes
├── services/           # Testes de serviços
└── utils/             # Testes de utilitários
```

### 3. Executando Testes

```bash
# Todos os testes
npm test

# Com coverage
npm run test:coverage

# Em modo watch
npm run test:watch

# Arquivo específico
npm test userStore.test.ts
```

## Monitoramento e Logs

### 1. Build Status

- GitHub Actions mostra status dos builds
- Notifications no Slack/Discord (configure webhooks)

### 2. Error Tracking

Para produção, considere adicionar:
- Sentry para tracking de erros
- Analytics (Expo Analytics)

### 3. Performance

- Lighthouse CI para métricas web
- Bundle analyzer para otimização

## Troubleshooting

### 1. Problemas Comuns

**Build falhando**:
```bash
# Limpar cache
rm -rf node_modules
npm install
rm -rf .expo
```

**Testes falhando**:
```bash
# Verificar mocks
# Verificar imports dos testes
# Verificar configuração Jest
```

**Deploy falhando**:
```bash
# Verificar secrets do GitHub
# Verificar configuração Netlify
# Verificar logs do CI
```

### 2. Logs Úteis

```bash
# Logs do Expo
npx expo logs

# Logs do build
npm run build:web -- --verbose

# Logs dos testes
npm test -- --verbose
```

## Próximos Passos

1. **Preview Deployments**: Configurados via Netlify para PRs
2. **Mobile CI**: Adicionar builds automáticos para EAS
3. **E2E Tests**: Implementar com Detox ou Maestro
4. **Performance Monitoring**: Adicionar métricas de performance
5. **A/B Testing**: Configurar para experimentos

## Links Úteis

- [Expo Documentation](https://docs.expo.dev/)
- [Netlify Documentation](https://docs.netlify.com/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [EAS Build](https://docs.expo.dev/build/introduction/) 