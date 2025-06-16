# ProRunner Backend

API backend para o aplicativo ProRunner - gerador de planos de treino de corrida personalizados.

## 🚀 Tecnologias

- Node.js + Express
- Supabase (PostgreSQL)
- Joi (validação)
- mathjs (cálculos de treino)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081
```

### Banco de Dados

Execute o script SQL em `database/schema.sql` no seu projeto Supabase para criar as tabelas necessárias.

## 🏃 Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 API Endpoints

### Usuários

#### `POST /api/users`
Cria um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "height": 175,
  "weight": 70,
  "personal_record_5k": "25:30",
  "goal": "melhorar_tempo"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "goal": "melhorar_tempo",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `GET /api/users/:id`
Busca um usuário por ID.

### Planos de Treino

#### `POST /api/plans`
Gera um plano de treino personalizado.

**Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "message": "Plano de treino criado com sucesso",
  "plan": {
    "id": "plan-uuid",
    "user_id": "user-uuid",
    "goal": "melhorar_tempo",
    "fitness_level": "intermediário",
    "base_pace": "05:06",
    "total_weeks": 8,
    "weeks": [...],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `GET /api/plans/:userId`
Busca o plano de treino de um usuário.

#### `PUT /api/plans/:planId/progress`
Atualiza o progresso de um treino específico.

**Body:**
```json
{
  "week": 1,
  "workoutIndex": 0,
  "completed": true,
  "notes": "Treino completado com sucesso!"
}
```

### Health Check

#### `GET /api/health`
Verifica se a API está funcionando.

## 🎯 Objetivos Suportados

- `melhorar_tempo`: Foco em velocidade e performance
- `ganhar_resistencia`: Foco em resistência e volume
- `comecar_correr`: Para iniciantes
- `perder_peso`: Combinação de volume e queima calórica
- `manter_forma`: Manutenção da condição física atual

## 🏋️ Algoritmo de Geração de Planos

O algoritmo considera:

1. **Nível de fitness** baseado no recorde pessoal dos 5km
2. **Objetivo** do usuário para ajustar volume e intensidade
3. **Progressão gradual** ao longo de 8 semanas
4. **Distribuição de treinos**:
   - Corridas longas (longões)
   - Treinos de velocidade (tiros)
   - Treinos tempo
   - Corridas regenerativas

## 🔧 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js
│   ├── controllers/
│   │   ├── userController.js
│   │   └── planController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── planRoutes.js
│   ├── services/
│   │   └── planService.js
│   ├── validation/
│   │   └── schemas.js
│   └── index.js
├── database/
│   └── schema.sql
├── package.json
└── README.md
``` 