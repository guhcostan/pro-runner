import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import { ProRunnerColors } from '../constants/Colors';
import { useUserStore } from '../store/userStore';
import { translateFitnessLevel, getGoalDisplayName } from '../lib/utils';


export default function CompletePlanScreen() {
  const { plan } = useUserStore();
  const router = useRouter();
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Nenhum plano encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleWeekExpansion = (weekNumber: number) => {
    setExpandedWeeks(prev => 
      prev.includes(weekNumber) 
        ? prev.filter(w => w !== weekNumber)
        : [...prev, weekNumber]
    );
  };

  const getWorkoutEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      // Novos tipos baseados na metodologia VDOT
      'easy': '🚶‍♂️',
      'interval': '⚡',
      'tempo': '🔥',
      'long': '🏃‍♂️',
      'recovery': '🧘‍♂️',
      'off': '😴',
      // Tipos antigos (compatibilidade)
      'regenerativo': '🧘‍♂️',
      'longao': '🏃‍♂️',
      'tiros': '⚡',
      'velocidade': '🚀',
      'fartlek': '🎯',
    };
    return emojiMap[type] || '🏃‍♂️';
  };

  const getWorkoutName = (type: string) => {
    const nameMap: Record<string, string> = {
      'easy': 'Corrida Leve',
      'interval': 'Tiros',
      'tempo': 'Tempo',
      'long': 'Longão',
      'recovery': 'Regenerativo',
      // Novos tipos baseados em metodologias científicas
      'fartlek': 'Fartlek',
      'hill': 'Subidas',
      'progressive': 'Progressivo',
      'ladder': 'Escada',
      'long_surges': 'Longão + Surges',
      'progressive_long': 'Longão Progressivo',
      // Compatibilidade com nomes antigos
      'tiros': 'Tiros',
      'longao': 'Longão',
      'regenerativo': 'Regenerativo'
    };
    return nameMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getWorkoutTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'easy': ProRunnerColors.success,
      'interval': ProRunnerColors.error,
      'tempo': ProRunnerColors.warning,
      'long': ProRunnerColors.accent,
      'recovery': ProRunnerColors.success,
      // Novos tipos com cores específicas
      'fartlek': '#9C27B0', // Roxo para Fartlek (divertido)
      'hill': '#FF5722', // Laranja para subidas (força)
      'progressive': '#3F51B5', // Azul para progressivo
      'ladder': '#795548', // Marrom para escada
      'long_surges': '#607D8B', // Azul acinzentado para longão com surges
      'progressive_long': '#009688', // Verde azulado para longão progressivo
      // Compatibilidade com nomes antigos
      'tiros': ProRunnerColors.error,
      'longao': ProRunnerColors.accent,
      'regenerativo': ProRunnerColors.success
    };
    return colorMap[type] || ProRunnerColors.textSecondary;
  };

  const formatWorkoutInfo = (workout: any) => {
    const { workoutDetails } = workout;
    
    if (workoutDetails.distance) {
      return `${workoutDetails.distance}km`;
    } else if (workoutDetails.duration) {
      return `${workoutDetails.duration}min`;
    } else if (workoutDetails.intervals) {
      return `${workoutDetails.intervals}x${workoutDetails.intervalDuration}min`;
    }
    return 'Treino';
  };

  const renderWorkoutDetails = (workout: any, weekNumber: number) => {
    return (
      <TouchableOpacity 
        key={workout.id || `${workout.day}-${workout.type}`} 
        style={[styles.workoutCard, { borderLeftColor: getWorkoutTypeColor(workout.type) }]}
        onPress={() => {
          router.push({
            pathname: '/workout-detail',
            params: {
              workout: JSON.stringify(workout),
              week: weekNumber.toString(),
              dayName: workout.day
            }
          });
        }}
      >
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutEmoji}>{getWorkoutEmoji(workout.type)}</Text>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>{getWorkoutName(workout.type)}</Text>
            <Text style={styles.workoutDay}>{workout.day}</Text>
          </View>
          <View style={[styles.workoutDistance, { backgroundColor: getWorkoutTypeColor(workout.type) }]}>
            <Text style={styles.distanceText}>{formatWorkoutInfo(workout)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={ProRunnerColors.textSecondary} />
        </View>

        {/* VDOT-based workout info */}
        <View style={styles.workoutSummary}>
          <Text style={styles.workoutDescription}>{workout.workoutDetails.description}</Text>
          
          {/* Pace information */}
          <View style={styles.paceSection}>
            <View style={styles.paceRow}>
              <Text style={styles.paceLabel}>Pace Alvo:</Text>
              <Text style={styles.paceValue}>{workout.workoutDetails.pace}/km</Text>
            </View>
            
            {workout.workoutDetails.intervals && (
              <View style={styles.paceRow}>
                <Text style={styles.paceLabel}>Estrutura:</Text>
                <Text style={styles.paceValue}>
                  {workout.workoutDetails.intervals}x{workout.workoutDetails.intervalDuration}min
                </Text>
              </View>
            )}
            
            {workout.workoutDetails.recoveryTime && (
              <View style={styles.paceRow}>
                <Text style={styles.paceLabel}>Recuperação:</Text>
                <Text style={styles.paceValue}>{workout.workoutDetails.recoveryTime}min</Text>
              </View>
            )}
          </View>
          
          <View style={styles.workoutFooter}>
            <View style={[styles.typeBadge, { backgroundColor: getWorkoutTypeColor(workout.type) + '20' }]}>
              <Text style={[styles.typeText, { color: getWorkoutTypeColor(workout.type) }]}>
                {getWorkoutName(workout.type)}
              </Text>
            </View>
            <Text style={styles.detailsHint}>👆 Toque para ver detalhes</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Plano Completo",
          headerBackTitle: "Voltar",
          headerStyle: {
            backgroundColor: ProRunnerColors.background,
          },
          headerTintColor: ProRunnerColors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18, // Diminui ligeiramente o tamanho da fonte
          },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Plano Completo',
                  'Aqui você vê todos os treinos de todas as semanas do seu plano, com paces detalhados e estruturas específicas para cada tipo de treino.',
                  [{ text: 'Entendi' }]
                );
              }}
              style={{ marginRight: 8 }}
            >
              <Ionicons name="information-circle" size={24} color={ProRunnerColors.textPrimary} />
            </TouchableOpacity>
          ),
        }} 
      />
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        <ScrollView style={styles.scrollView}>
        {/* Plan Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📋 Resumo do Plano</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Objetivo:</Text>
            <Text style={styles.summaryValue}>{getGoalDisplayName(plan.goal)}</Text>
          </View>
          {plan.originalGoal && plan.originalGoal !== plan.goal && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Objetivo Original:</Text>
              <Text style={[styles.summaryValue, { color: ProRunnerColors.warning }]}>
                {getGoalDisplayName(plan.originalGoal)} (ajustado)
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duração:</Text>
            <Text style={styles.summaryValue}>{plan.total_weeks} semanas</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nível:</Text>
            <Text style={styles.summaryValue}>{translateFitnessLevel(plan.fitness_level)}</Text>
          </View>
          {plan.vdot && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VDOT:</Text>
              <Text style={styles.summaryValue}>{Math.round(plan.vdot)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pace Base (5K):</Text>
            <Text style={styles.summaryValue}>{plan.base_pace}/km</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frequência:</Text>
            <Text style={styles.summaryValue}>{plan.weekly_frequency || 3}x por semana</Text>
          </View>
          {plan.estimated_capabilities && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Capacidade Máxima:</Text>
              <Text style={styles.summaryValue}>{plan.estimated_capabilities.currentMaxDistance}km</Text>
            </View>
          )}
        </View>

        {/* Progression Data */}
        {plan.progression_data && (
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>📈 Progressão Esperada</Text>
            <Text style={styles.progressionSubtitle}>Sua evolução ao longo do plano:</Text>
            
            {/* VDOT Progression */}
            <View style={styles.progressionSection}>
              <Text style={styles.progressionLabel}>💪 VDOT (Fitness Aeróbico)</Text>
              <View style={styles.progressionRow}>
                <View style={styles.progressionCurrent}>
                  <Text style={styles.progressionTitle}>Atual</Text>
                  <Text style={styles.progressionValue}>{plan.progression_data.current.vdot}</Text>
                </View>
                <View style={styles.progressionArrow}>
                  <Ionicons name="arrow-forward" size={20} color={ProRunnerColors.primary} />
                </View>
                <View style={styles.progressionFinal}>
                  <Text style={styles.progressionTitle}>Final</Text>
                  <Text style={styles.progressionValue}>{plan.progression_data.final.vdot}</Text>
                </View>
                <View style={styles.progressionImprovement}>
                  <Text style={styles.improvementText}>+{plan.progression_data.improvements.vdot}</Text>
                </View>
              </View>
            </View>

            {/* Pace 5K Progression */}
            <View style={styles.progressionSection}>
              <Text style={styles.progressionLabel}>⏱️ Pace 5K</Text>
              <View style={styles.progressionRow}>
                <View style={styles.progressionCurrent}>
                  <Text style={styles.progressionTitle}>Atual</Text>
                  <Text style={styles.progressionValue}>{plan.progression_data.current.pace5k}/km</Text>
                </View>
                <View style={styles.progressionArrow}>
                  <Ionicons name="arrow-forward" size={20} color={ProRunnerColors.primary} />
                </View>
                <View style={styles.progressionFinal}>
                  <Text style={styles.progressionTitle}>Final</Text>
                  <Text style={styles.progressionValue}>{plan.progression_data.final.pace5k}/km</Text>
                </View>
                <View style={styles.progressionImprovement}>
                  <Text style={styles.improvementText}>-{plan.progression_data.improvements.pace5k}</Text>
                </View>
              </View>
              <Text style={styles.percentageImprovement}>
                ~{plan.progression_data.improvements.percentageImprovement}% mais rápido
              </Text>
            </View>

            {/* Distance Progression */}
            <View style={styles.progressionSection}>
              <Text style={styles.progressionLabel}>🏃‍♂️ Distância Máxima (Longão)</Text>
              <View style={styles.progressionRow}>
                <View style={styles.progressionCurrent}>
                  <Text style={styles.progressionTitle}>Atual</Text>
                  <Text style={styles.progressionValue}>{plan.progression_data.current.maxLongRun}km</Text>
                </View>
                <View style={styles.progressionArrow}>
                  <Ionicons name="arrow-forward" size={20} color={ProRunnerColors.primary} />
                </View>
                <View style={styles.progressionFinal}>
                  <Text style={styles.progressionTitle}>Final</Text>
                  <Text style={styles.progressionValue}>{plan.progression_data.final.maxLongRun}km</Text>
                </View>
                <View style={styles.progressionImprovement}>
                  <Text style={styles.improvementText}>+{plan.progression_data.improvements.maxLongRun}km</Text>
                </View>
              </View>
            </View>

            {/* Volume Progression */}
            <View style={styles.progressionSection}>
              <Text style={styles.progressionLabel}>📊 Volume Semanal</Text>
              <View style={styles.progressionRow}>
                <View style={styles.progressionCurrent}>
                  <Text style={styles.progressionTitle}>Atual</Text>
                  <Text style={styles.progressionValue}>{plan.progression_data.current.weeklyVolume}km</Text>
                </View>
                <View style={styles.progressionArrow}>
                  <Ionicons name="arrow-forward" size={20} color={ProRunnerColors.primary} />
                </View>
                <View style={styles.progressionFinal}>
                  <Text style={styles.progressionTitle}>Final</Text>
                  <Text style={styles.progressionValue}>{plan.progression_data.final.weeklyVolume}km</Text>
                </View>
                <View style={styles.progressionImprovement}>
                  <Text style={styles.improvementText}>+{plan.progression_data.improvements.weeklyVolume}km</Text>
                </View>
              </View>
            </View>

            {/* Time Predictions */}
            <View style={styles.progressionSection}>
              <Text style={styles.progressionLabel}>🎯 Tempos Estimados</Text>
              <View style={styles.timeEstimates}>
                <View style={styles.timeRow}>
                  <Text style={styles.distanceLabel}>5K:</Text>
                  <Text style={styles.currentTime}>{plan.progression_data.current.estimatedTimes['5k']}</Text>
                  <Ionicons name="arrow-forward" size={16} color={ProRunnerColors.primary} />
                  <Text style={styles.finalTime}>{plan.progression_data.final.estimatedTimes['5k']}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.distanceLabel}>10K:</Text>
                  <Text style={styles.currentTime}>{plan.progression_data.current.estimatedTimes['10k']}</Text>
                  <Ionicons name="arrow-forward" size={16} color={ProRunnerColors.primary} />
                  <Text style={styles.finalTime}>{plan.progression_data.final.estimatedTimes['10k']}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.distanceLabel}>21K:</Text>
                  <Text style={styles.currentTime}>{plan.progression_data.current.estimatedTimes['half']}</Text>
                  <Ionicons name="arrow-forward" size={16} color={ProRunnerColors.primary} />
                  <Text style={styles.finalTime}>{plan.progression_data.final.estimatedTimes['half']}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.distanceLabel}>42K:</Text>
                  <Text style={styles.currentTime}>{plan.progression_data.current.estimatedTimes['marathon']}</Text>
                  <Ionicons name="arrow-forward" size={16} color={ProRunnerColors.primary} />
                  <Text style={styles.finalTime}>{plan.progression_data.final.estimatedTimes['marathon']}</Text>
                </View>
              </View>
            </View>
          </View>
        )}



        {/* Validation Warning */}
        {plan.validation && plan.validation.warning && (
          <View style={[styles.summaryCard, { backgroundColor: ProRunnerColors.warning + '20', borderLeftWidth: 4, borderLeftColor: ProRunnerColors.warning }]}>
            <Text style={styles.cardTitle}>⚠️ Aviso Importante</Text>
            <Text style={[styles.summaryValue, { color: ProRunnerColors.warning }]}>
              {plan.validation.warning}
            </Text>
          </View>
        )}

        {/* Weekly Breakdown */}
        <View style={styles.weeksSection}>
          <Text style={styles.sectionTitle}>📅 Cronograma Semanal</Text>
          
          {plan.weeks.map((week: any) => (
            <View key={week.week} style={styles.weekCard}>
              <TouchableOpacity 
                style={styles.weekHeader}
                onPress={() => toggleWeekExpansion(week.week)}
              >
                <View style={styles.weekInfo}>
                  <Text style={styles.weekTitle}>Semana {week.week}</Text>
                  <Text style={styles.weekVolume}>{week.volume}km total</Text>
                  <Text style={styles.weekWorkouts}>{week.workouts.length} treinos</Text>
                </View>
                <Ionicons 
                  name={expandedWeeks.includes(week.week) ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color={ProRunnerColors.textSecondary} 
                />
              </TouchableOpacity>

              {expandedWeeks.includes(week.week) && (
                <View style={styles.weekContent}>
                  {week.workouts.map((workout: any, index: number) => 
                    renderWorkoutDetails(workout, week.week)
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick Guide */}
        <View style={styles.legendSection}>
          <Text style={styles.sectionTitle}>💡 Dica</Text>
          <View style={styles.legendCard}>
            <Text style={styles.legendTitle}>Para ver detalhes completos:</Text>
            <Text style={styles.legendText}>• Toque em qualquer treino para ver paces específicos</Text>
            <Text style={styles.legendText}>• Estrutura detalhada dos intervalos</Text>
            <Text style={styles.legendText}>• Sugestões de aquecimento e desaquecimento</Text>
            <Text style={styles.legendText}>• Dicas específicas para cada tipo de treino</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProRunnerColors.background,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: ProRunnerColors.textSecondary,
  },

  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: ProRunnerColors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  weeksSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  weekCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  weekVolume: {
    fontSize: 14,
    color: ProRunnerColors.primary,
    marginTop: 2,
  },
  weekWorkouts: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginTop: 2,
  },
  weekContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  workoutCard: {
    backgroundColor: ProRunnerColors.background,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  workoutDay: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginTop: 2,
  },
  workoutDistance: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  paceSection: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paceLabel: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  paceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.primary,
  },
  zoneValue: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.accent,
  },
  paceDescription: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  intervalSection: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  intervalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 12,
  },
  intervalPart: {
    marginBottom: 12,
  },
  intervalPartTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  intervalPartText: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginBottom: 2,
  },
  intervalPartDescription: {
    fontSize: 11,
    color: ProRunnerColors.textSecondary,
    fontStyle: 'italic',
  },
  zoneBadges: {
    marginVertical: 8,
  },
  zonesText: {
    fontSize: 11,
    color: ProRunnerColors.accent,
    fontWeight: '500',
  },
  tipsSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ProRunnerColors.border,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 11,
    color: ProRunnerColors.textSecondary,
    lineHeight: 16,
  },
  workoutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  intensityBadge: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  descriptionSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ProRunnerColors.border,
  },
  descriptionText: {
    fontSize: 13,
    color: ProRunnerColors.textSecondary,
    lineHeight: 18,
  },
  legendSection: {
    margin: 16,
    marginTop: 0,
  },
  legendCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  legendText: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
  },
  // New simplified styles
  workoutSummary: {
    marginTop: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsHint: {
    fontSize: 12,
    color: ProRunnerColors.primary,
    fontStyle: 'italic',
  },
  typeBadge: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  progressionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  progressionSection: {
    marginBottom: 16,
  },
  progressionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  progressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressionCurrent: {
    flex: 1,
  },
  progressionArrow: {
    marginHorizontal: 8,
  },
  progressionFinal: {
    flex: 1,
  },
  progressionImprovement: {
    flex: 1,
    alignItems: 'flex-end',
  },
  progressionTitle: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginBottom: 2,
  },
  progressionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.primary,
  },
  percentageImprovement: {
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.primary,
    marginTop: 4,
  },
  timeEstimates: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distanceLabel: {
    flex: 1,
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
  },
  currentTime: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.primary,
  },
  finalTime: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.primary,
  },
}); 