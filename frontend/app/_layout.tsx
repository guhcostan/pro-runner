import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ProRunnerColors } from '../constants/Colors';

// Custom dark theme for ProRunner
const ProRunnerTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ProRunnerColors.primary,
    background: ProRunnerColors.background,
    card: ProRunnerColors.surface,
    text: ProRunnerColors.textPrimary,
    border: ProRunnerColors.border,
    notification: ProRunnerColors.primary,
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={ProRunnerTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="generating-plan" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor={ProRunnerColors.background} />
    </ThemeProvider>
  );
}
