import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { Button } from './Button';
import { Workout } from '../../store/userStore';

interface WorkoutPaceInfo {
  pace: string;
  zone: string;
}

interface WorkoutCardProps {
  workout: Workout & { emoji?: string; week?: number };
  paceInfo?: WorkoutPaceInfo | null;
  onStartWorkout?: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  paceInfo,
  onStartWorkout
}) => {
  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'baixa':
      case 'low':
        return ProRunnerColors.success;
      case 'moderada':
      case 'moderate':
        return ProRunnerColors.warning;
      case 'alta':
      case 'high':
        return ProRunnerColors.error;
      case 'muito alta':
      case 'very high':
        return ProRunnerColors.error;
      default:
        return ProRunnerColors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.workoutIcon}>
        <Text style={styles.workoutEmoji}>{workout.emoji || '🏃‍♂️'}</Text>
      </View>
      
      <Text style={styles.workoutTitle}>
        {workout.title || workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
      </Text>
      
      <Text style={styles.workoutDistance}>
        {workout.distance}km • {workout.day}
      </Text>
      
      {/* Workout Details */}
      <View style={styles.workoutDetailsContainer}>
        {paceInfo && (
          <View style={styles.workoutDetail}>
            <Text style={styles.detailLabel}>Pace Alvo:</Text>
            <Text style={styles.detailValue}>{paceInfo.pace}/km</Text>
          </View>
        )}
        
        {paceInfo && (
          <View style={styles.workoutDetail}>
            <Text style={styles.detailLabel}>Zona:</Text>
            <Text style={styles.detailZone}>{paceInfo.zone}</Text>
          </View>
        )}
        
        <View style={styles.workoutDetail}>
          <Text style={styles.detailLabel}>Intensidade:</Text>
          <Text style={[styles.detailValue, { color: getIntensityColor(workout.intensity) }]}>
            {workout.intensity}
          </Text>
        </View>
      </View>
      
      {workout.description && (
        <View style={styles.workoutDescription}>
          <Text style={styles.descriptionTitle}>Descrição:</Text>
          <Text style={styles.descriptionText}>{workout.description}</Text>
        </View>
      )}
      
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
}); 