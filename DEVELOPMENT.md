# 🛠️ Setup de Desenvolvimento - ProRunner

## 🔍 Automação de Qualidade com Husky

Este projeto utiliza **Husky** para automatizar verificações de qualidade de código antes dos commits e pushes.

### 📋 O que é verificado automaticamente:

#### **Pre-commit (antes de cada commit)**
- ✅ **Lint automático** em arquivos alterados
- ✅ **TypeScript check** no frontend
- ✅ **Auto-fix** de problemas de formatação
- ✅ **Adiciona arquivos corrigidos** automaticamente

#### **Pre-push (antes de cada push)**
- ✅ **Todos os testes do backend**
- ✅ **Todos os testes do frontend**
- ✅ **Validação completa** antes de enviar código

### 🚀 Scripts Disponíveis

```bash
# Executar todos os testes
npm run test

# Executar apenas testes do backend
npm run test:backend

# Executar apenas testes do frontend
npm run test:frontend

# Executar lint em ambos os projetos
npm run lint

# Executar apenas lint do backend
npm run lint:backend

# Executar apenas lint do frontend
npm run lint:frontend

# Verificar tipos TypeScript
npm run typecheck

# Executar todas as verificações
npm run check-all
```

### 🔧 Configurações do Lint-Staged

O **lint-staged** executa verificações apenas em arquivos alterados:

- **Backend (.js)**: ESLint com auto-fix
- **Frontend (.ts/.tsx)**: ESLint + TypeScript check com auto-fix

### 📦 Estrutura dos Hooks

```bash
.husky/
├── pre-commit    # Executa lint-staged
└── pre-push      # Executa todos os testes
```

### ⚡ Como Funciona

1. **Ao fazer commit**: Lint + TypeScript são executados automaticamente
2. **Ao fazer push**: Todos os testes são executados
3. **Se algo falhar**: O commit/push é bloqueado até correção
4. **Auto-fix aplicado**: Correções automáticas são adicionadas ao commit

### 🛑 Bypass (Emergência)

Em casos extremos, você pode pular as verificações:

```bash
# Pular pre-commit
git commit --no-verify -m "mensagem"

# Pular pre-push  
git push --no-verify
```

⚠️ **Use com moderação!** Sempre prefira corrigir os problemas.

### 📈 Benefícios

- ✅ **Qualidade consistente** de código
- ✅ **Menos bugs** em produção
- ✅ **Feedback imediato** sobre problemas
- ✅ **Processo automático** sem intervenção manual
- ✅ **Correções automáticas** quando possível

### 🔧 Troubleshooting

**Problema**: Hook não executa
```bash
# Reinstalar Husky
npm run prepare
chmod +x .husky/pre-commit .husky/pre-push
```

**Problema**: Testes falham no pre-push
```bash
# Executar testes localmente primeiro
npm run test
# Corrigir problemas antes do push
```

**Problema**: Lint falha
```bash
# Executar lint com fix
npm run lint:frontend -- --fix
npm run lint:backend -- --fix
```

---

## 🏗️ Estrutura do Projeto

```
ProRunner/
├── backend/          # API Node.js + Express
├── frontend/         # React Native + Expo  
├── .husky/          # Hooks do Git
├── package.json     # Scripts de orquestração
└── DEVELOPMENT.md   # Este arquivo
```

Happy coding! 🎉 