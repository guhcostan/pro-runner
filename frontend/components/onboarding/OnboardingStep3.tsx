import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface OnboardingStep3Props {
  personalRecord: string;
  onUpdatePersonalRecord: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  error?: string;
}

const fitnessLevels = [
  { time: '18:00', label: 'Avançado - Sub 18min', emoji: '🏃‍♂️💨', color: '#8B5CF6' },
  { time: '20:00', label: 'Intermediário - ~20min', emoji: '🏃‍♂️', color: '#3B82F6' },
  { time: '25:00', label: 'Recreativo - ~25min', emoji: '🚶‍♂️', color: '#10B981' },
  { time: '30:00', label: 'Iniciante - ~30min', emoji: '🚶', color: '#F59E0B' },
  { time: '35:00', label: 'Sedentário - ~35min', emoji: '🧘‍♂️', color: '#6B7280' },
  { time: '40:00', label: 'Nunca corri 5K', emoji: '🤷‍♂️', color: '#EF4444' },
];

export default function OnboardingStep3({
  personalRecord,
  onUpdatePersonalRecord,
  onNext,
  onBack,
  error,
}: OnboardingStep3Props) {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelectTime = (time: string) => {
    onUpdatePersonalRecord(time);
    setShowCustomInput(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>⏱️</Text>
        <Text style={styles.title}>Seu tempo nos 5K</Text>
        <Text style={styles.subtitle}>
          Qual seu melhor tempo? Se nunca correu 5K, escolha uma estimativa
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Escolha seu nível de condicionamento:</Text>
        
        <View style={styles.timeOptions}>
          {fitnessLevels.map((option) => (
            <TouchableOpacity
              key={option.time}
              style={[
                styles.timeCard,
                personalRecord === option.time && styles.timeCardSelected,
                { borderLeftWidth: 4, borderLeftColor: option.color }
              ]}
              onPress={() => handleSelectTime(option.time)}
            >
              <View style={styles.timeCardHeader}>
                <Text style={styles.levelEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.timeText,
                  personalRecord === option.time && styles.timeTextSelected,
                ]}>
                  {option.time}
                </Text>
              </View>
              <Text style={[
                styles.timeLabelText,
                personalRecord === option.time && styles.timeLabelTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.orText}>ou se souber seu tempo exato</Text>

        <TouchableOpacity
          style={[
            styles.customButton,
            showCustomInput && styles.customButtonActive,
          ]}
          onPress={() => setShowCustomInput(!showCustomInput)}
        >
          <Text style={styles.customButtonText}>
            ⏱️ Inserir meu tempo personalizado
          </Text>
        </TouchableOpacity>

        {showCustomInput && (
          <View style={styles.customInput}>
            <Input
              label="Tempo nos 5K (MM:SS)"
              value={personalRecord}
              onChangeText={onUpdatePersonalRecord}
              placeholder="22:30"
              error={error}
            />
          </View>
        )}
      </View>

      <View style={styles.buttons}>
        <Button
          title="Voltar"
          onPress={onBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Próximo"
          onPress={onNext}
          disabled={!personalRecord}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  timeOptions: {
    marginBottom: 24,
  },
  timeCard: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeCardSelected: {
    borderColor: ProRunnerColors.primary,
    backgroundColor: `${ProRunnerColors.primary}15`,
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
  },
  timeTextSelected: {
    color: ProRunnerColors.primary,
  },
  timeLabelText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  timeLabelTextSelected: {
    color: ProRunnerColors.textPrimary,
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    marginBottom: 16,
  },
  customButton: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 16,
  },
  customButtonActive: {
    borderColor: ProRunnerColors.primary,
  },
  customButtonText: {
    fontSize: 16,
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  customInput: {
    marginBottom: 16,
  },
  neverRanButton: {
    padding: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  neverRanText: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
}); 