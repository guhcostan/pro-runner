import { useEffect, useState } from 'react';
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
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  // Quando usuário é criado no onboarding, verifica se precisa navegar
  useEffect(() => {
    if (isAuthenticated && authUser && user && !plan && !isInitializing) {
      // Usuário foi criado mas sem plano, vai para geração
      router.replace('/generating-plan');
    } else if (isAuthenticated && authUser && user && plan && !isInitializing) {
      // Usuário e plano existem, vai para home
      router.replace('/(tabs)');
    }
  }, [user, plan, isInitializing]);

  useEffect(() => {
    const initializeApp = async () => {
      if (!isAuthenticated || !authUser) {
        setIsInitializing(false);
        router.replace('/auth/login');
        return;
      }

      try {
        // Primeiro tenta carregar dados do usuário
        const userData = await apiService.getUserByAuthId(authUser.id);
        
        if (userData) {
          setUser(userData);
          setOnboardingComplete(true);
          
          // Usuário existe, agora tenta carregar o plano
          try {
            const planData = await apiService.getPlanByUserId(userData.id);
            if (planData?.plan) {
              setPlan(planData.plan);
              setIsInitializing(false);
              router.replace('/(tabs)');
              return;
            }
          } catch (planError) {
            console.log('No plan found for user, will need to create one');
          }
          
          // Tem usuário mas não tem plano
          setIsInitializing(false);
          router.replace('/generating-plan');
          return;
        } else {
          // Não tem dados do usuário, vai para onboarding
          setIsInitializing(false);
          router.replace('/onboarding');
          return;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsInitializing(false);
        router.replace('/onboarding');
      }
    };

    // Só executa quando está autenticado
    if (isAuthenticated !== null && authUser) {
      initializeApp();
    } else if (isAuthenticated === false) {
      setIsInitializing(false);
      router.replace('/auth/login');
    }
  }, [isAuthenticated, authUser]);

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