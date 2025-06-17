import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProRunnerColors } from '../../constants/Colors';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';

export default function PlanScreen() {
  const { user, plan } = useUserStore();
  const router = useRouter();

  const planInfo = useMemo(() => {
    if (!plan || !user) return null;

    // Calculate plan details based on goal
    const goalInfo = {
      'start_running': { name: 'Plano Iniciante', distance: '5K', emoji: '🚶‍♂️' },
      'run_5k': { name: 'Plano 5K', distance: '5K', emoji: '🎯' },
      'run_10k': { name: 'Plano 10K', distance: '10K', emoji: '🚀' },
      'half_marathon': { name: 'Plano Meia Maratona', distance: '21K', emoji: '🏃‍♂️' },
      'marathon': { name: 'Plano Maratona', distance: '42K', emoji: '🏆' },
      'improve_time': { name: 'Melhoria de Tempo', distance: '5K', emoji: '⚡' },
    };

    const goal = goalInfo[user.goal as keyof typeof goalInfo] || goalInfo['run_5k'];
    
    // Calculate race date based on plan duration
    const raceDate = new Date(plan.created_at);
    raceDate.setDate(raceDate.getDate() + (plan.total_weeks * 7));

    // Calculate total distance
    const totalDistance = plan.weeks?.reduce((total: number, week: any) => 
      total + (week.volume || 0), 0) || 0;

    return {
      ...goal,
      raceDate,
      totalWeeks: plan.total_weeks,
      totalDistance,
    };
  }, [plan, user]);

  const progressInfo = useMemo(() => {
    if (!plan?.weeks) return { completed: 0, total: plan?.total_weeks || 8, percentage: 0 };

    const completedWeeks = plan.weeks.filter((week: any) => 
      week.workouts?.every((workout: any) => workout.completed)
    ).length;

    return {
      completed: completedWeeks,
      total: plan.total_weeks,
      percentage: Math.round((completedWeeks / plan.total_weeks) * 100),
    };
  }, [plan]);

  const formatRaceDate = (date: Date) => {
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return `${date.getDate()} DE ${months[date.getMonth()]}. DE ${date.getFullYear()}`;
  };

  if (!user || !plan || !planInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Carregando seu plano...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seu Plano</Text>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => {
              Alert.alert(
                'Calendário',
                `📅 Plano criado em: ${new Date(plan.created_at).toLocaleDateString()}\n🎯 Meta da corrida: ${formatRaceDate(planInfo.raceDate)}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Plan Overview Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>{planInfo.name}</Text>
              <Text style={styles.raceDate}>
                Sua corrida: {formatRaceDate(planInfo.raceDate)}
              </Text>
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{planInfo.distance}</Text>
              <Text style={styles.distanceEmoji}>{planInfo.emoji}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              {Array.from({ length: planInfo.totalWeeks }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressSegment,
                    i < progressInfo.completed && styles.progressSegmentCompleted,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Weeks</Text>
              <Text style={styles.statValue}>{planInfo.totalWeeks}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Distance</Text>
              <Text style={styles.statValue}>{planInfo.totalDistance}km</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              router.push('/complete-plan' as any);
            }}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📅</Text>
            </View>
            <Text style={styles.actionText}>Plano Completo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              router.push('/plan-details');
            }}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📋</Text>
            </View>
            <Text style={styles.actionText}>Detalhes do Plano</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Estatísticas do Plano',
                `📊 Progresso Atual: ${progressInfo.completed}/${planInfo.totalWeeks} semanas\n\n🎯 Objetivo: ${planInfo.name}\n📅 Data da Corrida: ${formatRaceDate(planInfo.raceDate)}\n📏 Distância Total: ${planInfo.totalDistance}km`,
                [{ text: 'OK' }]
              );
            }}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📊</Text>
            </View>
            <Text style={styles.actionText}>Estatísticas</Text>
          </TouchableOpacity>
        </View>

        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>PACE INSIGHTS</Text>
            <Text style={styles.insightsPowered}>Powered by ProRunner</Text>
          </View>

          <View style={styles.monitoringCard}>
            <Text style={styles.monitoringTitle}>Monitoring</Text>
            <Text style={styles.monitoringText}>
              Próximo treino de velocidade: {new Date().getDate() + 2} de {new Date().toLocaleDateString('pt-BR', { month: 'short' })}.
            </Text>
          </View>

          {/* Time Estimation */}
          <View style={styles.timeEstimationCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeTitle}>ESTIMATED {planInfo.distance} TIME</Text>
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Estimativa de Tempo',
                  'Este tempo é calculado baseado no seu ritmo atual e nível de condicionamento. Pode variar conforme seu progresso no treino.',
                  [{ text: 'Entendi' }]
                );
              }}>
                <Text style={styles.timeInfo}>ⓘ</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.timeSubtitle}>Em {planInfo.totalWeeks} semanas</Text>
            
            <View style={styles.timeDisplay}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{planInfo.distance}</Text>
              </View>
              <Text style={styles.timeRange}>
                {planInfo.distance === '42K' ? '3:45:00 - 4:15:00' :
                 planInfo.distance === '21K' ? '1:50:00 - 1:57:00' : 
                 planInfo.distance === '10K' ? '45:00 - 52:00' :
                 planInfo.distance === '5K' ? '22:00 - 28:00' : '22:00 - 28:00'}
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ProRunnerColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIcon: {
    fontSize: 20,
  },
  planCard: {
    backgroundColor: ProRunnerColors.cardBackground,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  raceDate: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    fontWeight: '500',
  },
  distanceBadge: {
    backgroundColor: ProRunnerColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  distanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProRunnerColors.background,
    marginBottom: 2,
  },
  distanceEmoji: {
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 3,
  },
  progressSegmentCompleted: {
    backgroundColor: ProRunnerColors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
  },
  actionsContainer: {
    backgroundColor: ProRunnerColors.cardBackground,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    width: '47%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ProRunnerColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
  },
  insightsSection: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginRight: 8,
  },
  insightsPowered: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    flex: 1,
  },
  insightsArrow: {
    padding: 4,
  },
  insightsArrowText: {
    fontSize: 20,
    color: ProRunnerColors.primary,
  },
  monitoringCard: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  monitoringTitle: {
    fontSize: 20,
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
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 20,
    borderRadius: 12,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: ProRunnerColors.textSecondary,
  },
}); 