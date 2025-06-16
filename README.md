# ProRunner 🏃‍♂️

MVP de um aplicativo de corrida que gera planos de treino personalizados baseados no perfil do usuário.

## 📱 O que é o ProRunner?

O ProRunner é uma solução completa que combina um backend em Node.js com um frontend React Native para criar planos de treino de corrida personalizados. O app analisa dados como altura, peso, recorde pessoal nos 5km e objetivos para gerar um programa de 8 semanas adaptado ao nível de cada corredor.

## 🏗️ Arquitetura

### Backend (Node.js + Express)
- **API RESTful** para gestão de usuários e planos
- **Supabase** como banco de dados PostgreSQL
- **Algoritmo inteligente** para geração de planos baseado em:
  - BMI e nível de fitness
  - Objetivos específicos
  - Progressão gradual de volume
  - Distribuição de tipos de treino

### Frontend (React Native + Expo)
- **Tema escuro minimalista** focado na experiência do usuário
- **Onboarding simples** com formulário de cadastro
- **Visualização intuitiva** do plano por semanas
- **Acompanhamento de progresso** com estatísticas
- **Persistência local** dos dados com Zustand

## 🚀 Funcionalidades

### ✅ Implementado
- [x] Cadastro de usuário com validações
- [x] Geração automática de planos de treino
- [x] Visualização do plano por semanas
- [x] Marcação de treinos como concluídos
- [x] Estatísticas de progresso
- [x] Perfil do usuário
- [x] Tema escuro responsivo
- [x] Persistência de dados

### 🔮 Futuro (não implementado)
- [ ] Integração com Strava
- [ ] Integração com Apple Health
- [ ] Contratação de treinador via app
- [ ] Planos com IA mais avançada

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- Joi (validação)
- mathjs (cálculos)

### Frontend
- React Native via Expo
- Zustand (state management)
- Axios (HTTP client)
- React Hook Form
- TypeScript

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo CLI
- Conta no Supabase

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure suas credenciais do Supabase no .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# Configure a URL do backend em services/api.ts se necessário
npm start
```

### Banco de Dados

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `backend/database/schema.sql`
3. Configure as variáveis de ambiente no backend

## 📚 Documentação

### API Endpoints

Ver documentação completa em [`backend/README.md`](./backend/README.md)

**Principais endpoints:**
- `POST /api/users` - Criar usuário
- `POST /api/plans` - Gerar plano de treino
- `GET /api/plans/:userId` - Buscar plano do usuário
- `PUT /api/plans/:planId/progress` - Atualizar progresso

### Tipos de Treino

O algoritmo distribui 4 tipos de treino:

1. **Longões** 🟣 - Corridas longas em ritmo confortável
2. **Tiros** 🔴 - Treinos intervalados de alta intensidade
3. **Tempo** 🟠 - Corridas em ritmo moderadamente difícil
4. **Regenerativo** 🟢 - Corridas leves para recuperação

## 🎯 Objetivos Suportados

- **Melhorar tempo** - Foco em velocidade e performance
- **Ganhar resistência** - Ênfase em volume e resistência
- **Começar a correr** - Volumes reduzidos para iniciantes
- **Perder peso** - Combinação balanceada
- **Manter forma** - Manutenção da condição atual

## 🔧 Configuração de Desenvolvimento

### Estrutura do Projeto
```
ProRunner/
├── backend/          # API Node.js + Express
│   ├── src/
│   ├── database/
│   └── README.md
├── frontend/         # App React Native + Expo
│   ├── app/
│   ├── components/
│   ├── store/
│   └── services/
└── README.md
```

### Variáveis de Ambiente

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
NODE_ENV=development
```

**Frontend:**
- Configure a URL da API em `services/api.ts`

## 🚦 Como Executar

1. **Configure o Supabase** e execute o schema SQL
2. **Inicie o backend** com `npm run dev`
3. **Inicie o frontend** com `npm start`
4. **Abra no dispositivo/emulador** via Expo

## 📱 Screenshots

O app possui tema escuro minimalista com:
- Tela de onboarding intuitiva
- Seletor de semanas de treino
- Cards de treino expandíveis
- Estatísticas de progresso visuais
- Perfil do usuário completo

## 🤝 Contribuição

Este é um MVP focado nas funcionalidades essenciais. Contribuições são bem-vindas para:
- Melhorias na UI/UX
- Novos tipos de treino
- Algoritmos mais sofisticados
- Integrações com wearables

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**ProRunner** - Sua jornada de corrida personalizada 🏃‍♂️💨 # pro-runner
