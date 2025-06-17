import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/userStore';
import { apiService } from '../../services/api';
import { t, getCurrentLanguage } from '../../constants/i18n';
import { locationService, LocationData, WeatherData } from '../../services/location';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    user, 
    plan, 
    isOnboardingComplete, 
    setPlan, 
    updateWorkoutProgress 
  } = useUserStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [completedWorkouts, setCompletedWorkouts] = useState(0);
  const [dailyQuote, setDailyQuote] = useState<string>('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    // Se não tem usuário ou não está autenticado, deixa o app/index.tsx lidar com isso
    if (!user) {
      return;
    }

    if (!plan) {
      loadPlan();
    }
    
    // Load initial data
    loadDailyQuote();
    loadLocationAndWeather();
  }, [user, plan]);

  const loadPlan = async () => {
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
            onPress: loadPlan,
          },
        ]
      );
    }
  };

  const loadDailyQuote = async () => {
    try {
      const response = await apiService.getDailyQuote(getCurrentLanguage());
      setDailyQuote(response.data.quote);
    } catch (error) {
      console.error('Error loading daily quote:', error);
      setDailyQuote(t('motivational_fallback'));
    }
  };

  const loadLocationAndWeather = async () => {
    setLoadingWeather(true);
    try {
      const userLocation = await locationService.getCurrentLocation();
      if (userLocation) {
        setLocation(userLocation);
        const weatherData = await locationService.getWeatherData(userLocation);
        setWeather(weatherData);
      }
    } catch (error) {
      console.error('Error loading location/weather:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadPlan(),
      loadDailyQuote(),
      loadLocationAndWeather()
    ]);
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
      'regenerativo': '🌱',
      'tempo': '🔥',
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

  const handleStartWorkout = () => {
    if (currentWorkout) {
      // Mark current workout as completed
      // This would normally update the plan via API
      setCompletedWorkouts(prev => Math.min(prev + 1, weekProgress.total));
      Alert.alert('Parabéns! 🎉', 'Treino registrado com sucesso!');
    }
  };

  const handleResetWeek = () => {
    setCompletedWorkouts(0);
    Alert.alert('Semana resetada', 'Contadores reiniciados!');
  };

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
              {plan ? `Plano: ${plan.goal.replace(/_/g, ' ')}` : 'Configurando seu plano...'}
            </Text>
          </View>
        </View>

        {/* Current Workout - Now at the top */}
        {currentWorkout && (
          <View style={styles.nextWorkoutSection}>
            <Text style={styles.sectionTitle}>Próximo Treino</Text>
            
            <View style={styles.workoutCard}>
              <View style={styles.workoutIcon}>
                <Text style={styles.workoutEmoji}>{currentWorkout.emoji}</Text>
              </View>
              
              <Text style={styles.workoutTitle}>
                {currentWorkout.title || currentWorkout.type.charAt(0).toUpperCase() + currentWorkout.type.slice(1)}
              </Text>
              <Text style={styles.workoutDistance}>
                {currentWorkout.distance}km • {currentWorkout.day}
              </Text>
              
              {/* Workout Details */}
              <View style={styles.workoutDetailsContainer}>
                {workoutPaceInfo && (
                  <View style={styles.workoutDetail}>
                    <Text style={styles.detailLabel}>Pace Alvo:</Text>
                    <Text style={styles.detailValue}>{workoutPaceInfo.pace}/km</Text>
                  </View>
                )}
                
                {workoutPaceInfo && (
                  <View style={styles.workoutDetail}>
                    <Text style={styles.detailLabel}>Zona:</Text>
                    <Text style={styles.detailZone}>{workoutPaceInfo.zone}</Text>
                  </View>
                )}
                
                <View style={styles.workoutDetail}>
                  <Text style={styles.detailLabel}>Intensidade:</Text>
                  <Text style={styles.detailValue}>{currentWorkout.intensity}</Text>
                </View>
              </View>
              
              {currentWorkout.description && (
                <View style={styles.workoutDescription}>
                  <Text style={styles.descriptionTitle}>Descrição:</Text>
                  <Text style={styles.descriptionText}>{currentWorkout.description}</Text>
                </View>
              )}
              
              <Button
                title="🏃‍♂️ Começar Treino"
                onPress={handleStartWorkout}
                style={styles.startButton}
              />
            </View>
          </View>
        )}

        {/* Week Completed - Moved up */}
        {!currentWorkout && weekProgress.percentage >= 100 && (
          <View style={styles.completedSection}>
            <View style={styles.workoutIcon}>
              <Text style={styles.workoutEmoji}>🏆</Text>
            </View>
            <Text style={styles.completedTitle}>Parabéns!</Text>
            <Text style={styles.completedSubtitle}>
              Você completou sua meta semanal de {weekProgress.total} treinos!
            </Text>
            
            <Button
              title="🔄 Nova Semana"
              onPress={handleResetWeek}
              style={styles.resetButton}
            />
          </View>
        )}

        {/* Week Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Resumo da Semana</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                {weekProgress.completed} de {weekProgress.total} treinos
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(weekProgress.percentage)}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${weekProgress.percentage}%` as any }]} />
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weekProgress.completed}</Text>
                <Text style={styles.statLabel}>Concluídos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weekProgress.total - weekProgress.completed}</Text>
                <Text style={styles.statLabel}>Restantes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weekProgress.total}</Text>
                <Text style={styles.statLabel}>Meta</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>💫 {t('inspiration_of_day')}</Text>
          <Text style={styles.motivationText}>{dailyQuote || t('loading')}</Text>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Text style={styles.weatherTitle}>{t('weather_today')}</Text>
            <Text style={styles.weatherLocation}>
              {location ? `${location.city}, ${location.country}` : t('loading')}
            </Text>
          </View>
          <View style={styles.weatherContent}>
            <Text style={styles.weatherTemp}>
              {weather ? `${weather.temperature}°C` : '--°C'}
            </Text>
            <Text style={styles.weatherDesc}>
              {weather ? weather.description : t('loading')}
            </Text>
            <Text style={styles.weatherTip}>
              {weather ? weather.runningTip : t('perfect_for_running')}
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: ProRunnerColors.background,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textSecondary,
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
    width: '100%',
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
  motivationText: {
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
});
