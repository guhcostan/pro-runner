import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { translateFitnessLevel, getGoalDisplayName } from '../../lib/utils';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, plan, clearData, setPlan } = useUserStore();
  const { signOut } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.noDataContainer}>
          <ActivityIndicator size="large" color={ProRunnerColors.primary} />
          <Text style={styles.noDataText}>
            {isLoggingOut ? 'Saindo...' : 'Carregando...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair? Você pode fazer login novamente depois.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'default',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              // Faz logout do Supabase Auth
              await signOut();
              // Limpa dados locais
              clearData();
              // Redireciona diretamente para login
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error during logout:', error);
              setIsLoggingOut(false);
              Alert.alert('Erro', 'Erro ao fazer logout. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const handleResetPlan = () => {
    Alert.alert(
      'Redefinir Plano',
      'Deseja criar um novo plano de treino? Você passará pelo processo de configuração novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Redefinir',
          style: 'default',
          onPress: () => {
            // Limpa apenas o plano, mantém dados do usuário
            setPlan(null);
            // Redireciona para onboarding indicando que é uma redefinição
            router.replace('/onboarding?redefining=true');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color={ProRunnerColors.textPrimary} />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.subtitle}>Corredor ProRunner</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          
          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Altura:</Text>
              <Text style={styles.dataValue}>{user.height || 175} cm</Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Peso:</Text>
              <Text style={styles.dataValue}>{user.weight || 70} kg</Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>RP 5km:</Text>
              <Text style={styles.dataValue}>{user.personal_record_5k || '25:30'}</Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Objetivo:</Text>
              <Text style={[styles.dataValue, styles.goalValue]}>
                {user.goal ? getGoalDisplayName(user.goal) : 'Melhorar Tempo'}
              </Text>
            </View>
          </View>
        </View>

        {plan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plano Atual</Text>
            
            <View style={styles.dataCard}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Criado em:</Text>
                <Text style={styles.dataValue}>
                  {new Date(plan.created_at).toLocaleDateString()}
                </Text>
              </View>
              
                          <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Nível:</Text>
              <Text style={styles.dataValue}>{translateFitnessLevel(plan.fitness_level)}</Text>
            </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Pace Base:</Text>
                <Text style={styles.dataValue}>{plan.base_pace}/km</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Duração:</Text>
                <Text style={styles.dataValue}>{plan.total_weeks} semanas</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <Button
            title="🚪 Sair da Conta"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
          
          <Button
            title="🔄 Redefinir Plano"
            onPress={handleResetPlan}
            variant="outline"
            style={styles.resetButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ProRunner v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Sua jornada de corrida personalizada
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProRunnerColors.background,
  },
  scrollView: {
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: ProRunnerColors.textSecondary,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ProRunnerColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: ProRunnerColors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  dataCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ProRunnerColors.border,
  },
  dataLabel: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 16,
    color: ProRunnerColors.textPrimary,
    fontWeight: '600',
  },
  goalValue: {
    textTransform: 'capitalize',
    color: ProRunnerColors.primary,
  },
  logoutButton: {
    borderColor: ProRunnerColors.primary,
    marginBottom: 12,
  },
  resetButton: {
    borderColor: ProRunnerColors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    color: ProRunnerColors.textMuted,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: ProRunnerColors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
}); 