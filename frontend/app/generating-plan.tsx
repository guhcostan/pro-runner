import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProRunnerColors } from '../constants/Colors';
import { useUserStore } from '../store/userStore';
import { apiService } from '../services/api';

export default function GeneratingPlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, setPlan, setCreatingPlan } = useUserStore();
  
  // Verifica se é uma redefinição de plano
  const isRedefining = params?.redefining === 'true';

  useEffect(() => {
    generatePlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePlan = async () => {
    if (!user) {
      Alert.alert('Erro', 'Dados do usuário não encontrados.');
      router.replace('/onboarding');
      return;
    }

    setCreatingPlan(true);

    try {
      // Se está redefinindo, usa force=true para deletar plano existente
      const response = await apiService.createPlan({ 
        userId: user.id, 
        force: isRedefining 
      });
      setPlan(response.plan);
      
      // Small delay for better UX
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating plan:', error);
      
      if (error.response?.status === 409) {
        // Plan already exists, try to fetch it
        console.log('Plan already exists, loading existing plan...');
        try {
          const existingPlan = await apiService.getPlanByUserId(user.id);
          setPlan(existingPlan.plan);
          
          // Small delay for better UX, then navigate
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1000);
          return;
        } catch (fetchError) {
          console.error('Error fetching existing plan:', fetchError);
          Alert.alert(
            'Erro',
            'Erro ao carregar plano existente. Tente novamente.',
            [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
          );
          return;
        }
      }
      
      // Other errors
      let errorMessage = 'Não foi possível gerar seu plano de treino.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert(
        'Erro na Geração do Plano',
        errorMessage,
        [
          {
            text: 'Tentar Novamente',
            onPress: generatePlan,
          },
          {
            text: 'Voltar',
            onPress: () => router.replace('/onboarding'),
            style: 'cancel',
          },
        ]
      );
    } finally {
      setCreatingPlan(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <ActivityIndicator 
          size="large" 
          color={ProRunnerColors.primary} 
          style={styles.loader} 
        />
        
        <Text style={styles.title}>
          {isRedefining ? '🔄 Redefinindo Plano' : '🚀 Gerando seu Plano'}
        </Text>
        
        <Text style={styles.subtitle}>
          {isRedefining 
            ? 'Criando um novo plano com suas configurações atualizadas...' 
            : 'Estamos criando o plano de treino perfeito para você...'
          }
        </Text>
        
        <View style={styles.steps}>
          <Text style={styles.step}>✅ Analisando seus dados</Text>
          <Text style={styles.step}>🏃‍♂️ Calculando intensidades</Text>
          <Text style={styles.step}>📅 Organizando treinos</Text>
          <Text style={styles.step}>🎯 Finalizando plano</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProRunnerColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loader: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  steps: {
    marginBottom: 32,
  },
  step: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: ProRunnerColors.textMuted,
    textAlign: 'center',
  },
}); 