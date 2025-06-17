import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProRunnerColors } from '../../constants/Colors';
import { Button } from './Button';
import { Workout } from '../../store/userStore';

interface WorkoutCardProps {
  workout: Workout & { emoji?: string; week?: number };
  onStartWorkout?: () => void;
}

// Componente para seções colapsáveis dentro do card
const CardCollapsibleSection: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}> = ({ title, icon, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.cardCollapsibleContainer}>
      <TouchableOpacity 
        style={styles.cardCollapsibleHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardCollapsibleTitle}>{icon} {title}</Text>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={ProRunnerColors.primary} 
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.cardCollapsibleContent}>
          {children}
        </View>
      )}
    </View>
  );
};

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onStartWorkout
}) => {
  // Mapeia tipos de treino para emojis e nomes em português
  const getWorkoutInfo = (type: string) => {
    const workoutMap = {
      'easy': { emoji: '🚶‍♂️', name: 'Corrida Leve', color: ProRunnerColors.success },
      'long': { emoji: '🏃‍♂️', name: 'Longão', color: ProRunnerColors.accent },
      'interval': { emoji: '⚡', name: 'Tiros', color: ProRunnerColors.error },
      'tempo': { emoji: '🔥', name: 'Tempo', color: ProRunnerColors.warning },
      'recovery': { emoji: '🧘‍♂️', name: 'Regenerativo', color: ProRunnerColors.success }
    };
    return workoutMap[type as keyof typeof workoutMap] || { 
      emoji: '🏃‍♂️', 
      name: type.charAt(0).toUpperCase() + type.slice(1), 
      color: ProRunnerColors.textSecondary 
    };
  };

  const workoutInfo = getWorkoutInfo(workout.type);

  // Formata informações do treino baseado no tipo
  const formatWorkoutInfo = () => {
    const { workoutDetails } = workout;
    
    if (workoutDetails.distance) {
      return `${workoutDetails.distance}km • ${workout.day}`;
    } else if (workoutDetails.duration) {
      return `${workoutDetails.duration}min • ${workout.day}`;
    } else if (workoutDetails.intervals) {
      return `${workoutDetails.intervals}x${workoutDetails.intervalDuration}min • ${workout.day}`;
    }
    return workout.day;
  };

  // Extrai zona de treino da descrição do pace
  const getTrainingZone = (type: string) => {
    const zoneMap = {
      'easy': 'Zona Aeróbica',
      'long': 'Zona Aeróbica',
      'interval': 'Zona VO2 Max',
      'tempo': 'Zona Limiar',
      'recovery': 'Zona Regenerativa'
    };
    return zoneMap[type as keyof typeof zoneMap] || 'Zona Base';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.workoutIcon, { backgroundColor: workoutInfo.color + '20' }]}>
        <Text style={styles.workoutEmoji}>{workout.emoji || workoutInfo.emoji}</Text>
      </View>
      
      <Text style={styles.workoutTitle}>
        {workoutInfo.name}
      </Text>
      
      <Text style={styles.workoutDistance}>
        {formatWorkoutInfo()}
      </Text>
      
      {/* Collapsible sections */}
      <CardCollapsibleSection title="Detalhes" icon="📊">
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Distância:</Text>
            <Text style={styles.detailValue}>{workout.workoutDetails?.distance || 'N/A'}km</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duração estimada:</Text>
            <Text style={styles.detailValue}>{workout.workoutDetails?.duration || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Intensidade:</Text>
            <Text style={styles.detailValue}>{getTrainingZone(workout.type)}</Text>
          </View>
        </View>
      </CardCollapsibleSection>

      <CardCollapsibleSection title="Descrição" icon="📝">
        <Text style={styles.description}>
          {workout.workoutDetails?.description || 'Treino focado no desenvolvimento da capacidade aeróbica e resistência.'}
        </Text>
      </CardCollapsibleSection>

      <CardCollapsibleSection title="Dicas" icon="💡">
        <View style={styles.tipsContainer}>
          {workout.type === 'interval' && (
            <>
              <Text style={styles.tipText}>• Aquecimento é fundamental</Text>
              <Text style={styles.tipText}>• Mantenha o pace alvo</Text>
              <Text style={styles.tipText}>• Use a recuperação adequadamente</Text>
            </>
          )}
          {workout.type === 'long' && (
            <>
              <Text style={styles.tipText}>• Mantenha conversação</Text>
              <Text style={styles.tipText}>• Foque na duração</Text>
              <Text style={styles.tipText}>• Hidrate-se adequadamente</Text>
            </>
          )}
          {workout.type === 'tempo' && (
            <>
              <Text style={styles.tipText}>• Pace &ldquo;comfortavelmente difícil&rdquo;</Text>
              <Text style={styles.tipText}>• Mantenha consistência</Text>
              <Text style={styles.tipText}>• Concentre-se na respiração</Text>
            </>
          )}
          {workout.type === 'recovery' && (
            <>
              <Text style={styles.tipText}>• Ritmo bem tranquilo</Text>
              <Text style={styles.tipText}>• Foque na recuperação</Text>
              <Text style={styles.tipText}>• Trabalhe a técnica</Text>
            </>
          )}
          {workout.type === 'easy' && (
            <>
              <Text style={styles.tipText}>• Ritmo de conversa fácil</Text>
              <Text style={styles.tipText}>• Desenvolve base aeróbica</Text>
              <Text style={styles.tipText}>• Foque na constância</Text>
            </>
          )}
        </View>
      </CardCollapsibleSection>
      
      {onStartWorkout && (
        <Button
          title="🏃‍♂️ Começar Treino"
          onPress={onStartWorkout}
          style={styles.startButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ProRunnerColors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  workoutIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  },
  workoutDistance: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: ProRunnerColors.background,
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
  description: {
    fontSize: 14,
    color: ProRunnerColors.textPrimary,
    lineHeight: 20,
  },
  tipsContainer: {
    width: '100%',
  },
  tipText: {
    fontSize: 14,
    color: ProRunnerColors.textPrimary,
    lineHeight: 20,
    marginBottom: 6,
  },
  startButton: {
    width: '100%',
  },
  cardCollapsibleContainer: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: ProRunnerColors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardCollapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ProRunnerColors.background,
  },
  cardCollapsibleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  cardCollapsibleContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: ProRunnerColors.surface,
  },
}); 