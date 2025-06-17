import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ProRunnerColors } from '../../constants/Colors';
import { useUserStore } from '../../store/userStore';
import { translateFitnessLevel, getGoalDisplayName } from '../../lib/utils';

export default function ProgressScreen() {
  const { plan } = useUserStore();

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Nenhum plano encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate progress statistics
  const totalWorkouts = plan.weeks.reduce((total, week) => total + week.workouts.length, 0);
  const completedWorkouts = plan.weeks.reduce((total, week) => 
    total + week.workouts.filter(w => w.completed).length, 0
  );
  const completionPercentage = Math.round((completedWorkouts / totalWorkouts) * 100);

  const totalKm = plan.weeks.reduce((total, week) => total + week.volume, 0);
  const completedKm = plan.weeks.reduce((total, week) => 
    total + week.workouts
      .filter(w => w.completed)
      .reduce((km, w) => {
        // Nova estrutura VDOT
        if (w.workoutDetails?.distance) {
          return km + w.workoutDetails.distance;
        }
        // Fallback - estima baseado no tipo de treino
        return km + (w.type === 'long' ? 15 : 8);
      }, 0), 0
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Seu Progresso 📊</Text>
          <Text style={styles.subtitle}>Acompanhe sua evolução</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color={ProRunnerColors.success} />
            <Text style={styles.statNumber}>{completedWorkouts}</Text>
            <Text style={styles.statLabel}>Treinos Concluídos</Text>
            <Text style={styles.statTotal}>de {totalWorkouts} total</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="speedometer" size={32} color={ProRunnerColors.primary} />
            <Text style={styles.statNumber}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Progresso</Text>
            <Text style={styles.statTotal}>do plano completo</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trail-sign" size={32} color={ProRunnerColors.accent} />
            <Text style={styles.statNumber}>{completedKm.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Km Percorridos</Text>
            <Text style={styles.statTotal}>de {totalKm}km planejados</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={32} color={ProRunnerColors.warning} />
            <Text style={styles.statNumber}>{plan.total_weeks}</Text>
            <Text style={styles.statLabel}>Semanas</Text>
            <Text style={styles.statTotal}>de treinamento</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Detalhes do Plano</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Objetivo:</Text>
            <Text style={styles.infoValue}>{getGoalDisplayName(plan.goal)}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Nível de Fitness:</Text>
                          <Text style={styles.infoValue}>{translateFitnessLevel(plan.fitness_level)}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Pace Base:</Text>
            <Text style={styles.infoValue}>{plan.base_pace}/km</Text>
          </View>
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
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
  },
  statTotal: {
    fontSize: 12,
    color: ProRunnerColors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  infoContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: ProRunnerColors.textPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
}); 