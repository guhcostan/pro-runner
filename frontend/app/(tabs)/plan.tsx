import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProRunnerColors } from '../../constants/Colors';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import { XPProgressBar } from '../../components/progression/XPProgressBar';
import { TrainingPhaseCard } from '../../components/progression/TrainingPhaseCard';
import { apiService, UserProgress, TrainingPhase, GamifiedStats, AdaptivePlan } from '../../services/api';

export default function PlanScreen() {
  const { user, plan } = useUserStore();
  const router = useRouter();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [gamifiedStats, setGamifiedStats] = useState<GamifiedStats | null>(null);
  const [trainingPhases, setTrainingPhases] = useState<TrainingPhase[]>([]);
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptivePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const loadAdaptiveData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Load all adaptive data in parallel
      const [progressResponse, statsResponse, phasesResponse] = await Promise.all([
        apiService.getUserProgress(user.id),
        apiService.getGamifiedStats(user.id),
        apiService.getTrainingPhases(),
      ]);

      if (progressResponse.success) {
        setUserProgress(progressResponse.data);
      }

      if (statsResponse.success) {
        setGamifiedStats(statsResponse.data);
      }

      if (phasesResponse.success) {
        setTrainingPhases(phasesResponse.data);
      }
    } catch (error) {
      console.error('Error loading adaptive data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAdaptiveData();
  }, [loadAdaptiveData]);

  const generateNewAdaptivePlan = async () => {
    if (!user?.id) return;

    try {
      setIsGeneratingPlan(true);
      
      const response = await apiService.generateAdaptivePlan(user.id, {
        preferences: {
          workoutsPerWeek: 3,
          preferredDays: ['monday', 'wednesday', 'friday'],
        }
      });

      if (response.success) {
        setAdaptivePlan(response.data);
        Alert.alert(
          'Plano Gerado!',
          response.data.message || 'Seu novo plano adaptativo foi gerado com sucesso!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error generating adaptive plan:', error);
      Alert.alert('Erro', 'Não foi possível gerar um novo plano. Tente novamente.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleAdvancePhase = async () => {
    if (!user?.id || !gamifiedStats?.phaseAdvancement.nextPhase) return;

    Alert.alert(
      'Avançar para Próxima Fase',
      `Tem certeza que deseja avançar para a fase ${gamifiedStats.phaseAdvancement.nextPhase.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Avançar',
          style: 'default',
          onPress: async () => {
            try {
              const response = await apiService.advanceToNextPhase(
                user.id,
                gamifiedStats.phaseAdvancement.nextPhase!.id
              );
              
              if (response.success) {
                Alert.alert('Sucesso!', response.message);
                loadAdaptiveData(); // Reload data
              }
            } catch (error) {
              console.error('Error advancing phase:', error);
              Alert.alert('Erro', 'Não foi possível avançar de fase. Tente novamente.');
            }
          },
        },
      ]
    );
  };

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

  // progressInfo removed as it was unused in the adaptive system

  const formatRaceDate = (date: Date) => {
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return `${date.getDate()} DE ${months[date.getMonth()]}. DE ${date.getFullYear()}`;
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={ProRunnerColors.primary} />
          <Text style={styles.emptyStateText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={ProRunnerColors.primary} />
          <Text style={styles.emptyStateText}>Carregando sistema adaptativo...</Text>
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
          <Text style={styles.headerTitle}>Plano Adaptativo</Text>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => {
              Alert.alert(
                'Sistema Adaptativo',
                `🎯 Treino contínuo baseado na sua progressão\n📈 Planos que evoluem com você`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.calendarIcon}>🎯</Text>
          </TouchableOpacity>
        </View>

        {/* XP Progress Bar */}
        {userProgress && (
          <View style={styles.sectionContainer}>
            <XPProgressBar
              currentXP={userProgress.currentXP}
              xpToNextLevel={userProgress.xpToNextLevel}
              currentLevel={userProgress.currentLevel}
              totalXPEarned={userProgress.totalXPEarned}
            />
          </View>
        )}

        {/* Training Phase Card */}
        {gamifiedStats && trainingPhases.length > 0 && (
          <View style={styles.sectionContainer}>
            <TrainingPhaseCard
              currentPhase={trainingPhases.find(p => p.name === userProgress?.currentPhase) || trainingPhases[0]}
              canAdvance={gamifiedStats.phaseAdvancement.canAdvance}
              nextPhase={gamifiedStats.phaseAdvancement.nextPhase}
              missingCriteria={gamifiedStats.phaseAdvancement.missingCriteria}
              onAdvancePress={handleAdvancePhase}
            />
          </View>
        )}

        {/* Legacy Plan Overview (if exists) */}
        {plan && planInfo && (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{planInfo.name}</Text>
                <Text style={styles.raceDate}>
                  Plano Legado: {formatRaceDate(planInfo.raceDate)}
                </Text>
              </View>
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{planInfo.distance}</Text>
                <Text style={styles.distanceEmoji}>{planInfo.emoji}</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Semanas</Text>
                <Text style={styles.statValue}>{planInfo.totalWeeks}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Distância</Text>
                <Text style={styles.statValue}>{planInfo.totalDistance}km</Text>
              </View>
            </View>
          </View>
        )}

        {/* Adaptive Plan Section */}
        {adaptivePlan && (
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>🤖 Plano Adaptativo Ativo</Text>
            <Text style={styles.raceDate}>{adaptivePlan.message}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Treinos</Text>
                <Text style={styles.statValue}>{adaptivePlan.workouts.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Fase</Text>
                <Text style={styles.statValue}>{userProgress?.currentPhase || 'N/A'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={generateNewAdaptivePlan}
            disabled={isGeneratingPlan}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>
                {isGeneratingPlan ? '⏳' : '🤖'}
              </Text>
            </View>
            <Text style={styles.actionText}>
              {isGeneratingPlan ? 'Gerando...' : 'Gerar Plano Adaptativo'}
            </Text>
          </TouchableOpacity>

          {plan && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                router.push('/complete-plan' as any);
              }}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📅</Text>
              </View>
              <Text style={styles.actionText}>Plano Legado</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              router.push('/plan-details');
            }}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📋</Text>
            </View>
            <Text style={styles.actionText}>Detalhes</Text>
          </TouchableOpacity>
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

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: ProRunnerColors.textSecondary,
  },
  sectionContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
}); 