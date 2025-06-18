import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProRunnerColors } from '../../constants/Colors';
import { useUserStore } from '../../store/userStore';
import { apiService } from '../../services/api';
import { getGoalDisplayName } from '../../lib/utils';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    user, 
    plan, 
    setPlan
  } = useUserStore();
  
  const [refreshing, setRefreshing] = useState(false);


  const loadPlan = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiService.getPlanByUserId(user.id);
      setPlan(response.plan);
    } catch (error) {
      console.error('Error loading plan:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar seu plano de treino.',
        [
          {
            text: 'Tentar Novamente',
            onPress: () => loadPlan(),
          },
        ]
      );
    }
  }, [user, setPlan]);

  useEffect(() => {
    // Se não tem usuário ou não está autenticado, deixa o app/index.tsx lidar com isso
    if (!user) {
      return;
    }

    if (!plan) {
      loadPlan();
    }
  }, [user, plan, loadPlan]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlan();
    setRefreshing(false);
  };



  // Get current week and today's workout from the plan
  const getCurrentWorkout = () => {
    if (!plan || !plan.weeks || plan.weeks.length === 0) {
      return null;
    }

    // Find current week (first incomplete week)
    const currentWeek = plan.weeks.find(week => 
      week.workouts.some(workout => !workout.completed)
    );

    if (!currentWeek) {
      return null;
    }

    // Find next uncompleted workout
    const nextWorkout = currentWeek.workouts.find(workout => !workout.completed);
    
    if (!nextWorkout) {
      return null;
    }

    return {
      ...nextWorkout,
      week: currentWeek.week,
      emoji: getWorkoutEmoji(nextWorkout.type)
    };
  };

  const getWorkoutEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      // Novos tipos baseados na metodologia profissional
      'easy': '🟢',
      'interval': '⚡',
      'tempo': '🔥',
      'long': '🏃‍♂️',
      'recovery': '🌱',
      'off': '😴',
      // Tipos antigos (compatibilidade)
      'regenerativo': '🌱',
      'longao': '🏃‍♂️',
      'tiros': '⚡',
      'velocidade': '🚀',
      'intervalado': '⏱️',
      'fartlek': '🎯'
    };
    return emojiMap[type] || '🏃‍♂️';
  };

  // Calculate pace for specific workout types
  const calculateWorkoutPace = (type: string, basePace: string) => {
    if (!basePace) return null;
    
    // Parse base pace (format: "5:30")
    const [minutes, seconds] = basePace.split(':').map(Number);
    const basePaceSeconds = minutes * 60 + seconds;
    
    let adjustment = 0;
    let zone = '';
    
    switch (type) {
      case 'regenerativo':
        adjustment = 60; // +1 minute per km
        zone = 'Zona 1-2 (Recuperação)';
        break;
      case 'tempo':
        adjustment = -20; // -20 seconds per km
        zone = 'Zona 3-4 (Tempo)';
        break;
      case 'tiros':
      case 'velocidade':
        adjustment = -60; // -1 minute per km
        zone = 'Zona 4-5 (VO2 Max)';
        break;
      case 'longao':
        adjustment = 30; // +30 seconds per km
        zone = 'Zona 1-2 (Aeróbico)';
        break;
      case 'intervalado':
        adjustment = -40; // -40 seconds per km
        zone = 'Zona 4 (Limiar)';
        break;
      default:
        adjustment = 0;
        zone = 'Zona 2-3 (Base)';
    }
    
    const targetPaceSeconds = basePaceSeconds + adjustment;
    const targetMinutes = Math.floor(targetPaceSeconds / 60);
    const targetSecondsRemainder = targetPaceSeconds % 60;
    
    return {
      pace: `${targetMinutes}:${targetSecondsRemainder.toString().padStart(2, '0')}`,
      zone
    };
  };

  const currentWorkout = getCurrentWorkout();
  const workoutPaceInfo = currentWorkout && plan?.base_pace ? 
    calculateWorkoutPace(currentWorkout.type, plan.base_pace) : null;

  // Funções auxiliares para a nova estrutura VDOT
  const getWorkoutName = (type: string) => {
    const nameMap: Record<string, string> = {
      'easy': 'Corrida Leve',
      'interval': 'Treino Intervalado', 
      'tempo': 'Treino Tempo',
      'long': 'Corrida Longa',
      'recovery': 'Recuperação',
      // Compatibilidade
      'longao': 'Corrida Longa',
      'tiros': 'Treino Intervalado',
      'regenerativo': 'Recuperação',
    };
    return nameMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getWorkoutZone = (type: string) => {
    const zoneMap: Record<string, string> = {
      'easy': 'Zona Aeróbica',
      'long': 'Zona Aeróbica', 
      'interval': 'Zona VO2 Max',
      'tempo': 'Zona Limiar',
      'recovery': 'Zona Regenerativa',
      // Compatibilidade
      'longao': 'Zona Aeróbica',
      'tiros': 'Zona VO2 Max',
      'regenerativo': 'Zona Regenerativa',
    };
    return zoneMap[type] || 'Zona Base';
  };

  const getWorkoutIntensity = (type: string) => {
    const intensityMap: Record<string, string> = {
      'easy': 'Baixa',
      'long': 'Baixa-Moderada',
      'interval': 'Alta', 
      'tempo': 'Moderada-Alta',
      'recovery': 'Muito Baixa',
      // Compatibilidade
      'longao': 'Baixa-Moderada',
      'tiros': 'Alta',
      'regenerativo': 'Muito Baixa',
    };
    return intensityMap[type] || 'Moderada';
  };

  const calculateEstimatedDuration = (workout: any) => {
    // Nova estrutura VDOT
    if (workout.workoutDetails) {
      if (workout.workoutDetails.duration) {
        return workout.workoutDetails.duration;
      }
      
      if (workout.workoutDetails.distance && workout.workoutDetails.pace) {
        const distance = workout.workoutDetails.distance;
        const paceString = workout.workoutDetails.pace;
        const [minutes, seconds] = paceString.split(':').map(Number);
        const paceInMinutes = minutes + (seconds / 60);
        return Math.round(distance * paceInMinutes);
      }
      
      if (workout.workoutDetails.intervals) {
        const intervals = workout.workoutDetails.intervals;
        const intervalDuration = workout.workoutDetails.intervalDuration;
        const recoveryTime = workout.workoutDetails.recoveryTime || 2;
        
        const totalIntervalTime = intervals * intervalDuration;
        const totalRecoveryTime = (intervals - 1) * recoveryTime;
        return 15 + totalIntervalTime + totalRecoveryTime; // 15min = aquec + desaq
      }
    }
    
    // Fallback para estrutura antiga
    const distance = workout.distance || 0;
    return Math.round(distance * 6); // 6 min/km estimado
  };

  // Calculate progress based on current week
  const getCurrentWeekProgress = () => {
    if (!plan || !plan.weeks || plan.weeks.length === 0) {
      return { completed: 0, total: 3, percentage: 0 };
    }

    const currentWeek = plan.weeks.find(week => 
      week.workouts.some(workout => !workout.completed)
    );

    if (!currentWeek) {
      return { completed: plan.weeks[0]?.workouts.length || 3, total: plan.weeks[0]?.workouts.length || 3, percentage: 100 };
    }

    const completedCount = currentWeek.workouts.filter(w => w.completed).length;
    const totalCount = currentWeek.workouts.length;
    
    return {
      completed: completedCount,
      total: totalCount,
      percentage: (completedCount / totalCount) * 100
    };
  };

  const weekProgress = getCurrentWeekProgress();



  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando seu plano...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ProRunnerColors.primary}
          />
        }
      >
        {/* Header with Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Olá, {user.name}! 👋</Text>
            <Text style={styles.planInfo}>
              {plan ? `Plano: ${getGoalDisplayName(plan.goal)}` : 'Configurando seu plano...'}
            </Text>
          </View>
        </View>

        {/* Current Workout - Now at the top */}
        {currentWorkout && (
          <View style={styles.nextWorkoutSection}>
            <Text style={styles.sectionTitle}>Próximo Treino</Text>
            
            <View style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutIcon}>
                  <Text style={styles.workoutEmoji}>{currentWorkout.emoji}</Text>
                </View>
                
                <View style={styles.workoutMainInfo}>
                  <Text style={styles.workoutTitle}>
                    {getWorkoutName(currentWorkout.type)}
                  </Text>
                                      <Text style={styles.workoutDistance}>
                     {currentWorkout.workoutDetails ? 
                       (currentWorkout.workoutDetails.distance ? `${currentWorkout.workoutDetails.distance}km` :
                        currentWorkout.workoutDetails.duration ? `${currentWorkout.workoutDetails.duration}min` :
                        currentWorkout.workoutDetails.intervals ? `${currentWorkout.workoutDetails.intervals}x${currentWorkout.workoutDetails.intervalDuration}min` :
                        'Treino') :
                       'Treino'
                     } • {currentWorkout.day}
                  </Text>
                </View>
              </View>
              
              {/* Enhanced Workout Details */}
              <View style={styles.workoutDetailsContainer}>
                <View style={styles.workoutDetailRow}>
                  <View style={styles.workoutDetail}>
                    <Text style={styles.detailLabel}>Pace Alvo</Text>
                    <Text style={styles.detailValue}>
                      {currentWorkout.workoutDetails?.pace || workoutPaceInfo?.pace || '5:12'}/km
                    </Text>
                  </View>
                  <View style={styles.workoutDetail}>
                    <Text style={styles.detailLabel}>Zona</Text>
                    <Text style={styles.detailZone}>
                      {getWorkoutZone(currentWorkout.type)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.workoutDetailRow}>
                  <View style={styles.workoutDetail}>
                    <Text style={styles.detailLabel}>Intensidade</Text>
                    <Text style={styles.detailValue}>
                      {getWorkoutIntensity(currentWorkout.type)}
                    </Text>
                  </View>
                  <View style={styles.workoutDetail}>
                    <Text style={styles.detailLabel}>Duração Est.</Text>
                    <Text style={styles.detailValue}>
                      ~{calculateEstimatedDuration(currentWorkout)} min
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Short Description */}
              {(currentWorkout.workoutDetails?.description || currentWorkout.detailedDescription) && (
                <View style={styles.workoutSummary}>
                  <Text style={styles.summaryText} numberOfLines={2}>
                    {currentWorkout.workoutDetails?.description || currentWorkout.detailedDescription}
                  </Text>
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity 
                style={styles.fullWidthDetailButton}
                onPress={() => {
                  router.push({
                    pathname: '/workout-detail',
                    params: {
                      workout: JSON.stringify(currentWorkout),
                      week: '1',
                      dayName: currentWorkout.day
                    }
                  });
                }}
              >
                <Text style={styles.startButtonText}>📋 Ver Detalhes do Treino</Text>
              </TouchableOpacity>

              {/* Hint about workout details */}
              <View style={styles.workoutDetailHint}>
                <Text style={styles.workoutDetailHintText}>
                  💡 No detalhe do treino você encontra aquecimentos sugeridos, estrutura completa e dicas específicas!
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* No workout available */}
        {!currentWorkout && (
          <View style={styles.noWorkoutSection}>
            <View style={styles.workoutIcon}>
              <Text style={styles.workoutEmoji}>📅</Text>
            </View>
            <Text style={styles.noWorkoutTitle}>Plano em dia!</Text>
            <Text style={styles.noWorkoutSubtitle}>
              Consulte o &ldquo;Plano Completo&rdquo; para ver todos os seus treinos programados.
            </Text>
          </View>
        )}

        {/* Week Overview */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Visão Geral da Semana</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                {weekProgress.total} treinos programados
              </Text>
                              <Text style={styles.progressPercentage}>
                  Semana {(plan?.weeks?.findIndex(week => week.workouts.some(w => !w.completed)) ?? 0) + 1}
                </Text>
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weekProgress.total}</Text>
                <Text style={styles.statLabel}>Treinos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan?.weekly_frequency || 3}</Text>
                <Text style={styles.statLabel}>x/semana</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan?.total_weeks || 8}</Text>
                <Text style={styles.statLabel}>semanas</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => router.push('/(tabs)/today')}
            >
              <Ionicons name="calendar-outline" size={24} color={ProRunnerColors.primary} />
              <Text style={styles.quickAccessText}>Hoje</Text>
              <Text style={styles.quickAccessSubtext}>Treino e clima</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => router.push('/complete-plan')}
            >
              <Ionicons name="list-outline" size={24} color={ProRunnerColors.primary} />
              <Text style={styles.quickAccessText}>Plano</Text>
              <Text style={styles.quickAccessSubtext}>Visão completa</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => router.push('/(tabs)/insights')}
            >
              <Ionicons name="analytics-outline" size={24} color={ProRunnerColors.primary} />
              <Text style={styles.quickAccessText}>Insights</Text>
              <Text style={styles.quickAccessSubtext}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => router.push('/progress')}
            >
              <Ionicons name="trending-up-outline" size={24} color={ProRunnerColors.primary} />
              <Text style={styles.quickAccessText}>Progresso</Text>
              <Text style={styles.quickAccessSubtext}>Evolução</Text>
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: ProRunnerColors.textSecondary,
    fontSize: 16,
  },
  heroSection: {
    backgroundColor: ProRunnerColors.surface,
    margin: 16,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  planInfo: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textTransform: 'capitalize',
  },
  heroImage: {
    alignItems: 'center',
    marginLeft: 16,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 12,
    color: ProRunnerColors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  frequencySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  frequencyCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: ProRunnerColors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyCardActive: {
    backgroundColor: ProRunnerColors.primary + '20',
    borderColor: ProRunnerColors.primary,
  },
  frequencyEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
  },
  frequencyLabelActive: {
    color: ProRunnerColors.primary,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressCard: {
    backgroundColor: ProRunnerColors.surface,
    padding: 20,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: ProRunnerColors.border,
    borderRadius: 4,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: ProRunnerColors.primary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    textTransform: 'uppercase',
  },
  nextWorkoutSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  workoutCard: {
    backgroundColor: ProRunnerColors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  workoutIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ProRunnerColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  workoutEmoji: {
    fontSize: 32,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  workoutDistance: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    marginBottom: 20,
  },
  workoutDetailsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  workoutDetail: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: ProRunnerColors.background,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
  },
  detailZone: {
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.primary,
  },
  workoutDescription: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: ProRunnerColors.background,
    borderRadius: 8,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: ProRunnerColors.textPrimary,
    lineHeight: 20,
  },
  startButton: {
    flex: 1,
    backgroundColor: ProRunnerColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ProRunnerColors.primary,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    width: '100%',
    backgroundColor: ProRunnerColors.surface,
  },
  spacer: {
    height: 100,
  },
  motivationCard: {
    backgroundColor: `${ProRunnerColors.primary}15`,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${ProRunnerColors.primary}30`,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.primary,
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 16,
    color: ProRunnerColors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  weatherCard: {
    backgroundColor: ProRunnerColors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  weatherLocation: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  weatherContent: {
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ProRunnerColors.primary,
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    marginBottom: 8,
  },
  weatherTip: {
    fontSize: 14,
    color: ProRunnerColors.success,
    fontWeight: '500',
  },
  speedWorkoutHint: {
    backgroundColor: ProRunnerColors.accent + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: ProRunnerColors.accent,
  },
  speedHintText: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    fontStyle: 'italic',
  },
  workoutDetailHint: {
    backgroundColor: ProRunnerColors.primary + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: ProRunnerColors.primary,
  },
  workoutDetailHintText: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // New styles for enhanced workout display
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  workoutMainInfo: {
    flex: 1,
    marginLeft: 16,
  },
  workoutDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutSummary: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: ProRunnerColors.background,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 14,
    color: ProRunnerColors.textPrimary,
    lineHeight: 20,
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  detailButton: {
    flex: 1,
    backgroundColor: ProRunnerColors.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.background,
  },
  fullWidthDetailButton: {
    width: '100%',
    backgroundColor: ProRunnerColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  noWorkoutSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  noWorkoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  noWorkoutSubtitle: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  quickAccessSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '47%',
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  quickAccessSubtext: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
