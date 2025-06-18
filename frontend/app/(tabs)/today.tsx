import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ProRunnerColors } from '../../constants/Colors';
import { useUserStore } from '../../store/userStore';
import { motivationalQuotes } from '../../constants/Motivational';
import { locationService } from '../../services/location';

export default function TodayScreen() {
  const router = useRouter();
  const { user, plan, updateWorkoutProgress } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);

  const loadDailyQuote = async () => {
    try {
      const today = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem('lastQuoteDate');
      const savedQuote = await AsyncStorage.getItem('dailyQuote');
      
      if (savedDate === today && savedQuote) {
        setDailyQuote(savedQuote);
      } else {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        setDailyQuote(randomQuote);
        await AsyncStorage.setItem('dailyQuote', randomQuote);
        await AsyncStorage.setItem('lastQuoteDate', today);
      }
    } catch (error) {
      console.error('Error loading daily quote:', error);
      setDailyQuote('Cada quilômetro é uma vitória. Continue correndo!');
    }
  };

  const loadLocationAndWeather = async () => {
    try {
      const locationData = await locationService.getCurrentLocation();
      if (locationData) {
        setLocation(locationData);
        const weatherData = await locationService.getWeatherData(locationData);
        setWeather(weatherData);
      }
    } catch (error) {
      console.error('Error loading location/weather:', error);
    }
  };

  useEffect(() => {
    loadDailyQuote();
    loadLocationAndWeather();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDailyQuote(),
      loadLocationAndWeather(),
    ]);
    setRefreshing(false);
  };

  const getCurrentWorkout = () => {
    if (!plan?.weeks) return null;
    
    // First try to find today's workout (regardless of completion status)
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const todayName = dayNames[today];
    
    // Find current week (first week with any incomplete workout)
    let currentWeek = plan.weeks.find(week => 
      week.workouts.some(workout => !workout.completed)
    );
    
    // If no incomplete workouts, get the last week
    if (!currentWeek) {
      currentWeek = plan.weeks[plan.weeks.length - 1];
    }
    
    if (!currentWeek) return null;
    
    // Try to find today's workout first
    let todayWorkout = currentWeek.workouts.find(workout => 
      workout.day === todayName
    );
    
    // If no workout for today, get the next incomplete workout
    if (!todayWorkout) {
      todayWorkout = currentWeek.workouts.find(workout => !workout.completed);
    }
    
    // If still no workout, get the first workout of the week
    if (!todayWorkout) {
      todayWorkout = currentWeek.workouts[0];
    }
    
    if (!todayWorkout) return null;

    return {
      ...todayWorkout,
      week: currentWeek.week,
      workoutIndex: currentWeek.workouts.indexOf(todayWorkout),
      emoji: getWorkoutEmoji(todayWorkout.type)
    };
  };

  const getNextWorkout = () => {
    if (!plan?.weeks) return null;
    
    const currentWeek = plan.weeks.find(week => 
      week.workouts.some(workout => !workout.completed)
    );
    
    if (!currentWeek) return null;
    
    const nextWorkout = currentWeek.workouts.find(workout => !workout.completed);
    if (!nextWorkout) return null;

    return {
      ...nextWorkout,
      week: currentWeek.week,
      workoutIndex: currentWeek.workouts.indexOf(nextWorkout),
      emoji: getWorkoutEmoji(nextWorkout.type)
    };
  };

  const getWorkoutEmoji = (type: string) => {
    switch (type) {
      case 'longoes': return '🏃‍♂️';
      case 'tiros': return '⚡';
      case 'tempo': return '🎯';
      case 'regenerativo': return '🌱';
      case 'easy': return '😌';
      default: return '🏃‍♂️';
    }
  };

  const getWorkoutName = (type: string) => {
    switch (type) {
      case 'longoes': return 'Longão';
      case 'tiros': return 'Treino de Tiros';
      case 'tempo': return 'Treino Tempo';
      case 'regenerativo': return 'Regenerativo';
      case 'easy': return 'Treino Fácil';
      default: return 'Treino';
    }
  };

  const getWorkoutZone = (type: string) => {
    switch (type) {
      case 'longoes': return 'Zona 1-2';
      case 'tiros': return 'Zona 4-5';
      case 'tempo': return 'Zona 3-4';
      case 'regenerativo': return 'Zona 1';
      case 'easy': return 'Zona 1-2';
      default: return 'Zona 2';
    }
  };

  const getWorkoutIntensity = (type: string) => {
    switch (type) {
      case 'longoes': return 'Moderada';
      case 'tiros': return 'Alta';
      case 'tempo': return 'Moderada-Alta';
      case 'regenerativo': return 'Baixa';
      case 'easy': return 'Baixa-Moderada';
      default: return 'Moderada';
    }
  };

  const calculateEstimatedDuration = (workout: any) => {
    if (!workout.workoutDetails) return 45;
    
    const distance = workout.workoutDetails.distance || 5;
    const avgPace = 6; // minutos por km (estimativa)
    const warmupCooldown = 15; // minutos
    
    return Math.round((distance * avgPace) + warmupCooldown);
  };

  const currentWorkout = getCurrentWorkout();
  const nextWorkout = getNextWorkout();

  const handleWorkoutToggle = (workout: any) => {
    if (!workout) return;
    
    const newCompletedStatus = !workout.completed;
    updateWorkoutProgress(workout.week, workout.workoutIndex, newCompletedStatus);
    
    if (newCompletedStatus) {
      Alert.alert('Parabéns! 🎉', 'Treino marcado como concluído!');
    } else {
      Alert.alert('Treino desmarcado', 'Treino marcado como não concluído.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Hoje</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </Text>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Text style={styles.weatherTitle}>Condições para Corrida</Text>
            <Text style={styles.weatherLocation}>
              {location ? `${location.city}, ${location.country}` : 'Carregando...'}
            </Text>
          </View>
          <View style={styles.weatherContent}>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherTemp}>
                {weather ? `${weather.temperature}°C` : '--°C'}
              </Text>
              <Text style={styles.weatherDesc}>
                {weather ? weather.description : 'Carregando...'}
              </Text>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Ionicons name="water" size={16} color={ProRunnerColors.primary} />
                <Text style={styles.weatherDetailText}>
                  {weather ? `${weather.humidity}%` : '--%'}
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <Ionicons name="eye" size={16} color={ProRunnerColors.primary} />
                <Text style={styles.weatherDetailText}>
                  {weather ? `${weather.visibility}km` : '--km'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.weatherTip}>
            <Text style={styles.weatherTipText}>
              💡 {weather ? weather.runningTip : 'Perfeito para correr!'}
            </Text>
          </View>
        </View>

        {/* Daily Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>💫 Inspiração do Dia</Text>
          <Text style={styles.motivationalText}>
            {dailyQuote || 'Cada quilômetro é uma vitória. Continue correndo!'}
          </Text>
        </View>

        {/* Today's Workout */}
        {currentWorkout ? (
          <View style={styles.workoutSection}>
            <Text style={styles.sectionTitle}>
              {currentWorkout.completed ? '✅ Treino Concluído' : 'Seu Treino de Hoje'}
            </Text>
            
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
              
              {/* Workout Details Grid */}
              <View style={styles.workoutDetailsGrid}>
                <View style={styles.workoutDetailCard}>
                  <Text style={styles.detailLabel}>Pace Alvo</Text>
                  <Text style={styles.detailValue}>
                    {currentWorkout.workoutDetails?.pace || '5:12'}/km
                  </Text>
                </View>
                <View style={styles.workoutDetailCard}>
                  <Text style={styles.detailLabel}>Zona</Text>
                  <Text style={styles.detailZone}>
                    {getWorkoutZone(currentWorkout.type)}
                  </Text>
                </View>
                <View style={styles.workoutDetailCard}>
                  <Text style={styles.detailLabel}>Intensidade</Text>
                  <Text style={styles.detailValue}>
                    {getWorkoutIntensity(currentWorkout.type)}
                  </Text>
                </View>
                <View style={styles.workoutDetailCard}>
                  <Text style={styles.detailLabel}>Duração Est.</Text>
                  <Text style={styles.detailValue}>
                    ~{calculateEstimatedDuration(currentWorkout)} min
                  </Text>
                </View>
              </View>
              
              {/* Workout Description */}
              {(currentWorkout.workoutDetails?.description || currentWorkout.detailedDescription) && (
                <View style={styles.workoutDescription}>
                  <Text style={styles.descriptionTitle}>Descrição do Treino:</Text>
                  <Text style={styles.descriptionText}>
                    {currentWorkout.workoutDetails?.description || currentWorkout.detailedDescription}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.workoutActions}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => {
                    router.push({
                      pathname: '/workout-detail',
                      params: {
                        workout: JSON.stringify(currentWorkout),
                        week: currentWorkout.week.toString(),
                        dayName: currentWorkout.day
                      }
                    });
                  }}
                >
                  <Text style={styles.primaryButtonText}>📋 Ver Detalhes Completos</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.secondaryButton,
                    currentWorkout.completed && styles.completedButton
                  ]}
                  onPress={() => {
                    if (currentWorkout.completed) {
                      Alert.alert(
                        'Desmarcar Treino',
                        'Deseja desmarcar este treino como concluído?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Sim, desmarcar', onPress: () => handleWorkoutToggle(currentWorkout) }
                        ]
                      );
                    } else {
                      Alert.alert(
                        'Marcar como Concluído',
                        'Você completou este treino?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Sim, completei!', onPress: () => handleWorkoutToggle(currentWorkout) }
                        ]
                      );
                    }
                  }}
                >
                  <Ionicons 
                    name={currentWorkout.completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                    size={20} 
                    color={currentWorkout.completed ? ProRunnerColors.background : ProRunnerColors.success} 
                  />
                  <Text style={[
                    styles.secondaryButtonText,
                    currentWorkout.completed && styles.completedButtonText
                  ]}>
                    {currentWorkout.completed ? 'Desmarcar' : 'Marcar Concluído'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noWorkoutSection}>
            <View style={styles.noWorkoutIcon}>
              <Text style={styles.noWorkoutEmoji}>🎉</Text>
            </View>
            <Text style={styles.noWorkoutTitle}>Treinos em Dia!</Text>
            <Text style={styles.noWorkoutSubtitle}>
              Você está em dia com seus treinos. Consulte o &ldquo;Plano Completo&rdquo; para ver os próximos.
            </Text>
          </View>
        )}

        {/* Next Workout Preview */}
        {currentWorkout?.completed && nextWorkout && nextWorkout.id !== currentWorkout.id && (
          <View style={styles.nextWorkoutSection}>
            <Text style={styles.sectionTitle}>🔜 Próximo Treino</Text>
            
            <View style={styles.nextWorkoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.nextWorkoutIcon}>
                  <Text style={styles.workoutEmoji}>{nextWorkout.emoji}</Text>
                </View>
                
                <View style={styles.workoutMainInfo}>
                  <Text style={styles.nextWorkoutTitle}>
                    {getWorkoutName(nextWorkout.type)}
                  </Text>
                  <Text style={styles.workoutDistance}>
                    {nextWorkout.workoutDetails ? 
                      (nextWorkout.workoutDetails.distance ? `${nextWorkout.workoutDetails.distance}km` :
                       nextWorkout.workoutDetails.duration ? `${nextWorkout.workoutDetails.duration}min` :
                       nextWorkout.workoutDetails.intervals ? `${nextWorkout.workoutDetails.intervals}x${nextWorkout.workoutDetails.intervalDuration}min` :
                       'Treino') :
                      'Treino'
                    } • {nextWorkout.day}
                  </Text>
                </View>
              </View>
              
              {/* Quick Preview */}
              <View style={styles.nextWorkoutPreview}>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Pace</Text>
                  <Text style={styles.previewValue}>
                    {nextWorkout.workoutDetails?.pace || '5:12'}/km
                  </Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Zona</Text>
                  <Text style={styles.previewValue}>
                    {getWorkoutZone(nextWorkout.type)}
                  </Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>Duração</Text>
                  <Text style={styles.previewValue}>
                    ~{calculateEstimatedDuration(nextWorkout)}min
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.nextWorkoutButton}
                onPress={() => {
                  router.push({
                    pathname: '/workout-detail',
                    params: {
                      workout: JSON.stringify(nextWorkout),
                      week: nextWorkout.week.toString(),
                      dayName: nextWorkout.day
                    }
                  });
                }}
              >
                <Text style={styles.nextWorkoutButtonText}>Ver Detalhes do Próximo</Text>
                <Ionicons name="arrow-forward" size={16} color={ProRunnerColors.primary} />
              </TouchableOpacity>
            </View>
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
  date: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textTransform: 'capitalize',
  },
  weatherCard: {
    backgroundColor: ProRunnerColors.surface,
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  weatherHeader: {
    marginBottom: 16,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  weatherLocation: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherMain: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: 'bold',
    color: ProRunnerColors.primary,
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: 16,
    color: ProRunnerColors.textPrimary,
    textTransform: 'capitalize',
  },
  weatherDetails: {
    alignItems: 'flex-end',
    gap: 8,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherDetailText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  weatherTip: {
    backgroundColor: ProRunnerColors.primary + '15',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: ProRunnerColors.primary,
  },
  weatherTipText: {
    fontSize: 14,
    color: ProRunnerColors.primary,
    fontWeight: '500',
  },
  motivationCard: {
    backgroundColor: ProRunnerColors.surface,
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 12,
  },
  motivationalText: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  workoutSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ProRunnerColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  workoutEmoji: {
    fontSize: 28,
  },
  workoutMainInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  workoutDistance: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
  },
  workoutDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  workoutDetailCard: {
    backgroundColor: ProRunnerColors.background,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
  },
  detailZone: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.primary,
    textAlign: 'center',
  },
  workoutDescription: {
    backgroundColor: ProRunnerColors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    lineHeight: 20,
  },
  workoutActions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: ProRunnerColors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: ProRunnerColors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: ProRunnerColors.success + '20',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: ProRunnerColors.success,
    fontSize: 16,
    fontWeight: '600',
  },
  completedButton: {
    backgroundColor: ProRunnerColors.success,
  },
  completedButtonText: {
    color: ProRunnerColors.background,
  },
  noWorkoutSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingVertical: 40,
  },
  noWorkoutIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ProRunnerColors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noWorkoutEmoji: {
    fontSize: 40,
  },
  noWorkoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  noWorkoutSubtitle: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  spacer: {
    height: 100,
  },
  nextWorkoutSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  nextWorkoutCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
    opacity: 0.8,
  },
  nextWorkoutIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ProRunnerColors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  nextWorkoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  nextWorkoutPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: ProRunnerColors.border,
  },
  previewItem: {
    alignItems: 'center',
    flex: 1,
  },
  previewLabel: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
  },
  nextWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ProRunnerColors.primary + '15',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  nextWorkoutButtonText: {
    color: ProRunnerColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
}); 