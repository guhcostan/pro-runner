import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';

import { ProRunnerColors } from '../constants/Colors';

// Componente para seções colapsáveis
const CollapsibleSection: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  color?: string;
}> = ({ title, icon, children, defaultExpanded = false, color = ProRunnerColors.primary }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.collapsibleContainer, { borderLeftColor: color }]}>
      <TouchableOpacity 
        style={[styles.collapsibleHeader, { backgroundColor: `${color}08` }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsibleHeaderContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.collapsibleIcon, { color }]}>{icon}</Text>
          </View>
          <Text style={styles.collapsibleTitle}>{title}</Text>
        </View>
        <View style={[styles.chevronContainer, { backgroundColor: expanded ? `${color}15` : 'transparent' }]}>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={color} 
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.collapsibleContent}>
          {children}
        </View>
      )}
    </View>
  );
};

export default function WorkoutDetailScreen() {
  // router removed as it's not being used
  const params = useLocalSearchParams();
  
  // Parse workout data from params
  const workout = params.workout ? JSON.parse(params.workout as string) : null;
  const weekNumber = params.week ? parseInt(params.week as string) : 1;
  const dayName = params.dayName as string;

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Treino não encontrado</Text>
      </SafeAreaView>
    );
  }

  const getWorkoutEmoji = (type: string) => {
    switch (type?.toLowerCase()) {
      // Novos tipos baseados na metodologia VDOT
      case 'easy': return '🚶‍♂️';
      case 'interval': return '⚡';
      case 'tempo': return '🔥';
      case 'long': return '🏃‍♂️';
      case 'recovery': return '🧘‍♂️';
      case 'off': return '😴';
      // Tipos antigos (compatibilidade)
      case 'longao': return '🏃‍♂️';
      case 'tiros': return '⚡';
      case 'regenerativo': return '🧘‍♂️';
      case 'fartlek': return '🎯';
      default: return '🏃‍♂️';
    }
  };

  const getWorkoutName = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'easy': return 'Corrida Leve';
      case 'interval': return 'Treino Intervalado';
      case 'tempo': return 'Treino Tempo';
      case 'long': return 'Corrida Longa';
      case 'recovery': return 'Recuperação';
      // Compatibilidade
      case 'longao': return 'Corrida Longa';
      case 'tiros': return 'Treino Intervalado';
      case 'regenerativo': return 'Recuperação';
      default: return 'Treino';
    }
  };

  const getEstimatedDuration = (workout: any) => {
    // Nova estrutura VDOT
    if (workout.workoutDetails) {
      if (workout.workoutDetails.duration) {
        return workout.workoutDetails.duration; // Duração já definida
      }
      
      if (workout.workoutDetails.distance && workout.workoutDetails.pace) {
        // Calcula duração baseada na distância e pace
        const distance = workout.workoutDetails.distance;
        const paceString = workout.workoutDetails.pace;
        const [minutes, seconds] = paceString.split(':').map(Number);
        const paceInMinutes = minutes + (seconds / 60);
        return Math.round(distance * paceInMinutes);
      }
      
      if (workout.workoutDetails.intervals) {
        // Treino intervalado
        const intervals = workout.workoutDetails.intervals;
        const intervalDuration = workout.workoutDetails.intervalDuration;
        const recoveryTime = workout.workoutDetails.recoveryTime || 2;
        
        // Aquecimento (10min) + intervalos + recuperação + desaquecimento (5min)
        const totalIntervalTime = intervals * intervalDuration;
        const totalRecoveryTime = (intervals - 1) * recoveryTime;
        return 15 + totalIntervalTime + totalRecoveryTime; // 15min = aquec + desaq
      }
    }
    
    // Fallback para estrutura antiga
    const distance = parseFloat(workout.distance) || 0;
    const basePaceMinutes = 6; // 6:00/km assumed base pace
    return Math.round(distance * basePaceMinutes);
  };

  const getWarmupSuggestions = (workoutType: string) => {
    switch (workoutType?.toLowerCase()) {
      case 'interval':
      case 'tiros':
        return [
          '🚶‍♂️ 5 min caminhada rápida',
          '🏃‍♂️ 10-15 min corrida leve',
          '🦵 Alongamento dinâmico (5 min)',
          '⚡ 4-6 tiros de 100m progressivos',
          '🏃‍♂️ 5 min corrida recuperação'
        ];
      case 'tempo':
        return [
          '🚶‍♂️ 3 min caminhada',
          '🏃‍♂️ 10-12 min corrida leve',
          '🦵 Alongamento dinâmico (3 min)',
          '⚡ 3-4 acelerações de 80m',
          '🏃‍♂️ 3 min corrida leve'
        ];
      case 'long':
      case 'longao':
        return [
          '🚶‍♂️ 3-5 min caminhada',
          '🏃‍♂️ 8-10 min corrida bem leve',
          '🦵 Mobilidade articular (2 min)'
        ];
      case 'recovery':
      case 'regenerativo':
        return [
          '🚶‍♂️ 2-3 min caminhada',
          '🏃‍♂️ 5 min corrida muito leve',
          '🧘‍♂️ Foco na respiração'
        ];
      case 'easy':
        return [
          '🚶‍♂️ 3-5 min caminhada',
          '🏃‍♂️ 5-8 min corrida muito leve',
          '🦵 Mobilidade básica (2 min)'
        ];
      default:
        return [
          '🚶‍♂️ 5 min caminhada',
          '🏃‍♂️ 10 min corrida leve',
          '🦵 Alongamento dinâmico'
        ];
    }
  };

  const getCooldownSuggestions = () => {
    return [
      '🏃‍♂️ 5-10 min corrida leve',
      '🚶‍♂️ 3-5 min caminhada',
      '🧘‍♂️ Alongamento estático (10 min)',
      '💧 Hidratação adequada',
      '🍌 Reposição nutricional'
    ];
  };

  const estimatedDuration = getEstimatedDuration(workout);
  const warmupSuggestions = getWarmupSuggestions(workout.type);
  const cooldownSuggestions = getCooldownSuggestions();

  return (
    <>
      <Stack.Screen 
        options={{
          title: `${getWorkoutEmoji(workout.type)} ${workout.name || 'Treino'}`,
          headerBackTitle: "Voltar",
          headerStyle: {
            backgroundColor: ProRunnerColors.background,
          },
          headerTintColor: ProRunnerColors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Detalhes do Treino',
                  'Aqui você encontra todas as informações detalhadas do seu treino: paces específicos, tempo estimado, sugestões de aquecimento e desaquecimento.',
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
          {/* Workout Overview */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewEmoji}>{getWorkoutEmoji(workout.type)}</Text>
              <View style={styles.overviewInfo}>
                <Text style={styles.overviewTitle}>{getWorkoutName(workout.type)}</Text>
                <Text style={styles.overviewSubtitle}>Semana {weekNumber} • {dayName}</Text>
              </View>
              <View style={styles.overviewBadge}>
                <Text style={styles.badgeText}>
                  {workout.workoutDetails ? 
                    (workout.workoutDetails.distance ? `${workout.workoutDetails.distance}km` :
                     workout.workoutDetails.duration ? `${workout.workoutDetails.duration}min` :
                     workout.workoutDetails.intervals ? `${workout.workoutDetails.intervals}x${workout.workoutDetails.intervalDuration}min` :
                     'Treino') :
                    `${workout.distance || 0}km`}
                </Text>
              </View>
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Tempo Estimado</Text>
                <Text style={styles.statValue}>{estimatedDuration} min</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Pace Alvo</Text>
                <Text style={styles.statValue}>
                  {workout.workoutDetails?.pace || workout.paceInfo?.mainPace || 'N/A'}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Zona</Text>
                <Text style={styles.statValue}>
                  {workout.type === 'easy' ? 'Aeróbica' :
                   workout.type === 'long' ? 'Aeróbica' :
                   workout.type === 'tempo' ? 'Limiar' :
                   workout.type === 'interval' ? 'VO2 Max' :
                   workout.type === 'recovery' ? 'Regenerativa' : 'Base'}
                </Text>
              </View>
            </View>
          </View>

          {/* VDOT Workout Details */}
          {workout.workoutDetails && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Detalhes do Treino (VDOT)</Text>
              <View style={styles.paceCard}>
                <View style={styles.paceRow}>
                  <Text style={styles.paceLabel}>Pace Alvo:</Text>
                  <Text style={styles.paceValue}>{workout.workoutDetails.pace}/km</Text>
                </View>
                
                {workout.workoutDetails.distance && (
                  <View style={styles.paceRow}>
                    <Text style={styles.paceLabel}>Distância:</Text>
                    <Text style={styles.paceValue}>{workout.workoutDetails.distance}km</Text>
                  </View>
                )}
                
                {workout.workoutDetails.duration && (
                  <View style={styles.paceRow}>
                    <Text style={styles.paceLabel}>Duração:</Text>
                    <Text style={styles.paceValue}>{workout.workoutDetails.duration} min</Text>
                  </View>
                )}
                
                {workout.workoutDetails.intervals && (
                  <>
                    <View style={styles.paceRow}>
                      <Text style={styles.paceLabel}>Intervalos:</Text>
                      <Text style={styles.paceValue}>{workout.workoutDetails.intervals}x</Text>
                    </View>
                    <View style={styles.paceRow}>
                      <Text style={styles.paceLabel}>Duração do Intervalo:</Text>
                      <Text style={styles.paceValue}>{workout.workoutDetails.intervalDuration} min</Text>
                    </View>
                    {workout.workoutDetails.recoveryTime && (
                      <View style={styles.paceRow}>
                        <Text style={styles.paceLabel}>Recuperação:</Text>
                        <Text style={styles.paceValue}>{workout.workoutDetails.recoveryTime} min</Text>
                      </View>
                    )}
                  </>
                )}
                
                <Text style={styles.paceDescription}>{workout.workoutDetails.description}</Text>
              </View>
              
              {workout.detailedDescription && (
                <View style={styles.detailedDescriptionCard}>
                  <Text style={styles.detailedDescriptionText}>{workout.detailedDescription}</Text>
                </View>
              )}
              
              {workout.tips && (
                <View style={styles.tipsCard}>
                  <Text style={styles.tipsTitle}>💡 Dica Específica:</Text>
                  <Text style={styles.tipText}>{workout.tips}</Text>
                </View>
              )}
            </View>
          )}

          {/* Pace Information */}
          {workout.paceInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏱️ Informações de Pace</Text>
              <View style={styles.paceCard}>
                <View style={styles.paceRow}>
                  <Text style={styles.paceLabel}>Pace Principal:</Text>
                  <Text style={styles.paceValue}>{workout.paceInfo.mainPace}</Text>
                </View>
                {workout.paceInfo.zone && (
                  <View style={styles.paceRow}>
                    <Text style={styles.paceLabel}>Zona de Treino:</Text>
                    <Text style={styles.zoneValue}>{workout.paceInfo.zone}</Text>
                  </View>
                )}
                {workout.paceInfo.effort && (
                  <Text style={styles.paceDescription}>{workout.paceInfo.effort}</Text>
                )}
              </View>
            </View>
          )}

          {/* Detailed Structure for Interval Workouts */}
          {workout.detailedStructure && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Estrutura Detalhada</Text>
              
              {workout.detailedStructure.warmup && (
                <View style={styles.structureCard}>
                  <Text style={styles.structureTitle}>🔥 Aquecimento</Text>
                  <View style={styles.structureRow}>
                    <Text style={styles.structureLabel}>Distância:</Text>
                    <Text style={styles.structureValue}>{workout.detailedStructure.warmup.distance}</Text>
                  </View>
                  <View style={styles.structureRow}>
                    <Text style={styles.structureLabel}>Pace:</Text>
                    <Text style={styles.structureValue}>{workout.detailedStructure.warmup.pace}</Text>
                  </View>
                  <Text style={styles.structureDescription}>{workout.detailedStructure.warmup.description}</Text>
                </View>
              )}

              {workout.detailedStructure.intervals && (
                <View style={styles.structureCard}>
                  <Text style={styles.structureTitle}>⚡ Série Principal</Text>
                  <View style={styles.structureRow}>
                    <Text style={styles.structureLabel}>Repetições:</Text>
                    <Text style={styles.structureValue}>{workout.detailedStructure.intervals.repetitions}x</Text>
                  </View>
                  <View style={styles.structureRow}>
                    <Text style={styles.structureLabel}>Distância:</Text>
                    <Text style={styles.structureValue}>{workout.detailedStructure.intervals.distance}</Text>
                  </View>
                  <View style={styles.structureRow}>
                    <Text style={styles.structureLabel}>Pace:</Text>
                    <Text style={styles.structureValue}>{workout.detailedStructure.intervals.pace}</Text>
                  </View>
                  <View style={styles.structureRow}>
                    <Text style={styles.structureLabel}>Recuperação:</Text>
                    <Text style={styles.structureValue}>{workout.detailedStructure.intervals.recovery}</Text>
                  </View>
                  <Text style={styles.structureDescription}>{workout.detailedStructure.intervals.description}</Text>
                </View>
              )}

              {workout.detailedStructure.cooldown && (
                <View style={styles.structureCard}>
                  <Text style={styles.structureTitle}>❄️ Desaquecimento</Text>
                  <View style={styles.structureRow}>
                    <Text style={styles.structureLabel}>Distância:</Text>
                    <Text style={styles.structureValue}>{workout.detailedStructure.cooldown.distance}</Text>
                  </View>
                  <View style={styles.structureRow}>
                    <Text style={styles.structureLabel}>Pace:</Text>
                    <Text style={styles.structureValue}>{workout.detailedStructure.cooldown.pace}</Text>
                  </View>
                  <Text style={styles.structureDescription}>{workout.detailedStructure.cooldown.description}</Text>
                </View>
              )}
            </View>
          )}

          {/* Warmup Suggestions */}
          <CollapsibleSection 
            title="Aquecimento" 
            icon="🔥" 
            defaultExpanded={false}
            color="#FF6B35"
          >
            {warmupSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionRow}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </CollapsibleSection>

          {/* Cooldown Suggestions */}
          <CollapsibleSection 
            title="Desaquecimento" 
            icon="❄️" 
            defaultExpanded={false}
            color="#4A90E2"
          >
            {cooldownSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionRow}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </CollapsibleSection>

          {/* Training Tips */}
          <CollapsibleSection 
            title="Dicas de Treino" 
            icon="💡" 
            defaultExpanded={true}
            color="#F5A623"
          >
            <View style={styles.tipsCard}>
              {(workout.type === 'interval' || workout.type === 'tiros') && (
                <>
                  <Text style={styles.tipText}>• Aquecimento é fundamental para evitar lesões</Text>
                  <Text style={styles.tipText}>• Mantenha o pace alvo durante os intervalos</Text>
                  <Text style={styles.tipText}>• Use a recuperação para se preparar para o próximo tiro</Text>
                  <Text style={styles.tipText}>• Se não conseguir manter o pace, reduza a intensidade</Text>
                </>
              )}
              {(workout.type === 'long' || workout.type === 'longao') && (
                <>
                  <Text style={styles.tipText}>• Mantenha conversação durante o treino</Text>
                  <Text style={styles.tipText}>• Hidrate-se adequadamente</Text>
                  <Text style={styles.tipText}>• Foque na duração, não na velocidade</Text>
                  <Text style={styles.tipText}>• Varie o terreno se possível</Text>
                </>
              )}
              {workout.type === 'tempo' && (
                <>
                  <Text style={styles.tipText}>• Pace &ldquo;comfortavelmente difícil&rdquo;</Text>
                  <Text style={styles.tipText}>• Mantenha consistência durante todo o treino</Text>
                  <Text style={styles.tipText}>• Concentre-se na respiração</Text>
                  <Text style={styles.tipText}>• Evite começar muito rápido</Text>
                </>
              )}
              {(workout.type === 'recovery' || workout.type === 'regenerativo') && (
                <>
                  <Text style={styles.tipText}>• Ritmo bem tranquilo, foque na recuperação</Text>
                  <Text style={styles.tipText}>• Ouça seu corpo e ajuste o pace se necessário</Text>
                  <Text style={styles.tipText}>• Aproveite para trabalhar a técnica de corrida</Text>
                  <Text style={styles.tipText}>• Hidrate-se bem após o treino</Text>
                </>
              )}
              {workout.type === 'easy' && (
                <>
                  <Text style={styles.tipText}>• Ritmo que permite conversa fácil</Text>
                  <Text style={styles.tipText}>• Desenvolve a base aeróbica</Text>
                  <Text style={styles.tipText}>• Não se preocupe com velocidade</Text>
                  <Text style={styles.tipText}>• Foque na constância e regularidade</Text>
                </>
              )}
              {workout.type === 'fartlek' && (
                <>
                  <Text style={styles.tipText}>• Varie o ritmo conforme o terreno e disposição</Text>
                  <Text style={styles.tipText}>• Intercale períodos rápidos com recuperação</Text>
                  <Text style={styles.tipText}>• Seja criativo - use referências no terreno</Text>
                  <Text style={styles.tipText}>• Divirta-se! Fartlek significa &ldquo;brincadeira de velocidade&rdquo;</Text>
                </>
              )}
            </View>
          </CollapsibleSection>

          <View style={styles.spacer} />
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
  scrollView: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
  overviewCard: {
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
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ProRunnerColors.textPrimary,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginTop: 2,
  },
  overviewBadge: {
    backgroundColor: ProRunnerColors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ProRunnerColors.textPrimary,
    marginBottom: 12,
  },
  paceCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paceLabel: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  paceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.primary,
  },
  zoneValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.accent,
  },
  paceDescription: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  structureCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  structureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 12,
  },
  structureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  structureLabel: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  structureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  structureDescription: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  suggestionCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionRow: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: `${ProRunnerColors.primary}30`,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 15,
    color: ProRunnerColors.textPrimary,
    lineHeight: 22,
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: `${ProRunnerColors.border}30`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    color: ProRunnerColors.textPrimary,
    marginBottom: 10,
    lineHeight: 22,
    fontWeight: '500',
  },
  detailedDescriptionCard: {
    backgroundColor: ProRunnerColors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  detailedDescriptionText: {
    fontSize: 13,
    color: ProRunnerColors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  spacer: {
    height: 24,
  },
  tipContainer: {
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.primary,
    marginBottom: 4,
  },
  collapsibleContainer: {
    marginBottom: 16,
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 16,
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: `${ProRunnerColors.border}40`,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${ProRunnerColors.border}20`,
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ProRunnerColors.textPrimary,
    flex: 1,
  },
  collapsibleContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: ProRunnerColors.background,
  },
  nutritionCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionSection: {
    marginBottom: 12,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  nutritionText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    lineHeight: 20,
  },
  techniqueCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  techniqueSection: {
    marginBottom: 12,
  },
  techniqueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  techniqueText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    lineHeight: 20,
  },
  equipmentCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  equipmentSection: {
    marginBottom: 12,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    lineHeight: 20,
  },
  weatherCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherSection: {
    marginBottom: 12,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  weatherText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    lineHeight: 20,
  },
  collapsibleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  collapsibleIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  chevronContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 