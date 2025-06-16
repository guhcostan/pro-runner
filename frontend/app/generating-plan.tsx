import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProRunnerColors } from '../constants/Colors';
import { useUserStore } from '../store/userStore';
import { apiService } from '../services/api';

export default function GeneratingPlanScreen() {
  const router = useRouter();
  const { user, setPlan, isCreatingPlan, setCreatingPlan } = useUserStore();

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    if (!user) {
      Alert.alert('Erro', 'Dados do usuário não encontrados.');
      router.replace('/onboarding');
      return;
    }

    setCreatingPlan(true);

    try {
      const response = await apiService.createPlan({ userId: user.id });
      setPlan(response.plan);
      
      // Small delay for better UX
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating plan:', error);
      
      let errorMessage = 'Não foi possível gerar seu plano de treino.';
      
      if (error.response?.status === 409) {
        // Plan already exists, try to fetch it
        try {
          const existingPlan = await apiService.getPlanByUserId(user.id);
          setPlan(existingPlan.plan);
          router.replace('/(tabs)');
          return;
        } catch (fetchError) {
          errorMessage = 'Erro ao carregar plano existente.';
        }
      } else if (error.response?.data?.message) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ProRunnerColors.primary} />
          
          <Text style={styles.title}>Gerando seu plano personalizado</Text>
          
          <View style={styles.steps}>
            <Text style={styles.step}>🏃‍♂️ Analisando seu perfil...</Text>
            <Text style={styles.step}>📊 Calculando volumes de treino...</Text>
            <Text style={styles.step}>🎯 Criando programa de 8 semanas...</Text>
            <Text style={styles.step}>⚡ Distribuindo intensidades...</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Isso pode levar alguns segundos
          </Text>
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
  loadingContainer: {
    alignItems: 'center',
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