/**
 * ProRunner v2.0 - Sistema de Cores Unificado
 * Focado no sistema adaptativo e gamificado
 */

export const Colors = {
  // Temas base
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: '#10B981',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#10B981',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: '#10B981',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#10B981',
  },
  
  // Cores principais do sistema
  primary: '#10B981',        // Verde principal - ProRunner
  secondary: '#047857',      // Verde escuro
  accent: '#3B82F6',        // Azul para destaques
  
  // Backgrounds e superfícies
  background: {
    primary: '#0F172A',      // Fundo principal escuro
    secondary: '#1E293B',    // Superfícies
    tertiary: '#334155',     // Superfícies claras
    light: '#ffffff',        // Fundo claro
  },
  
  // Textos
  text: {
    primary: '#F8FAFC',      // Texto principal
    secondary: '#CBD5E1',    // Texto secundário
    muted: '#64748B',        // Texto suave
    inverse: '#11181C',      // Texto em fundo claro
  },
  
  // Sistema de XP e gamificação
  xp: {
    primary: '#22c55e',      // XP principal
    secondary: '#16a34a',    // XP escuro
    background: '#f0f9f4',   // Fundo XP claro
    backgroundDark: '#052e16', // Fundo XP escuro
  },
  
  // Fases de treinamento adaptativo
  phases: {
    foundation: {
      primary: '#3b82f6',     // Azul - Base
      secondary: '#1d4ed8',
      background: '#eff6ff',
      backgroundDark: '#1e3a8a',
    },
    development: {
      primary: '#f59e0b',     // Laranja - Desenvolvimento  
      secondary: '#d97706',
      background: '#fffbeb',
      backgroundDark: '#92400e',
    },
    performance: {
      primary: '#ef4444',     // Vermelho - Performance
      secondary: '#dc2626',
      background: '#fef2f2',
      backgroundDark: '#991b1b',
    },
    maintenance: {
      primary: '#8b5cf6',     // Roxo - Manutenção
      secondary: '#7c3aed',
      background: '#f5f3ff',
      backgroundDark: '#581c87',
    },
    recovery: {
      primary: '#06b6d4',     // Ciano - Recuperação
      secondary: '#0891b2',
      background: '#ecfeff',
      backgroundDark: '#164e63',
    },
  },
  
  // Status e estados
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    neutral: '#6b7280',
  },
  
  // Intensidades de treino
  intensity: {
    easy: '#22c55e',        // Verde - Fácil
    moderate: '#f59e0b',    // Laranja - Moderado
    hard: '#ef4444',        // Vermelho - Difícil
    recovery: '#06b6d4',    // Ciano - Recuperação
  },
  
  // Elementos de interface
  ui: {
    border: '#374151',
    borderLight: '#e5e7eb',
    card: '#1E293B',
    cardLight: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Gradientes para elementos visuais
  gradients: {
    primary: ['#10B981', '#047857'],
    xp: ['#22c55e', '#16a34a'],
    foundation: ['#3b82f6', '#1d4ed8'],
    development: ['#f59e0b', '#d97706'],
    performance: ['#ef4444', '#dc2626'],
    maintenance: ['#8b5cf6', '#7c3aed'],
    recovery: ['#06b6d4', '#0891b2'],
  },
};

// Compatibilidade com código existente
export const ProRunnerColors = Colors;
