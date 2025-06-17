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
  const { user, plan, setUser, setPlan, setOnboardingComplete } = useUserStore();
  const { isAuthenticated, user: authUser, initialize } = useAuthStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const initializeApp = async () => {
      // Evita múltiplas execuções
      if (hasInitialized) return;
      
      // Aguarda autenticação estar definida
      if (isAuthenticated === null) return;
      
      if (!isAuthenticated || !authUser) {
        setHasInitialized(true);
        router.replace('/auth/login');
        return;
      }

      setHasInitialized(true);

      try {
        console.log('🔄 Inicializando app...');
        
        // Se já tem usuário e plano em cache, vai direto para dashboard
        if (user && plan) {
          console.log('✅ Cache found - going to dashboard');
          router.replace('/(tabs)');
          return;
        }

        // Carrega dados do usuário do backend
        console.log('📡 Loading user data...');
        const userData = await apiService.getUserByAuthId(authUser.id);
        
        if (!userData) {
          console.log('👤 No user found - going to onboarding');
          router.replace('/onboarding');
          return;
        }

        setUser(userData);
        setOnboardingComplete(true);
        
        // Se já tem plano em cache, vai para dashboard
        if (plan) {
          console.log('✅ User loaded, plan in cache - going to dashboard');
          router.replace('/(tabs)');
          return;
        }

        // Carrega plano do backend
        console.log('📋 Loading plan data...');
        try {
          const planData = await apiService.getPlanByUserId(userData.id);
          if (planData?.plan) {
            console.log('✅ Plan loaded - going to dashboard');
            setPlan(planData.plan);
            router.replace('/(tabs)');
          } else {
            console.log('📝 No plan found - going to plan generation');
            router.replace('/generating-plan');
          }
        } catch {
          console.log('📝 Plan fetch error - going to plan generation');
          router.replace('/generating-plan');
        }
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        router.replace('/onboarding');
      }
    };

    initializeApp();
  }, [isAuthenticated, authUser, hasInitialized, user, plan, router, setUser, setPlan, setOnboardingComplete]);

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