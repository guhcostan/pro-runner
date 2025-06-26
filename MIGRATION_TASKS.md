# 📋 Tasks de Migração: Modelo Contínuo e Adaptativo

## 🎯 Visão Geral da Migração

**Objetivo**: Migrar o ProRunner de um modelo baseado em "objetivo + data final" para um sistema contínuo, adaptativo e gamificado com progressão em fases estilo RPG.

**Status Atual**: Sistema com planos fixos baseados em meta e data
**Status Desejado**: Sistema adaptativo com fases, níveis, XP e progressão contínua

---

## 🗂️ FASE 1: FUNDAÇÃO E ESTRUTURA DE DADOS

### 📊 Task 1.1: Extensão do Schema de Banco de Dados
**Prioridade**: ALTA  
**Dependências**: Nenhuma  
**Estimativa**: 3-4 horas

#### Subtasks:
- [ ] **1.1.1** Criar nova tabela `user_profiles` com dados estendidos
  - Campos: `age`, `sex`, `injury_history`, `fitness_assessments`
  - Migrar dados existentes de `users` para `user_profiles`

- [ ] **1.1.2** Criar tabela `training_phases`
  - Campos: `id`, `name`, `description`, `target_audience`, `goals`, `max_level`
  - Popular com as 5 fases: Fundação, Construção, Velocidade, Avançado, Elite

- [ ] **1.1.3** Criar tabela `user_progress`
  - Campos: `user_id`, `current_phase`, `current_level`, `current_xp`, `xp_to_next_level`
  - Índices para performance

- [ ] **1.1.4** Criar tabela `workout_templates`
  - Armazenar templates de treinos por fase/nível
  - Campos: `phase_id`, `level`, `workout_type`, `template_data`

- [ ] **1.1.5** Modificar tabela `training_plans`
  - Adicionar campos: `phase_id`, `level`, `is_adaptive`, `adaptation_rules`
  - Manter compatibilidade com modelo atual

**Arquivos afetados**:
- `backend/database/migration_adaptive_model.sql` (novo)
- `backend/database/schema.sql` (atualização)

---

### 🧮 Task 1.2: Sistema de XP e Progressão ✅
**Prioridade**: ALTA  
**Dependências**: Task 1.1  
**Estimativa**: 4-5 horas  
**Status**: ✅ COMPLETO

#### Subtasks:
- [x] **1.2.1** Criar serviço `XPCalculatorService` ✅
  - Calcular XP por tipo de treino (Easy: 10 XP/km, Interval: 15 XP/km, etc.)
  - Bônus por consistência, conclusão de desafios

- [x] **1.2.2** Implementar lógica de progressão de níveis ✅
  - XP necessário por nível (progressão exponencial)
  - Critérios de avanço de fase

- [x] **1.2.3** Sistema de conquistas e badges ✅
  - Primeira corrida, 100km total, streak de 7 dias, etc.

**Arquivos afetados**:
- `backend/src/services/xpService.js` (novo) ✅
- `backend/src/services/progressionService.js` (novo) ✅

---

## 🗂️ FASE 2: LÓGICA DE NEGÓCIO ADAPTATIVA

### 🤖 Task 2.1: Engine de Geração Adaptativa ✅
**Prioridade**: ALTA  
**Dependências**: Tasks 1.1, 1.2  
**Estimativa**: 6-8 horas  
**Status**: ✅ COMPLETO

#### Subtasks:
- [x] **2.1.1** Refatorar `planService.js` para modelo adaptativo ✅
  - Criar `AdaptivePlanGenerator` 
  - Migrar lógica atual para `LegacyPlanGenerator`

- [x] **2.1.2** Implementar algoritmo de personalização por fase ✅
  - Fundação: Intervalos caminhada/corrida
  - Construção: Foco em distância e resistência aeróbica
  - Velocidade: HIIT e treinos intervalados
  - Avançado: Periodização e alta quilometragem
  - Elite: Treinos especializados

- [x] **2.1.3** Sistema de adaptação baseado em feedback ✅
  - RPE (Rate of Perceived Exertion)
  - Dados de recuperação
  - Histórico de lesões

**Arquivos afetados**:
- `backend/src/services/adaptivePlanService.js` (novo) ✅
- `backend/src/services/planService.js` (refatoração) ✅

---

### 📈 Task 2.2: Sistema de Feedback e Adaptação
**Prioridade**: MÉDIA  
**Dependências**: Task 2.1  
**Estimativa**: 4-5 horas

#### Subtasks:
- [ ] **2.2.1** Criar endpoints para feedback de treinos
  - POST `/api/workouts/:id/feedback`
  - Campos: RPE, fatigue_level, injury_status, notes

- [ ] **2.2.2** Algoritmo de ajuste automático
  - Reduzir intensidade se RPE > 8 consistentemente
  - Aumentar volume se RPE < 6 por 2 semanas
  - Protocolo de recuperação de lesões

