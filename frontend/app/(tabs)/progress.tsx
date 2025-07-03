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
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { XPProgressBar } from '@/components/progression/XPProgressBar';
import { AchievementsCard } from '@/components/progression/AchievementsCard';
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
  weekly_stats: WeeklyStats;
  monthly_stats: MonthlyStats;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  category: 'distance' | 'consistency' | 'level' | 'phase' | 'special';
}

interface WeeklyStats {
  workouts_completed: number;
  total_distance: number;
  total_time: number;
  xp_earned: number;
  avg_pace?: string;
}

interface MonthlyStats {
  workouts_completed: number;
  total_distance: number;
  total_time: number;
  xp_earned: number;
  best_streak: number;
}

interface TrainingPhase {
  id: number;
  name: string;
  display_name: {
    pt: string;
    en: string;
    es: string;
  };
}

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();
  
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TrainingPhase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  const loadProgressData = async () => {
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
            earned_at: '2025-01-10T10:00:00Z',
            category: 'special'
          },
          {
            id: '2',
            name: 'Maratonista Iniciante',
            description: 'Complete 10 treinos',
            icon: '🎯',
            earned_at: '2025-01-15T10:00:00Z',
            category: 'consistency'
          },
          {
            id: '3',
            name: '50km Conquistados',
            description: 'Corra um total de 50km',
            icon: '🏆',
            earned_at: '2025-01-12T10:00:00Z',
            category: 'distance'
          }
        ],
        phase_started_at: '2025-01-01T00:00:00Z',
        last_workout_at: '2025-01-15T18:30:00Z',
        weekly_stats: {
          workouts_completed: 3,
          total_distance: 18.5,
          total_time: 120,
          xp_earned: 350,
          avg_pace: '5:45'
        },
        monthly_stats: {
          workouts_completed: 15,
          total_distance: 87.5,
          total_time: 520,
          xp_earned: 2750,
          best_streak: 12
        }
      };

      const mockPhase: TrainingPhase = {
        id: 1,
        name: 'foundation',
        display_name: {
          pt: 'Base',
          en: 'Foundation',
          es: 'Base'
        }
      };

      setUserProgress(mockProgress);
      setCurrentPhase(mockPhase);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus dados de progresso');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProgressData();
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: isDark ? Colors.dark.text : Colors.light.text }}>
            Carregando progresso...
          </Text>
        </View>
      </ThemedView>
    );
  }

  const getStatsForPeriod = () => {
    if (!userProgress) return null;
    
    switch (selectedPeriod) {
      case 'week':
        return userProgress.weekly_stats;
      case 'month':
        return userProgress.monthly_stats;
      case 'all':
        return {
          workouts_completed: userProgress.total_workouts_completed,
          total_distance: userProgress.total_distance_run,
          total_time: userProgress.monthly_stats.total_time * 3, // Estimativa
          xp_earned: userProgress.total_xp_earned,
          best_streak: userProgress.longest_streak_days
        };
      default:
        return userProgress.weekly_stats;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const xpProgress = userProgress ? userProgress.current_xp / userProgress.xp_to_next_level : 0;
  const currentStats = getStatsForPeriod();

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
            Seu Progresso
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Acompanhe sua evolução no sistema adaptativo
          </Text>
        </View>

        {/* XP e Nível */}
        {userProgress && (
          <Card variant="elevated" margin="small">
            <XPProgressBar
              currentXP={userProgress.current_xp}
              xpToNextLevel={userProgress.xp_to_next_level}
              currentLevel={userProgress.current_level}
              totalXPEarned={userProgress.total_xp_earned}
            />
          </Card>
        )}

        {/* Seletor de Período */}
        <Card variant="outlined" margin="small" padding="small">
          <View style={styles.periodSelector}>
            {[
              { key: 'week', label: 'Esta Semana' },
              { key: 'month', label: 'Este Mês' },
              { key: 'all', label: 'Total' }
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.key as 'week' | 'month' | 'all')}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: isDark ? Colors.dark.text : Colors.light.text },
                    selectedPeriod === period.key && styles.periodButtonTextActive
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Estatísticas do Período */}
        {currentStats && (
          <Card variant="elevated" margin="small">
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Estatísticas - {selectedPeriod === 'week' ? 'Esta Semana' : 
                             selectedPeriod === 'month' ? 'Este Mês' : 'Total'}
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="fitness" size={24} color={Colors.status.success} />
                <Text style={[styles.statNumber, { color: Colors.status.success }]}>
                  {currentStats.workouts_completed}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Treinos
                </Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="location" size={24} color={Colors.status.info} />
                <Text style={[styles.statNumber, { color: Colors.status.info }]}>
                  {currentStats.total_distance.toFixed(1)}km
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Distância
                </Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color={Colors.status.warning} />
                <Text style={[styles.statNumber, { color: Colors.status.warning }]}>
                  {formatTime(currentStats.total_time)}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Tempo
                </Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="star" size={24} color={Colors.xp.primary} />
                <Text style={[styles.statNumber, { color: Colors.xp.primary }]}>
                  {currentStats.xp_earned}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  XP Ganho
                </Text>
              </View>
            </View>

            {/* Pace médio (apenas para semana/mês) */}
            {selectedPeriod !== 'all' && 'avg_pace' in currentStats && currentStats.avg_pace && (
              <View style={styles.paceContainer}>
                <Ionicons name="speedometer" size={20} color={Colors.status.info} />
                <Text style={[styles.paceText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Pace médio: {currentStats.avg_pace}/km
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Sequência de Treinos */}
        {userProgress && (
          <Card variant="elevated" margin="small">
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Consistência
            </Text>
            
            <View style={styles.streakContainer}>
              <View style={styles.streakItem}>
                <View style={[styles.streakIcon, { backgroundColor: Colors.status.success + '20' }]}>
                  <Ionicons name="flame" size={24} color={Colors.status.success} />
                </View>
                <View>
                  <Text style={[styles.streakNumber, { color: Colors.status.success }]}>
                    {userProgress.current_streak_days}
                  </Text>
                  <Text style={[styles.streakLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Sequência atual
                  </Text>
                </View>
              </View>

              <View style={styles.streakItem}>
                <View style={[styles.streakIcon, { backgroundColor: Colors.status.warning + '20' }]}>
                  <Ionicons name="trophy" size={24} color={Colors.status.warning} />
                </View>
                <View>
                  <Text style={[styles.streakNumber, { color: Colors.status.warning }]}>
                    {userProgress.longest_streak_days}
                  </Text>
                  <Text style={[styles.streakLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Melhor sequência
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Progresso da Fase */}
        {currentPhase && userProgress && (
          <Card variant="elevated" margin="small">
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Progresso da Fase
            </Text>
            
            <View style={styles.phaseContainer}>
              <View style={styles.phaseHeader}>
                <Badge 
                  variant="phase" 
                  phase={currentPhase.name as 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery'}
                  size="large"
                >
                  {currentPhase.display_name.pt}
                </Badge>
                <Text style={[styles.phaseLevel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Nível {userProgress.current_level}
                </Text>
              </View>
              
              <ProgressBar
                progress={xpProgress}
                variant="phase"
                phase={currentPhase.name as 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery'}
                showLabel
                label={`${userProgress.current_xp} / ${userProgress.xp_to_next_level} XP`}
                height={12}
              />
              
              <Text style={[styles.phaseDescription, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Faltam {userProgress.xp_to_next_level - userProgress.current_xp} XP para o próximo nível
              </Text>
            </View>
          </Card>
        )}

        {/* Conquistas */}
        {userProgress?.achievements && (
          <Card variant="elevated" margin="small">
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Conquistas Recentes
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userProgress.achievements.slice(0, 6).map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={[styles.achievementName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {achievement.name}
                  </Text>
                  <Text style={[styles.achievementDescription, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {achievement.description}
                  </Text>
                  <Badge variant="info" size="small">
                    {achievement.category}
                  </Badge>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: Colors.xp.primary }]}>
                Ver todas as conquistas
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.xp.primary} />
            </TouchableOpacity>
          </Card>
        )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.ui.border + '30',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.xp.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.ui.border + '10',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  paceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  paceText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  phaseContainer: {
    marginTop: 8,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseLevel: {
    fontSize: 16,
    fontWeight: '600',
  },
  phaseDescription: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  achievementCard: {
    width: 140,
    backgroundColor: Colors.ui.border + '10',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
}); 