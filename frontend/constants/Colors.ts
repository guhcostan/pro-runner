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
