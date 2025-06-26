import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { t } from '../../constants/i18n';

interface TrainingPhase {
  id: number;
  name: string;
  description: string;
  phase_order: number;
  is_active: boolean;
}

interface TrainingPhaseCardProps {
  currentPhase: TrainingPhase;
  canAdvance: boolean;
  nextPhase?: TrainingPhase | null;
  missingCriteria?: string[];
  onAdvancePress?: () => void;
  style?: any;
}

export const TrainingPhaseCard: React.FC<TrainingPhaseCardProps> = ({
  currentPhase,
  canAdvance,
  nextPhase,
  missingCriteria = [],
  onAdvancePress,
  style,
}) => {
  const getPhaseEmoji = (phaseName: string) => {
    const phaseEmojis: { [key: string]: string } = {
      [t('phase_foundation')]: '🌱',
      'Foundation': '🌱',
      'Fundação': '🌱',
      [t('phase_development')]: '🏃‍♂️',
      'Development': '🏃‍♂️',
      'Desenvolvimento': '🏃‍♂️',
      [t('phase_performance')]: '⚡',
      'Performance': '⚡',
      'Desempenho': '⚡',
      [t('phase_specialization')]: '🎯',
      'Specialization': '🎯',
      'Especialização': '🎯',
      [t('phase_mastery')]: '🏆',
      'Mastery': '🏆',
      'Maestria': '🏆',
    };
    return phaseEmojis[phaseName] || '🏃‍♂️';
  };

  const getPhaseColor = (phaseOrder: number) => {
    const colors = [
      '#4CAF50', // Foundation - Green
      '#FF9800', // Development - Orange  
      '#2196F3', // Performance - Blue
      '#9C27B0', // Specialization - Purple
      '#FF5722', // Mastery - Red
    ];
    return colors[phaseOrder - 1] || '#4CAF50';
  };

  // getPhaseGradient function removed as it was unused

  return (
    <View style={[styles.container, style]}>
      {/* Current Phase Header */}
      <View style={[styles.phaseHeader, { backgroundColor: getPhaseColor(currentPhase.phase_order) }]}>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseEmoji}>
            {getPhaseEmoji(currentPhase.name)}
          </Text>
          <View style={styles.phaseTextContainer}>
            <Text style={styles.phaseName}>{currentPhase.name}</Text>
            <Text style={styles.phaseOrder}>
              {t('phase_advancement')} {currentPhase.phase_order} de 5
            </Text>
          </View>
        </View>
      </View>

      {/* Phase Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.phaseDescription}>
          {currentPhase.description}
        </Text>
      </View>

      {/* Phase Progress Indicators */}
      <View style={styles.progressIndicators}>
        {Array.from({ length: 5 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index < currentPhase.phase_order 
                  ? getPhaseColor(currentPhase.phase_order)
                  : ProRunnerColors.border,
              }
            ]}
          />
        ))}
      </View>

      {/* Advancement Section */}
      {nextPhase ? (
        <View style={styles.advancementContainer}>
          <View style={styles.nextPhaseInfo}>
            <Text style={styles.nextPhaseLabel}>{t('next_phase')}:</Text>
            <Text style={styles.nextPhaseName}>
              {getPhaseEmoji(nextPhase.name)} {nextPhase.name}
            </Text>
          </View>

          {canAdvance ? (
            <TouchableOpacity 
              style={[styles.advanceButton, { backgroundColor: getPhaseColor(nextPhase.phase_order) }]}
              onPress={onAdvancePress}
            >
              <Text style={styles.advanceButtonText}>
                🚀 {t('advance_to_phase', { phase: nextPhase.name })}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.criteriaContainer}>
              <Text style={styles.criteriaTitle}>
                📋 {t('advancement_criteria')}
              </Text>
              {missingCriteria.map((criteria, index) => (
                <Text key={index} style={styles.criteriaItem}>
                  • {criteria}
                </Text>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.masteryContainer}>
          <Text style={styles.masteryText}>
            🏆 {t('mastery_reached')}
          </Text>
          <Text style={styles.masterySubtext}>
            {t('mastery_message')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  phaseHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  phaseTextContainer: {
    flex: 1,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  phaseOrder: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  descriptionContainer: {
    padding: 20,
    paddingTop: 16,
  },
  phaseDescription: {
    fontSize: 15,
    color: ProRunnerColors.textPrimary,
    lineHeight: 22,
  },
  progressIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  advancementContainer: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: ProRunnerColors.border,
  },
  nextPhaseInfo: {
    marginBottom: 16,
  },
  nextPhaseLabel: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
  },
  nextPhaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  advanceButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  advanceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  criteriaContainer: {
    backgroundColor: ProRunnerColors.background,
    borderRadius: 12,
    padding: 16,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 12,
  },
  criteriaItem: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 6,
    paddingLeft: 8,
  },
  masteryContainer: {
    padding: 20,
    paddingTop: 0,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ProRunnerColors.border,
  },
  masteryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  masterySubtext: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
  },
}); 