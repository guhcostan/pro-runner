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
import { TrainingPhaseCard } from '@/components/progression/TrainingPhaseCard';
import { ThemedView } from '@/components/ThemedView';

// Tipos para o sistema adaptativo
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
  target_audience: string;
  primary_goals: string[];
  max_level: number;
  entry_criteria: {
    min_level?: number;
    min_workouts?: number;
    min_distance?: number;
  };
  exit_criteria: {
    target_level: number;
    mastery_requirements: string[];
  };
}

interface UserProgress {
  id: string;
  current_phase_id: number;
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
  total_xp_earned: number;
  phase_started_at: string;
  can_advance_phase: boolean;
  next_phase_id?: number;
}

interface AdaptivePlan {
  id: string;
  user_id: string;
  phase_id: number;
  level_range: {
    min: number;
    max: number;
  };
  weekly_structure: WeeklyStructure;
  progression_rules: ProgressionRules;
  generated_at: string;
  is_active: boolean;
}

interface WeeklyStructure {
  workouts_per_week: number;
  workout_types: {
    type: string;
    frequency: number;
    intensity: 'easy' | 'moderate' | 'hard';
    xp_reward: number;
  }[];
  rest_days: number;
  progression_pattern: string;
}

interface ProgressionRules {
  level_up_requirements: {
    min_workouts: number;
    min_xp: number;
    consistency_days: number;
  };
  phase_advancement: {
    criteria: string[];
    min_level: number;
    mastery_indicators: string[];
  };
}

