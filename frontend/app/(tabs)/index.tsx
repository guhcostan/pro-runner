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
import { translations, Language } from '@/constants/i18n';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { XPProgressBar } from '@/components/progression/XPProgressBar';
import { TrainingPhaseCard } from '@/components/progression/TrainingPhaseCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Tipos para o sistema adaptativo
interface UserProgress {
  id: string;
  current_phase_id: number;
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
  total_xp_earned: number;
  total_workouts_completed: number;
  total_distance_run: number;
  current_streak_days: number;
  longest_streak_days: number;
  achievements: Achievement[];
  phase_started_at: string;
  last_workout_at?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

interface TrainingPhase {
  id: number;
  name: string;
  display_name: {
    pt: string;
    en: string;
    es: string;
  };
  description: {
    pt: string;
    en: string;
    es: string;
  };
}

interface TodayWorkout {
  id: string;
  name: string;
  type: string;
  duration: number;
  intensity: 'easy' | 'moderate' | 'hard';
  xp_reward: number;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();
  
  // Por enquanto, vamos usar português por padrão
  const language: Language = 'pt';
  const t = translations[language];
  
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TrainingPhase | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    try {
      // TODO: Implementar chamadas para a API adaptativa
      // Simulando dados por enquanto
      const mockProgress: UserProgress = {
        id: '1',
        current_phase_id: 1,
        current_level: 3,
        current_xp: 750,
        xp_to_next_level: 1000,
        total_xp_earned: 2750,
        total_workouts_completed: 15,
        total_distance_run: 87.5,
        current_streak_days: 5,
        longest_streak_days: 12,
        achievements: [
          {
            id: '1',
            name: 'Primeiro Treino',
            description: 'Complete seu primeiro treino',
            icon: '🏃‍♂️',
            earned_at: '2025-01-10T10:00:00Z'
          }
        ],
        phase_started_at: '2025-01-01T00:00:00Z',
        last_workout_at: '2025-01-15T18:30:00Z'
      };

      const mockPhase: TrainingPhase = {
        id: 1,
        name: 'foundation',
        display_name: {
          pt: 'Base',
          en: 'Foundation',
          es: 'Base'
        },
        description: {
          pt: 'Construção da base aeróbica e adaptação inicial',
          en: 'Building aerobic base and initial adaptation',
          es: 'Construcción de base aeróbica y adaptación inicial'
        }
      };

      const mockWorkout: TodayWorkout = {
        id: '1',
        name: 'Corrida Fácil',
        type: 'easy_run',
        duration: 30,
        intensity: 'easy',
        xp_reward: 100
      };

      setUserProgress(mockProgress);
      setCurrentPhase(mockPhase);
      setTodayWorkout(mockWorkout);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus dados');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleStartWorkout = () => {
    if (todayWorkout) {
      router.push('/workout-detail');
    }
  };

  const handleViewProgress = () => {
    router.push('/(tabs)/progress');
  };

  const handleViewPhase = () => {
    router.push('/(tabs)/plan');
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: isDark ? Colors.dark.text : Colors.light.text }}>
            {t.loading}
          </Text>
        </View>
      </ThemedView>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const xpProgress = userProgress ? userProgress.current_xp / userProgress.xp_to_next_level : 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header com saudação */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {user?.email?.split('@')[0] || 'Runner'}! 🏃‍♂️
          </Text>
        </View>

        {/* Card de Progresso XP */}
        {userProgress && (
          <Card variant="elevated" margin="small">
            <View style={styles.xpHeader}>
              <View>
                <Text style={[styles.levelText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Nível {userProgress.current_level}
                </Text>
                <Text style={[styles.xpText, { color: Colors.xp.primary }]}>
                  {userProgress.current_xp} / {userProgress.xp_to_next_level} XP
                </Text>
              </View>
              <TouchableOpacity onPress={handleViewProgress} style={styles.progressButton}>
                <Ionicons 
                  name="stats-chart" 
                  size={24} 
                  color={Colors.xp.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <XPProgressBar
              currentXP={userProgress.current_xp}
              xpToNextLevel={userProgress.xp_to_next_level}
              currentLevel={userProgress.current_level}
              totalXPEarned={userProgress.total_xp_earned}
              style={styles.xpBar}
            />

            {/* Estatísticas rápidas */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.status.success }]}>
                  {userProgress.current_streak_days}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Dias seguidos
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.status.info }]}>
                  {userProgress.total_workouts_completed}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Treinos
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.status.warning }]}>
                  {userProgress.total_distance_run.toFixed(1)}km
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Distância total
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Fase Atual */}
        {currentPhase && (
          <Card variant="elevated" margin="small">
            <TouchableOpacity onPress={handleViewPhase}>
              <View style={styles.phaseHeader}>
                <View>
                  <Text style={[styles.phaseLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Fase Atual
                  </Text>
                  <Text style={[styles.phaseName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {currentPhase.display_name[language]}
                  </Text>
                </View>
                <Badge 
                  variant="phase" 
                  phase={currentPhase.name as 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery'}
                  size="large"
                >
                  Nível {userProgress?.current_level}
                </Badge>
              </View>
              
              <Text style={[styles.phaseDescription, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {currentPhase.description[language]}
              </Text>
              
              <View style={styles.phaseProgress}>
                <ProgressBar
                  progress={xpProgress}
                  variant="phase"
                  phase={currentPhase.name as 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery'}
                  showLabel
                  label="Progresso para próximo nível"
                />
              </View>
            </TouchableOpacity>
          </Card>
        )}

        {/* Treino de Hoje */}
        {todayWorkout && (
          <Card variant="elevated" margin="small">
            <View style={styles.workoutHeader}>
              <Text style={[styles.workoutTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Treino de Hoje
              </Text>
              <Badge 
                variant="info" 
                size="small"
              >
                +{todayWorkout.xp_reward} XP
              </Badge>
            </View>

            <View style={styles.workoutDetails}>
              <Text style={[styles.workoutName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {todayWorkout.name}
              </Text>
              
              <View style={styles.workoutMeta}>
                <View style={styles.workoutMetaItem}>
                  <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color={isDark ? Colors.dark.icon : Colors.light.icon} 
                  />
                  <Text style={[styles.workoutMetaText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {todayWorkout.duration} min
                  </Text>
                </View>
                
                <Badge 
                  variant={todayWorkout.intensity === 'easy' ? 'success' : 
                          todayWorkout.intensity === 'moderate' ? 'warning' : 'error'}
                  size="small"
                >
                  {todayWorkout.intensity === 'easy' ? 'Fácil' : 
                   todayWorkout.intensity === 'moderate' ? 'Moderado' : 'Difícil'}
                </Badge>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.startButton, { backgroundColor: Colors.xp.primary }]}
              onPress={handleStartWorkout}
            >
              <Ionicons name="play" size={20} color="#ffffff" />
              <Text style={styles.startButtonText}>
                Iniciar Treino
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Conquistas Recentes */}
        {userProgress?.achievements && userProgress.achievements.length > 0 && (
          <Card variant="elevated" margin="small">
            <Text style={[styles.achievementsTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Conquistas Recentes
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userProgress.achievements.slice(0, 5).map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={[styles.achievementName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {achievement.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Card>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  greeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  progressButton: {
    padding: 8,
  },
  xpBar: {
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  phaseLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  phaseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  phaseProgress: {
    marginTop: 8,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutDetails: {
    marginBottom: 20,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutMetaText: {
    marginLeft: 4,
    fontSize: 14,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