- [ ] **2.2.3** Sistema de alertas inteligentes
  - Overtraining detection
  - Sugestões de descanso

**Arquivos afetados**:
- `backend/src/controllers/workoutFeedbackController.js` (novo)
- `backend/src/services/adaptationService.js` (novo)

---

## 🗂️ FASE 3: API E CONTROLADORES

### 🔌 Task 3.1: Novos Endpoints da API ✅
**Prioridade**: ALTA  
**Dependências**: Tasks 2.1, 2.2  
**Estimativa**: 5-6 horas  
**Status**: ✅ COMPLETO

#### Subtasks:
- [x] **3.1.1** Endpoint de progressão do usuário ✅
  - GET `/api/users/:id/progress`
  - Retornar fase, nível, XP, conquistas

- [x] **3.1.2** Endpoint de plano adaptativo ✅
  - POST `/api/users/:id/adaptive-plan`
  - Gerar plano baseado na fase atual

- [x] **3.1.3** Endpoint de registro de treino com XP ✅
  - POST `/api/workouts/:id/complete`
  - Calcular e atribuir XP

- [x] **3.1.4** Endpoint de estatísticas gamificadas ✅
  - GET `/api/users/:id/stats`
  - XP total, ranking, streak atual

**Arquivos afetados**:
- `backend/src/routes/adaptiveRoutes.js` (novo) ✅
- `backend/src/controllers/adaptiveController.js` (novo) ✅

---

### 🔄 Task 3.2: Migração de Dados de Usuários Existentes
**Prioridade**: ALTA  
**Dependências**: Task 3.1  
**Estimativa**: 3-4 horas

#### Subtasks:
- [ ] **3.2.1** Script de migração de usuários
  - Mapear usuários atuais para fases apropriadas
  - Baseado em `goal` e `personal_record_5k`

- [ ] **3.2.2** Cálculo retroativo de XP
  - Estimar XP baseado em planos concluídos
  - Definir nível inicial baseado em histórico

- [ ] **3.2.3** Preservação de compatibilidade
  - Manter endpoints antigos funcionando
  - Flag `legacy_mode` para usuários que preferem modelo antigo

**Arquivos afetados**:
- `backend/scripts/migrate-users-to-adaptive.js` (novo)
- `backend/src/controllers/planController.js` (atualização)

---

## 🗂️ FASE 4: FRONTEND E INTERFACE

### 📱 Task 4.1: Interface de Progressão Gamificada
**Prioridade**: ALTA  
**Dependências**: Task 3.1  
**Estimativa**: 8-10 horas

#### Subtasks:
- [ ] **4.1.1** Componente de Barra de Progresso XP
  - `components/progression/XPProgressBar.tsx`
  - Animações de level up
  - Visual style RPG

- [ ] **4.1.2** Tela de Profile com Estatísticas
  - Fase atual, nível, XP
  - Conquistas e badges
  - Gráficos de progresso

- [ ] **4.1.3** Redesign da tela Plan
  - Substituir conceito de "data final" por "próxima fase"
  - Mostrar progressão contínua
  - Treinos da semana baseados no nível atual

- [ ] **4.1.4** Componente de Feedback de Treino
  - `components/workout/WorkoutFeedback.tsx`
  - RPE slider, notas, status de lesão

**Arquivos afetados**:
- `frontend/components/progression/` (nova pasta)
- `frontend/app/(tabs)/plan.tsx` (refatoração)
- `frontend/app/(tabs)/profile.tsx` (atualização)

---

### 🎮 Task 4.2: Elementos de Gamificação
**Prioridade**: MÉDIA  
**Dependências**: Task 4.1  
**Estimativa**: 6-7 horas

#### Subtasks:
- [ ] **4.2.1** Sistema de Conquistas
  - Modal de conquista desbloqueada
  - Galeria de badges
  - Compartilhamento social

- [ ] **4.2.2** Leaderboard Local
  - Ranking entre amigos
  - Desafios semanais
  - Motivação social

- [ ] **4.2.3** Animações e Feedback Visual
  - Partículas para level up
  - Micro-interações
  - Haptic feedback

**Arquivos afetados**:
- `frontend/components/gamification/` (nova pasta)
- `frontend/components/ui/` (novos componentes)

---

## 🗂️ FASE 5: INTERNACIONALIZAÇÃO E TESTES

### 🌍 Task 5.1: Suporte Multi-idioma Expandido [[memory:2483746241419873155]]
**Prioridade**: ALTA  
**Dependências**: Tasks 4.1, 4.2  
**Estimativa**: 4-5 horas

#### Subtasks:
- [ ] **5.1.1** Expandir `constants/i18n.ts`
  - Adicionar todas as strings do sistema adaptativo
  - Termos de gamificação (XP, level, phase, etc.)
  - Descrições de fases e tipos de treino

