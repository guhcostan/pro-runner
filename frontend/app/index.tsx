import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ProRunnerColors } from '../constants/Colors';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';

export default function IndexScreen() {
  const router = useRouter();
  const { isOnboardingComplete, user, plan, setUser, setPlan, setOnboardingComplete } = useUserStore();
  const { isAuthenticated, user: authUser, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isAuthenticated || !authUser) {
        // Não está autenticado, vai para login
        router.replace('/auth/login');
        return;
      }

      // Está autenticado, vamos verificar se tem dados completos
      if (!user) {
        try {
          // Tenta carregar dados do usuário do backend
          const userData = await apiService.getUserByAuthId(authUser.id);
          if (userData) {
            setUser(userData);
            setOnboardingComplete(true);
            
            // Tenta carregar o plano também
            try {
              const planData = await apiService.getPlanByUserId(userData.id);
              if (planData?.plan) {
                setPlan(planData.plan);
                // Tem usuário e plano, vai para home
                router.replace('/(tabs)');
                return;
              }
            } catch (error) {
              console.log('No plan found, will need to create one');
            }
            
            // Tem usuário mas não tem plano, vai para geração de plano
            router.replace('/generating-plan');
            return;
          } else {
            // Usuário autenticado mas sem dados no backend, vai para onboarding
            router.replace('/onboarding');
            return;
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Erro ao carregar dados, vai para onboarding
          router.replace('/onboarding');
          return;
        }
      }

      // Já tem usuário carregado, verifica se tem plano
      if (!plan) {
        try {
          const planData = await apiService.getPlanByUserId(user.id);
          if (planData?.plan) {
            setPlan(planData.plan);
            router.replace('/(tabs)');
          } else {
            router.replace('/generating-plan');
          }
        } catch (error) {
          console.log('No plan found, will need to create one');
          router.replace('/generating-plan');
        }
      } else {
        // Tem usuário e plano, vai para home
        router.replace('/(tabs)');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, authUser, user, plan]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ActivityIndicator size="large" color={ProRunnerColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProRunnerColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 