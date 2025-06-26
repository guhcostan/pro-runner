/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  
  // Sistema Gamificado - Cores de XP e Níveis
  xp: {
    primary: '#22c55e',      // Verde principal para XP
    secondary: '#16a34a',    // Verde escuro para barras
    background: '#f0f9f4',   // Fundo claro
    backgroundDark: '#052e16', // Fundo escuro
  },
  
  // Fases de Treinamento
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
  
  // Status e Estados
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    neutral: '#6b7280',
  },
  
  // Intensidades de Treino
  intensity: {
    easy: '#22c55e',        // Verde - Fácil
    moderate: '#f59e0b',    // Laranja - Moderado
    hard: '#ef4444',        // Vermelho - Difícil
    recovery: '#06b6d4',    // Ciano - Recuperação
  },
  
  // Gradientes para cards e elementos visuais
  gradients: {
    primary: ['#3b82f6', '#1d4ed8'],
    success: ['#22c55e', '#16a34a'],
    warning: ['#f59e0b', '#d97706'],
    error: ['#ef4444', '#dc2626'],
    xp: ['#22c55e', '#16a34a'],
  },
  
  // Elementos de UI
  ui: {
    border: '#e5e7eb',
    borderDark: '#374151',
    card: '#ffffff',
    cardDark: '#1f2937',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.3)',
  },
};

// ProRunner theme colors - Dark focused
export const ProRunnerColors = {
  // Primary colors
  primary: '#10B981', // Emerald green for running
  primaryDark: '#047857',
  primaryLight: '#34D399',
  
  // Background colors
  background: '#0F172A', // Very dark blue-gray
  surface: '#1E293B', // Dark surface
  surfaceLight: '#334155', // Lighter surface
  cardBackground: '#1E293B', // Card background
  
  // Text colors
  textPrimary: '#F8FAFC', // Almost white
  textSecondary: '#CBD5E1', // Light gray
  textMuted: '#64748B', // Muted gray
  
  // Accent colors
  accent: '#3B82F6', // Blue for accents
  success: '#10B981', // Green for success
  warning: '#F59E0B', // Orange for warnings
  error: '#EF4444', // Red for errors
  
  // Border and divider
  border: '#374151',
  divider: '#4B5563',
  
  // Workout type colors
  workoutTypes: {
    longao: '#8B5CF6', // Purple for long runs
    tiros: '#EF4444', // Red for intervals
    tempo: '#F59E0B', // Orange for tempo
    regenerativo: '#10B981', // Green for recovery
  }
};