- [ ] **5.1.2** Tradução para 3 idiomas
  - Português (pt), Inglês (en), Espanhol (es)
  - Nomes de fases, conquistas, feedback

- [ ] **5.1.3** Backend i18n para mensagens de API
  - Expandir `backend/src/constants/i18n.js`
  - Mensagens de erro e sucesso localizadas

**Arquivos afetados**:
- `frontend/constants/i18n.ts` (expansão)
- `backend/src/constants/i18n.js` (expansão)

---

### 🧪 Task 5.2: Testes Automatizados Completos [[memory:8861948126147406133]]
**Prioridade**: ALTA  
**Dependências**: Todas as tasks anteriores  
**Estimativa**: 6-8 horas

#### Subtasks:
- [ ] **5.2.1** Testes de Unidade - Backend
  - `XPCalculatorService.test.js`
  - `AdaptivePlanService.test.js`
  - `ProgressionService.test.js`
  - Meta: 90%+ cobertura

- [ ] **5.2.2** Testes de Integração - API
  - Fluxo completo de migração
  - Endpoints adaptativos
  - Cenários de progressão

- [ ] **5.2.3** Testes de Frontend
  - Componentes de progressão
  - Fluxos de gamificação
  - Testes de acessibilidade

- [ ] **5.2.4** Testes E2E
  - Jornada do usuário completa
  - Migração de modelo antigo para novo
  - Cenários de edge cases

**Arquivos afetados**:
- `backend/tests/services/` (novos testes)
- `frontend/tests/components/` (novos testes)
- `tests/e2e/` (nova pasta)

---

## 🗂️ FASE 6: FINALIZAÇÃO E DEPLOY

### 🚀 Task 6.1: Otimização e Performance
**Prioridade**: MÉDIA  
**Dependências**: Task 5.2  
**Estimativa**: 3-4 horas

#### Subtasks:
- [ ] **6.1.1** Otimização de Queries
  - Índices para tabelas de progressão
  - Cache para dados de fases/níveis
  - Paginação para leaderboards

- [ ] **6.1.2** Otimização Frontend
  - Lazy loading de componentes gamificados
  - Memoização de cálculos XP
  - Compressão de assets

**Arquivos afetados**:
- `backend/database/performance_adaptive_indexes.sql` (novo)
- `frontend/` (otimizações gerais)

---

### 📋 Task 6.2: Verificação Final e Deploy [[memory:5015505404946715650]]
**Prioridade**: ALTA  
**Dependências**: Task 6.1  
**Estimativa**: 2-3 horas

#### Subtasks:
- [ ] **6.2.1** Execução de todos os checks obrigatórios
  - `npm run test` (backend e frontend)
  - `npm run lint` (backend e frontend)
  - `npm run typecheck` (frontend)
  - Verificar cobertura > 80%

- [ ] **6.2.2** Documentação da API
  - Swagger/OpenAPI para novos endpoints
  - Guia de migração para desenvolvedores

- [ ] **6.2.3** Deploy escalonado
  - Feature flags para rollout gradual
  - Monitoramento de métricas
  - Rollback plan

**Arquivos afetados**:
- `DEPLOYMENT.md` (atualização)
- `backend/docs/api-v2.yml` (novo)

---

## 📊 RESUMO DA MIGRAÇÃO

### Cronograma Estimado
- **Fase 1-2**: 2-3 semanas (Backend core)
- **Fase 3**: 1 semana (API)
- **Fase 4**: 2-3 semanas (Frontend)
- **Fase 5**: 1-2 semanas (i18n + Testes)
- **Fase 6**: 1 semana (Deploy)

**Total**: 7-10 semanas

### Métricas de Sucesso
- [ ] 90%+ dos usuários migrados com sucesso
- [ ] Cobertura de testes > 80%
- [ ] Performance de API < 200ms para operações principais
- [ ] Zero quebras de funcionalidade existente
- [ ] Suporte completo a 3 idiomas

### Riscos Identificados
1. **Migração de dados complexa** - Mitigação: Scripts de rollback
2. **Curva de aprendizado dos usuários** - Mitigação: Tutorial interativo
3. **Performance com gamificação** - Mitigação: Lazy loading e cache

### Pontos de Decisão
- [ ] Manter modelo antigo como opção?
- [ ] Integração com wearables (futura)?
- [ ] Sistema de assinatura premium?

---

## 🔄 NOTAS DE IMPLEMENTAÇÃO

### Padrões de Código
- Seguir princípios SOLID
- Evitar duplicação de código
- Preferir soluções simples
- Considerar ambientes dev/test/prod

### Compatibilidade
- Manter endpoints antigos funcionando
- Migração gradual e opcional
- Fallbacks para funcionalidades básicas

### Monitoramento
- Logs detalhados para debugging
- Métricas de uso das novas features
- Feedback dos usuários em produção 