export default function PlanScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();
  
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TrainingPhase | null>(null);
  const [allPhases, setAllPhases] = useState<TrainingPhase[]>([]);
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptivePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlanData = async () => {
    try {
      // TODO: Implementar chamadas para a API adaptativa
      // Simulando dados por enquanto
      const mockPhases: TrainingPhase[] = [
        {
          id: 1,
          name: 'foundation',
          display_name: {
            pt: 'Base',
            en: 'Foundation',
            es: 'Base'
          },
          description: {
            pt: 'Construção da base aeróbica e adaptação inicial ao treino de corrida',
            en: 'Building aerobic base and initial adaptation to running training',
            es: 'Construcción de base aeróbica y adaptación inicial al entrenamiento'
          },
          target_audience: 'Iniciantes ou retornando após pausa',
          primary_goals: ['Construir base aeróbica', 'Adaptar músculos e articulações', 'Criar hábito de treino'],
          max_level: 10,
          entry_criteria: {},
          exit_criteria: {
            target_level: 10,
            mastery_requirements: ['30 treinos completados', '100km acumulados', '7 dias de sequência']
          }
        },
        {
          id: 2,
          name: 'development',
          display_name: {
            pt: 'Desenvolvimento',
            en: 'Development',
            es: 'Desarrollo'
          },
          description: {
            pt: 'Desenvolvimento de resistência e aumento gradual do volume de treino',
            en: 'Endurance development and gradual training volume increase',
            es: 'Desarrollo de resistencia y aumento gradual del volumen de entrenamiento'
          },
          target_audience: 'Corredores com base estabelecida',
          primary_goals: ['Aumentar resistência', 'Melhorar eficiência', 'Preparar para treinos intensos'],
          max_level: 15,
          entry_criteria: {
            min_level: 10,
            min_workouts: 30,
            min_distance: 100
          },
          exit_criteria: {
            target_level: 15,
            mastery_requirements: ['60 treinos completados', '300km acumulados', 'Corrida longa de 15km']
          }
        },
        {
          id: 3,
          name: 'performance',
          display_name: {
            pt: 'Performance',
            en: 'Performance',
            es: 'Rendimiento'
          },
          description: {
            pt: 'Foco em velocidade, intervalos e melhoria de performance',
            en: 'Focus on speed, intervals and performance improvement',
            es: 'Enfoque en velocidad, intervalos y mejora del rendimiento'
          },
          target_audience: 'Corredores experientes buscando melhorar tempos',
          primary_goals: ['Melhorar velocidade', 'Treinos intervalados', 'Preparação para provas'],
          max_level: 20,
          entry_criteria: {
            min_level: 15,
            min_workouts: 60,
            min_distance: 300
          },
          exit_criteria: {
            target_level: 20,
            mastery_requirements: ['100 treinos completados', '600km acumulados', 'Prova de 10km sub-45min']
          }
        }
      ];

      const mockProgress: UserProgress = {
        id: '1',
        current_phase_id: 1,
        current_level: 3,
        current_xp: 750,
        xp_to_next_level: 1000,
        total_xp_earned: 2750,
        phase_started_at: '2025-01-01T00:00:00Z',
        can_advance_phase: false,
        next_phase_id: 2
      };

      const mockPlan: AdaptivePlan = {
        id: '1',
        user_id: '1',
        phase_id: 1,
        level_range: { min: 1, max: 5 },
        weekly_structure: {
          workouts_per_week: 3,
          workout_types: [
            {
              type: 'easy_run',
              frequency: 2,
              intensity: 'easy',
              xp_reward: 100
            },
            {
              type: 'tempo_run',
              frequency: 1,
              intensity: 'moderate',
              xp_reward: 150
            }
          ],
          rest_days: 4,
          progression_pattern: 'gradual_increase'
        },
        progression_rules: {
          level_up_requirements: {
            min_workouts: 5,
            min_xp: 1000,
            consistency_days: 3
          },
          phase_advancement: {
            criteria: ['Completar nível 10', 'Manter consistência por 4 semanas'],
            min_level: 10,
            mastery_indicators: ['30 treinos', '100km', '7 dias sequência']
          }
        },
        generated_at: '2025-01-01T00:00:00Z',
        is_active: true
      };

      setAllPhases(mockPhases);
      setUserProgress(mockProgress);
      setCurrentPhase(mockPhases.find(p => p.id === mockProgress.current_phase_id) || null);
      setAdaptivePlan(mockPlan);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar seu plano adaptativo');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlanData();
    setRefreshing(false);
  };

  const handleAdvancePhase = () => {
    if (!userProgress?.can_advance_phase) {
      Alert.alert(
        'Não é possível avançar',
        'Você precisa completar os requisitos da fase atual primeiro.'
      );
      return;
    }

    Alert.alert(
      'Avançar de Fase',
      'Tem certeza que deseja avançar para a próxima fase? Isso irá gerar um novo plano adaptativo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Avançar', onPress: () => {
          // TODO: Implementar avanço de fase
          console.log('Avançando para próxima fase...');
        }}
      ]
    );
  };

  const handleGenerateNewPlan = () => {
    Alert.alert(
      'Gerar Novo Plano',
      'Isso irá criar um novo plano adaptativo baseado no seu progresso atual. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Gerar', onPress: () => {
          router.push('/generating-plan');
        }}
      ]
    );
  };

  useEffect(() => {
    loadPlanData();
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: isDark ? Colors.dark.text : Colors.light.text }}>
            Carregando plano adaptativo...
          </Text>
        </View>
      </ThemedView>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Plano Adaptativo
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Treinos que evoluem com você
          </Text>
        </View>

        {/* Fase Atual */}
        {currentPhase && userProgress && (
          <Card variant="elevated" margin="small">
            <View style={styles.currentPhaseHeader}>
              <View>
                <Text style={[styles.currentPhaseLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Fase Atual
                </Text>
                <Text style={[styles.currentPhaseName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {currentPhase.display_name.pt}
                </Text>
              </View>
              <Badge 
                variant="phase" 
                phase={currentPhase.name as 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery'}
                size="large"
              >
                Nível {userProgress.current_level}
              </Badge>
            </View>

            <Text style={[styles.phaseDescription, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {currentPhase.description.pt}
            </Text>

            {/* Progresso da Fase */}
            <View style={styles.phaseProgress}>
              <ProgressBar
                progress={xpProgress}
                variant="phase"
                phase={currentPhase.name as 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery'}
                showLabel
                label={`Nível ${userProgress.current_level} - ${userProgress.current_xp}/${userProgress.xp_to_next_level} XP`}
                height={12}
              />
            </View>

            {/* Objetivos da Fase */}
            <View style={styles.goalsSection}>
              <Text style={[styles.goalsTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Objetivos desta fase:
              </Text>
              {currentPhase.primary_goals.map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.status.success} />
                  <Text style={[styles.goalText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {goal}
                  </Text>
                </View>
              ))}
            </View>

            {/* Botão de Avanço */}
            {userProgress.can_advance_phase && (
              <TouchableOpacity 
                style={[styles.advanceButton, { backgroundColor: Colors.xp.primary }]}
                onPress={handleAdvancePhase}
              >
                <Ionicons name="arrow-up" size={20} color="#ffffff" />
                <Text style={styles.advanceButtonText}>
                  Avançar para Próxima Fase
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Estrutura Semanal */}
        {adaptivePlan && (
          <Card variant="elevated" margin="small">
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Estrutura Semanal
            </Text>

            <View style={styles.weeklyOverview}>
              <View style={styles.weeklyStatItem}>
                <Ionicons name="fitness" size={24} color={Colors.status.success} />
                <Text style={[styles.weeklyStatNumber, { color: Colors.status.success }]}>
                  {adaptivePlan.weekly_structure.workouts_per_week}
                </Text>
                <Text style={[styles.weeklyStatLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Treinos/semana
                </Text>
              </View>

              <View style={styles.weeklyStatItem}>
                <Ionicons name="bed" size={24} color={Colors.status.info} />
                <Text style={[styles.weeklyStatNumber, { color: Colors.status.info }]}>
                  {adaptivePlan.weekly_structure.rest_days}
                </Text>
                <Text style={[styles.weeklyStatLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Dias de descanso
                </Text>
              </View>
            </View>

            {/* Tipos de Treino */}
            <View style={styles.workoutTypes}>
              <Text style={[styles.workoutTypesTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Tipos de treino:
              </Text>
              {adaptivePlan.weekly_structure.workout_types.map((workout, index) => (
                <View key={index} style={styles.workoutTypeItem}>
                  <View style={styles.workoutTypeInfo}>
                    <Text style={[styles.workoutTypeName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                      {workout.type === 'easy_run' ? 'Corrida Fácil' : 
                       workout.type === 'tempo_run' ? 'Corrida Tempo' : 
                       workout.type === 'interval' ? 'Intervalado' : workout.type}
                    </Text>
                    <Text style={[styles.workoutTypeFreq, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                      {workout.frequency}x por semana
                    </Text>
                  </View>
                  <View style={styles.workoutTypeMeta}>
                    <Badge 
                      variant={workout.intensity === 'easy' ? 'success' : 
                              workout.intensity === 'moderate' ? 'warning' : 'error'}
                      size="small"
                    >
                      {workout.intensity === 'easy' ? 'Fácil' : 
                       workout.intensity === 'moderate' ? 'Moderado' : 'Difícil'}
                    </Badge>
                    <Text style={[styles.xpReward, { color: Colors.xp.primary }]}>
                      +{workout.xp_reward} XP
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Critérios de Progressão */}
        {adaptivePlan && (
          <Card variant="elevated" margin="small">
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Progressão de Nível
            </Text>

            <Text style={[styles.progressionSubtitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Para subir de nível, você precisa:
            </Text>

            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Ionicons name="fitness" size={16} color={Colors.status.info} />
                <Text style={[styles.requirementText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Mínimo de {adaptivePlan.progression_rules.level_up_requirements.min_workouts} treinos
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                <Ionicons name="star" size={16} color={Colors.xp.primary} />
                <Text style={[styles.requirementText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {adaptivePlan.progression_rules.level_up_requirements.min_xp} XP acumulados
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                <Ionicons name="flame" size={16} color={Colors.status.success} />
                <Text style={[styles.requirementText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {adaptivePlan.progression_rules.level_up_requirements.consistency_days} dias de consistência
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Todas as Fases */}
        <Card variant="elevated" margin="small">
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Jornada Completa
          </Text>

          {allPhases.map((phase) => (
            <View key={phase.id} style={styles.phaseItem}>
              <View style={styles.phaseItemHeader}>
                <Badge 
                  variant="phase" 
                  phase={phase.name as 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery'}
                  size="medium"
                >
                  {phase.display_name.pt}
                </Badge>
                <View style={styles.phaseItemMeta}>
                  <Text style={[styles.phaseItemLevel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Níveis 1-{phase.max_level}
                  </Text>
                  {userProgress?.current_phase_id === phase.id && (
                    <Ionicons name="location" size={16} color={Colors.xp.primary} />
                  )}
                </View>
              </View>
              
              <Text style={[styles.phaseItemDescription, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {phase.description.pt}
              </Text>
              
              <Text style={[styles.phaseItemAudience, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Para: {phase.target_audience}
              </Text>

              {/* Critérios de entrada */}
              {Object.keys(phase.entry_criteria).length > 0 && (
                <View style={styles.criteriaSection}>
                  <Text style={[styles.criteriaTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Requisitos:
                  </Text>
                  {phase.entry_criteria.min_level && (
                    <Text style={[styles.criteriaText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                      • Nível mínimo: {phase.entry_criteria.min_level}
                    </Text>
                  )}
                  {phase.entry_criteria.min_workouts && (
                    <Text style={[styles.criteriaText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                      • Treinos: {phase.entry_criteria.min_workouts}+
                    </Text>
                  )}
                  {phase.entry_criteria.min_distance && (
                    <Text style={[styles.criteriaText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                      • Distância: {phase.entry_criteria.min_distance}km+
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </Card>

        {/* Ações */}
        <Card variant="outlined" margin="small">
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleGenerateNewPlan}
          >
            <Ionicons name="refresh" size={20} color={Colors.xp.primary} />
            <Text style={[styles.actionButtonText, { color: Colors.xp.primary }]}>
              Gerar Novo Plano Adaptativo
            </Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currentPhaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  currentPhaseLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  currentPhaseName: {
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
    marginBottom: 16,
  },
  goalsSection: {
    marginBottom: 16,
  },
  goalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalText: {
    marginLeft: 8,
    fontSize: 14,
  },
  advanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  advanceButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  weeklyOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  weeklyStatItem: {
    alignItems: 'center',
  },
  weeklyStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  weeklyStatLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  workoutTypes: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  workoutTypesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  workoutTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.ui.border + '10',
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutTypeInfo: {
    flex: 1,
  },
  workoutTypeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  workoutTypeFreq: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  workoutTypeMeta: {
    alignItems: 'flex-end',
  },
  xpReward: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  progressionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
  },
  phaseItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  phaseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseItemLevel: {
    fontSize: 12,
    opacity: 0.7,
    marginRight: 8,
  },
  phaseItemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  phaseItemAudience: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.6,
    marginBottom: 8,
  },
  criteriaSection: {
    marginTop: 8,
  },
  criteriaTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  criteriaText: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 