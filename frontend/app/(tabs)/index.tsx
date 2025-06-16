import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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



  const getNextWorkout = () => {
    const workouts = [
      { type: 'regenerativo', distance: '5km', emoji: '🌱' },
      { type: 'tempo', distance: '8km', emoji: '🔥' },
      { type: 'longao', distance: '12km', emoji: '🏃‍♂️' },
      { type: 'tiros', distance: '6km', emoji: '⚡' },
    ];
    
    return workouts[completedWorkouts % workouts.length];
  };

  const nextWorkout = getNextWorkout();
  const weeklyFrequency = 3; // Default 3x per week - will be replaced by user's plan frequency
  const weekProgress = (completedWorkouts / weeklyFrequency) * 100;

  const handleStartWorkout = () => {
    setCompletedWorkouts(prev => Math.min(prev + 1, weeklyFrequency));
    Alert.alert('Parabéns! 🎉', 'Treino registrado com sucesso!');
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
          <View style={styles.heroImage}>
            <Text style={styles.heroEmoji}>🏃‍♂️</Text>
            <Text style={styles.heroText}>Sua jornada começa aqui</Text>
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



        {/* Week Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Resumo da Semana</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                {completedWorkouts} de {weeklyFrequency} treinos
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(weekProgress)}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${weekProgress}%` }]} />
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedWorkouts}</Text>
                <Text style={styles.statLabel}>Concluídos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weeklyFrequency - completedWorkouts}</Text>
                <Text style={styles.statLabel}>Restantes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weeklyFrequency}</Text>
                <Text style={styles.statLabel}>Meta</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Next Workout */}
        {completedWorkouts < weeklyFrequency && (
          <View style={styles.nextWorkoutSection}>
            <Text style={styles.sectionTitle}>Próximo Treino</Text>
            
            <View style={styles.workoutCard}>
              <View style={styles.workoutIcon}>
                <Text style={styles.workoutEmoji}>{nextWorkout.emoji}</Text>
              </View>
              
              <Text style={styles.workoutTitle}>
                {nextWorkout.type.charAt(0).toUpperCase() + nextWorkout.type.slice(1)}
              </Text>
              <Text style={styles.workoutDistance}>
                {nextWorkout.distance}
              </Text>
              
              <Button
                title="🏃‍♂️ Começar Treino"
                onPress={handleStartWorkout}
                style={styles.startButton}
              />
            </View>
          </View>
        )}

        {/* Week Completed */}
        {completedWorkouts >= weeklyFrequency && (
          <View style={styles.completedSection}>
            <View style={styles.workoutIcon}>
              <Text style={styles.workoutEmoji}>🏆</Text>
            </View>
            <Text style={styles.completedTitle}>Parabéns!</Text>
            <Text style={styles.completedSubtitle}>
              Você completou sua meta semanal de {weeklyFrequency} treinos!
            </Text>
            
            <Button
              title="🔄 Nova Semana"
              onPress={handleResetWeek}
              style={styles.resetButton}
            />
          </View>
        )}

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
