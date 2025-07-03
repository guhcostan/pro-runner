import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemedView } from '@/components/ThemedView';

// Tipos para o sistema adaptativo
interface TodayWorkout {
  id: string;
  name: string;
  type: string;
  duration: number;
  distance?: number;
  intensity: 'easy' | 'moderate' | 'hard' | 'recovery';
  xp_reward: number;
  description: string;
  instructions: string[];
  pace?: string;
  is_completed: boolean;
  phase: string;
}

interface WorkoutSession {
  id: string;
  workout_id: string;
  started_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  distance_km?: number;
  avg_pace?: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
}

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  wind_speed: number;
  uv_index: number;
  running_tip: string;
}

export default function WorkoutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();
  
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkoutData = async () => {
    try {
      // TODO: Implementar chamadas para a API adaptativa
      // Simulando dados por enquanto
      const mockWorkout: TodayWorkout = {
        id: '1',
        name: 'Corrida Base',
        type: 'easy_run',
        duration: 30,
        distance: 5,
        intensity: 'easy',
        xp_reward: 120,
        description: 'Corrida em ritmo confortável para construir base aeróbica',
        instructions: [
          'Aquecimento de 5 minutos caminhando',
          'Corrida em ritmo conversacional por 20 minutos',
          'Desaquecimento de 5 minutos caminhando',
          'Hidrate-se adequadamente'
        ],
        pace: '6:30',
        is_completed: false,
        phase: 'foundation'
      };

      const mockSession: WorkoutSession = {
        id: '1',
        workout_id: '1',
        status: 'not_started'
      };

      const mockWeather: WeatherData = {
        temperature: 22,
        description: 'Parcialmente nublado',
        humidity: 65,
        wind_speed: 8,
        uv_index: 3,
        running_tip: 'Condições ideais para corrida! Boa ventilação e temperatura amena.'
      };

      setTodayWorkout(mockWorkout);
      setWorkoutSession(mockSession);
      setWeather(mockWeather);
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      Alert.alert('Erro', 'Não foi possível carregar seu treino de hoje');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutData();
    setRefreshing(false);
  };

  const handleStartWorkout = () => {
    if (!todayWorkout) return;
    
    Alert.alert(
      'Iniciar Treino',
      'Tem certeza que deseja iniciar o treino? O cronômetro será ativado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Iniciar', 
          onPress: () => {
            setWorkoutSession(prev => prev ? {...prev, status: 'in_progress', started_at: new Date().toISOString()} : null);
            router.push('/workout-detail');
          }
        }
      ]
    );
  };

  const handleCompleteWorkout = () => {
    if (!todayWorkout) return;
    
    Alert.alert(
      'Completar Treino',
      'Parabéns! Você completou o treino de hoje.',
      [
        { text: 'Ok', onPress: () => {
          setTodayWorkout(prev => prev ? {...prev, is_completed: true} : null);
          setWorkoutSession(prev => prev ? {...prev, status: 'completed', completed_at: new Date().toISOString()} : null);
        }}
      ]
    );
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'easy': return Colors.intensity.easy;
      case 'moderate': return Colors.intensity.moderate;
      case 'hard': return Colors.intensity.hard;
      case 'recovery': return Colors.intensity.recovery;
      default: return Colors.status.neutral;
    }
  };

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'easy': return 'Fácil';
      case 'moderate': return 'Moderado';
      case 'hard': return 'Intenso';
      case 'recovery': return 'Recuperação';
      default: return 'Normal';
    }
  };

  const getPhaseColor = (phase: string) => {
    const phaseKey = phase as keyof typeof Colors.phases;
    return Colors.phases[phaseKey]?.primary || Colors.primary;
  };

  useEffect(() => {
    loadWorkoutData();
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: isDark ? Colors.dark.text : Colors.light.text }}>
            Carregando treino...
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Seu Treino
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </Text>
        </View>

        {/* Condições para Corrida */}
        {weather && (
          <Card variant="outlined" margin="small">
            <View style={styles.weatherHeader}>
              <Ionicons name="partly-sunny" size={24} color={Colors.status.warning} />
              <Text style={[styles.weatherTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Condições para Corrida
              </Text>
            </View>
            
            <View style={styles.weatherContent}>
              <View style={styles.weatherMain}>
                <Text style={[styles.weatherTemp, { color: Colors.primary }]}>
                  {weather.temperature}°C
                </Text>
                <Text style={[styles.weatherDesc, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {weather.description}
                </Text>
              </View>
              
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetail}>
                  <Ionicons name="water" size={16} color={Colors.status.info} />
                  <Text style={[styles.weatherDetailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {weather.humidity}%
                  </Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="leaf" size={16} color={Colors.status.success} />
                  <Text style={[styles.weatherDetailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {weather.wind_speed}km/h
                  </Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="sunny" size={16} color={Colors.status.warning} />
                  <Text style={[styles.weatherDetailText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    UV {weather.uv_index}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.weatherTip}>
              <Text style={[styles.weatherTipText, { color: Colors.status.info }]}>
                💡 {weather.running_tip}
              </Text>
            </View>
          </Card>
        )}

        {/* Treino Principal */}
        {todayWorkout ? (
          <Card variant="elevated" margin="small">
            <View style={styles.workoutHeader}>
              <View>
                <Text style={[styles.workoutTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {todayWorkout.name}
                </Text>
                <Text style={[styles.workoutType, { color: Colors.text.secondary }]}>
                  Treino de hoje
                </Text>
              </View>
              <Badge variant="default" size="small" style={{ backgroundColor: Colors.xp.primary }}>
                +{todayWorkout.xp_reward} XP
              </Badge>
            </View>

            <Text style={[styles.workoutDescription, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {todayWorkout.description}
            </Text>

            {/* Detalhes do Treino */}
            <View style={styles.workoutDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={20} color={Colors.primary} />
                <Text style={[styles.detailLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Duração
                </Text>
                <Text style={[styles.detailValue, { color: Colors.primary }]}>
                  {todayWorkout.duration} min
                </Text>
              </View>

              {todayWorkout.distance && (
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={20} color={Colors.primary} />
                  <Text style={[styles.detailLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Distância
                  </Text>
                  <Text style={[styles.detailValue, { color: Colors.primary }]}>
                    {todayWorkout.distance} km
                  </Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={20} color={Colors.primary} />
                <Text style={[styles.detailLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Pace Alvo
                </Text>
                <Text style={[styles.detailValue, { color: Colors.primary }]}>
                  {todayWorkout.pace || '6:00'}/km
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="fitness" size={20} color={getIntensityColor(todayWorkout.intensity)} />
                <Text style={[styles.detailLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Intensidade
                </Text>
                <Badge 
                  variant="default" 
                  size="small"
                  style={{ backgroundColor: getIntensityColor(todayWorkout.intensity) }}
                >
                  {getIntensityLabel(todayWorkout.intensity)}
                </Badge>
              </View>
            </View>

            {/* Instruções */}
            <View style={styles.instructionsSection}>
              <Text style={[styles.instructionsTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Instruções do Treino:
              </Text>
              {todayWorkout.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={[styles.instructionNumber, { color: Colors.primary }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.instructionText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>

            {/* Botões de Ação */}
            <View style={styles.actionButtons}>
              {!todayWorkout.is_completed ? (
                <>
                  <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
                    onPress={handleStartWorkout}
                  >
                    <Ionicons name="play" size={20} color="#ffffff" />
                    <Text style={styles.primaryButtonText}>
                      Iniciar Treino
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.secondaryButton, { borderColor: Colors.status.success }]}
                    onPress={handleCompleteWorkout}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color={Colors.status.success} />
                    <Text style={[styles.secondaryButtonText, { color: Colors.status.success }]}>
                      Marcar como Concluído
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.completedSection}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.status.success} />
                  <Text style={[styles.completedText, { color: Colors.status.success }]}>
                    Treino Concluído! 🎉
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ) : (
          <Card variant="outlined" margin="small">
            <View style={styles.noWorkoutContainer}>
              <Ionicons name="calendar-outline" size={48} color={Colors.text.muted} />
              <Text style={[styles.noWorkoutTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Nenhum treino programado
              </Text>
              <Text style={[styles.noWorkoutSubtitle, { color: Colors.text.secondary }]}>
                Consulte seu plano adaptativo para ver os próximos treinos
              </Text>
              <TouchableOpacity 
                style={[styles.linkButton, { borderColor: Colors.primary }]}
                onPress={() => router.push('/(tabs)/plan')}
              >
                <Text style={[styles.linkButtonText, { color: Colors.primary }]}>
                  Ver Plano Completo
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Histórico Recente */}
        <Card variant="outlined" margin="small">
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Treinos Recentes
          </Text>
          
          <View style={styles.historyPlaceholder}>
            <Ionicons name="time-outline" size={32} color={Colors.text.muted} />
            <Text style={[styles.historyPlaceholderText, { color: Colors.text.secondary }]}>
              Seu histórico de treinos aparecerá aqui
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.7,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherMain: {
    alignItems: 'flex-start',
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  weatherDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  weatherDetails: {
    alignItems: 'flex-end',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weatherDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  weatherTip: {
    backgroundColor: Colors.status.info + '20',
    padding: 12,
    borderRadius: 8,
  },
  weatherTipText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  workoutType: {
    fontSize: 14,
    marginTop: 2,
  },
  workoutDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.9,
  },
  workoutDetails: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 20,
    marginRight: 8,
  },
  instructionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noWorkoutContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noWorkoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noWorkoutSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  historyPlaceholderText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});