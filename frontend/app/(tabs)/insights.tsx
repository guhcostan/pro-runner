import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProRunnerColors } from '../../constants/Colors';
import { useUserStore } from '../../store/userStore';

export default function InsightsScreen() {
  const router = useRouter();
  const { user, plan } = useUserStore();

  const getGoalDisplayName = (goal: string) => {
    const goalNames: Record<string, string> = {
      'start_running': 'Começar a Correr',
      'run_5k': 'Correr 5km',
      'run_10k': 'Correr 10km',
      'half_marathon': 'Meia Maratona',
      'marathon': 'Maratona',
      'improve_time': 'Melhorar Tempo',
    };
    return goalNames[goal] || goal;
  };

  const translateFitnessLevel = (level: string) => {
    const levels: Record<string, string> = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado',
    };
    return levels[level] || level;
  };

  if (!user || !plan) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Nenhum plano encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats
  const totalWorkouts = plan.weeks.reduce((total, week) => total + week.workouts.length, 0);
  const completedWorkouts = plan.weeks.reduce((total, week) =>
    total + week.workouts.filter(w => w.completed).length, 0
  );

  const totalKm = plan.weeks.reduce((total, week) => total + week.volume, 0);
  const completedKm = plan.weeks.reduce((total, week) =>
    total + week.workouts
      .filter(w => w.completed)
      .reduce((sum, w) => sum + (w.workoutDetails?.distance || 0), 0), 0
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Analytics e progressão do seu plano</Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="fitness" size={32} color={ProRunnerColors.primary} />
            <Text style={styles.statNumber}>{completedWorkouts}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
            <Text style={styles.statTotal}>de {totalWorkouts} planejados</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="location" size={32} color={ProRunnerColors.success} />
            <Text style={styles.statNumber}>{Math.round(completedKm)}</Text>
            <Text style={styles.statLabel}>Quilômetros</Text>
            <Text style={styles.statTotal}>de {totalKm}km planejados</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={32} color={ProRunnerColors.warning} />
            <Text style={styles.statNumber}>{plan.total_weeks}</Text>
            <Text style={styles.statLabel}>Semanas</Text>
            <Text style={styles.statTotal}>de treinamento</Text>
          </View>
        </View>

        {/* Plan Overview */}
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

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Frequência Semanal:</Text>
            <Text style={styles.infoValue}>{plan.weekly_frequency}x por semana</Text>
          </View>

          {plan.vdot && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>VDOT:</Text>
              <Text style={styles.infoValue}>{Math.round(plan.vdot)}</Text>
            </View>
          )}
        </View>

        {/* Training Paces */}
        {plan.training_paces && (
          <View style={styles.pacesContainer}>
            <Text style={styles.pacesTitle}>🎯 Paces de Treino (VDOT)</Text>
            
            <View style={styles.paceCard}>
              <View style={styles.paceHeader}>
                <Text style={styles.paceEmoji}>😌</Text>
                <Text style={styles.paceName}>Fácil (Easy)</Text>
              </View>
              <Text style={styles.paceValue}>{plan.training_paces.easy}/km</Text>
              <Text style={styles.paceDescription}>Zona 1-2 • Recuperação ativa</Text>
            </View>

            <View style={styles.paceCard}>
              <View style={styles.paceHeader}>
                <Text style={styles.paceEmoji}>🏃‍♂️</Text>
                <Text style={styles.paceName}>Longão (Long)</Text>
              </View>
              <Text style={styles.paceValue}>{plan.training_paces.long}/km</Text>
              <Text style={styles.paceDescription}>Zona 1-2 • Resistência aeróbica</Text>
            </View>

            <View style={styles.paceCard}>
              <View style={styles.paceHeader}>
                <Text style={styles.paceEmoji}>🎯</Text>
                <Text style={styles.paceName}>Tempo (Threshold)</Text>
              </View>
              <Text style={styles.paceValue}>{plan.training_paces.tempo}/km</Text>
              <Text style={styles.paceDescription}>Zona 3-4 • Limiar anaeróbico</Text>
            </View>

            <View style={styles.paceCard}>
              <View style={styles.paceHeader}>
                <Text style={styles.paceEmoji}>⚡</Text>
                <Text style={styles.paceName}>Tiros (Interval)</Text>
              </View>
              <Text style={styles.paceValue}>{plan.training_paces.interval}/km</Text>
              <Text style={styles.paceDescription}>Zona 4-5 • VO2 máximo</Text>
            </View>

            <View style={styles.paceCard}>
              <View style={styles.paceHeader}>
                <Text style={styles.paceEmoji}>🌱</Text>
                <Text style={styles.paceName}>Recuperação</Text>
              </View>
              <Text style={styles.paceValue}>{plan.training_paces.recovery}/km</Text>
              <Text style={styles.paceDescription}>Zona 1 • Recuperação total</Text>
            </View>
          </View>
        )}

        {/* Pace Insights */}
        <View style={styles.paceInsightsContainer}>
          <Text style={styles.paceInsightsTitle}>🎯 Pace Insights</Text>
          <Text style={styles.paceInsightsSubtitle}>
            Estimativas baseadas no seu VDOT atual de {Math.round(plan.vdot || 0)}
          </Text>
          
          <View style={styles.monitoringCard}>
            <Text style={styles.monitoringTitle}>Próximo Foco</Text>
            <Text style={styles.monitoringText}>
              Próximo treino de qualidade em {new Date().getDate() + 2} de {new Date().toLocaleDateString('pt-BR', { month: 'short' })}.
              {plan.goal === 'run_5k' && ' Foque nos intervalos para melhorar o VO2max.'}
              {plan.goal === 'run_10k' && ' Trabalhe o tempo para desenvolver o limiar anaeróbico.'}
              {plan.goal === 'half_marathon' && ' Priorize os longões para construir resistência.'}
              {plan.goal === 'marathon' && ' Mantenha volume constante e ritmo controlado.'}
            </Text>
          </View>

          {/* Time Estimation */}
          <View style={styles.timeEstimationCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeTitle}>
                TEMPO ESTIMADO {getGoalDisplayName(plan.goal).toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Estimativa de Tempo',
                  'Este tempo é calculado baseado no seu VDOT atual e progressão esperada. Pode variar conforme seu progresso no treino.',
                  [{ text: 'Entendi' }]
                );
              }}>
                <Text style={styles.timeInfo}>ⓘ</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.timeSubtitle}>Ao final do plano de {plan.total_weeks} semanas</Text>
            
            <View style={styles.timeDisplay}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>
                  {plan.goal === 'marathon' ? '42K' :
                   plan.goal === 'half_marathon' ? '21K' : 
                   plan.goal === 'run_10k' ? '10K' :
                   '5K'}
                </Text>
              </View>
              <Text style={styles.timeRange}>
                {plan.progression_data?.final.estimatedTimes[
                  plan.goal === 'marathon' ? 'marathon' :
                  plan.goal === 'half_marathon' ? 'half' : 
                  plan.goal === 'run_10k' ? '10k' :
                  '5k'
                ] || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progression Expected */}
        {plan.progression_data && (
          <View style={styles.progressionContainer}>
            <Text style={styles.progressionTitle}>📈 Progressão Esperada</Text>
            <Text style={styles.progressionSubtitle}>
              O que você pode esperar ao final do plano:
            </Text>
            
            <View style={styles.progressionCards}>
              <View style={styles.progressionCard}>
                <Text style={styles.progressionCardTitle}>⏱️ Pace 5K</Text>
                <Text style={styles.currentValue}>{plan.progression_data.current.pace5k}/km</Text>
                <Ionicons name="arrow-down" size={16} color={ProRunnerColors.primary} />
                <Text style={styles.finalValue}>{plan.progression_data.final.pace5k}/km</Text>
                <Text style={styles.improvementText}>
                  {plan.progression_data.improvements.percentageImprovement}% mais rápido
                </Text>
              </View>

              <View style={styles.progressionCard}>
                <Text style={styles.progressionCardTitle}>💪 VDOT</Text>
                <Text style={styles.currentValue}>{plan.progression_data.current.vdot}</Text>
                <Ionicons name="arrow-up" size={16} color={ProRunnerColors.primary} />
                <Text style={styles.finalValue}>{plan.progression_data.final.vdot}</Text>
                <Text style={styles.improvementText}>
                  +{plan.progression_data.improvements.vdot} pontos
                </Text>
              </View>

              <View style={styles.progressionCard}>
                <Text style={styles.progressionCardTitle}>🏃‍♂️ Longão</Text>
                <Text style={styles.currentValue}>{plan.progression_data.current.maxLongRun}km</Text>
                <Ionicons name="arrow-up" size={16} color={ProRunnerColors.primary} />
                <Text style={styles.finalValue}>{plan.progression_data.final.maxLongRun}km</Text>
                <Text style={styles.improvementText}>
                  +{plan.progression_data.improvements.maxLongRun}km
                </Text>
              </View>

              <View style={styles.progressionCard}>
                <Text style={styles.progressionCardTitle}>📊 Volume</Text>
                <Text style={styles.currentValue}>{plan.progression_data.current.weeklyVolume}km</Text>
                <Ionicons name="arrow-up" size={16} color={ProRunnerColors.primary} />
                <Text style={styles.finalValue}>{plan.progression_data.final.weeklyVolume}km</Text>
                <Text style={styles.improvementText}>
                  +{plan.progression_data.improvements.weeklyVolume}km/semana
                </Text>
              </View>
            </View>

            {/* Time Projections */}
            <View style={styles.timeProjections}>
              <Text style={styles.timeProjectionsTitle}>🎯 Tempos Estimados no Final:</Text>
              <View style={styles.timeGrid}>
                <View style={styles.timeCard}>
                  <Text style={styles.timeDistance}>5K</Text>
                  <Text style={styles.timeValue}>{plan.progression_data.final.estimatedTimes['5k']}</Text>
                </View>
                <View style={styles.timeCard}>
                  <Text style={styles.timeDistance}>10K</Text>
                  <Text style={styles.timeValue}>{plan.progression_data.final.estimatedTimes['10k']}</Text>
                </View>
                <View style={styles.timeCard}>
                  <Text style={styles.timeDistance}>21K</Text>
                  <Text style={styles.timeValue}>{plan.progression_data.final.estimatedTimes['half']}</Text>
                </View>
                <View style={styles.timeCard}>
                  <Text style={styles.timeDistance}>42K</Text>
                  <Text style={styles.timeValue}>{plan.progression_data.final.estimatedTimes['marathon']}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/progress')}
          >
            <Ionicons name="stats-chart" size={24} color={ProRunnerColors.primary} />
            <Text style={styles.actionText}>Ver Progresso Detalhado</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/complete-plan')}
          >
            <Ionicons name="calendar" size={24} color={ProRunnerColors.primary} />
            <Text style={styles.actionText}>Plano Completo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Análise VDOT',
                `Seu VDOT atual é ${Math.round(plan.vdot || 0)}, indicando um nível ${translateFitnessLevel(plan.fitness_level).toLowerCase()} de condicionamento aeróbico.\n\nCom o plano atual, você pode melhorar para ${plan.progression_data?.final.vdot || 'N/A'} pontos VDOT.`,
                [{ text: 'Entendi' }]
              );
            }}
          >
            <Ionicons name="analytics" size={24} color={ProRunnerColors.primary} />
            <Text style={styles.actionText}>Análise VDOT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
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
    fontSize: 32,
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
    paddingBottom: 32,
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
  pacesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  pacesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  paceCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  paceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paceEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  paceName: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    flex: 1,
  },
  paceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.primary,
    marginBottom: 4,
  },
  paceDescription: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  progressionContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  progressionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  progressionSubtitle: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    marginBottom: 20,
  },
  progressionCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  progressionCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  progressionCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProRunnerColors.textMuted,
    marginBottom: 4,
  },
  finalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProRunnerColors.primary,
    marginTop: 4,
    marginBottom: 8,
  },
  improvementText: {
    fontSize: 12,
    color: ProRunnerColors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  timeProjections: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  timeProjectionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    backgroundColor: ProRunnerColors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '22%',
  },
  timeDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  actionButton: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginLeft: 12,
  },
  spacer: {
    height: 100,
  },
  paceInsightsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  paceInsightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  paceInsightsSubtitle: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    marginBottom: 20,
  },
  monitoringCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  monitoringTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  monitoringText: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    lineHeight: 24,
  },
  timeEstimationCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
  },
  timeInfo: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
  },
  timeSubtitle: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 16,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeBadge: {
    backgroundColor: ProRunnerColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ProRunnerColors.background,
  },
  timeRange: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
  },
}); 