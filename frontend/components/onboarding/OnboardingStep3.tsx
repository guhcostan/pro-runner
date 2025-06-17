import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
  { time: '18:00', label: 'Avançado - Sub 18min', emoji: '🏃‍♂️💨', color: '#8B5CF6', description: 'Atleta de alto nível' },
  { time: '20:00', label: 'Intermediário - ~20min', emoji: '🏃‍♂️', color: '#3B82F6', description: 'Corredor experiente' },
  { time: '25:00', label: 'Recreativo - ~25min', emoji: '🚶‍♂️', color: '#10B981', description: 'Corredor regular' },
  { time: '30:00', label: 'Iniciante - ~30min', emoji: '🚶', color: '#F59E0B', description: 'Começando a correr' },
  { time: '35:00', label: 'Sedentário - ~35min', emoji: '🧘‍♂️', color: '#6B7280', description: 'Pouco exercício' },
  { time: '40:00', label: 'Nunca corri 5K', emoji: '🤷‍♂️', color: '#EF4444', description: 'Primeira vez' },
];

export default function OnboardingStep3({
  personalRecord,
  onUpdatePersonalRecord,
  onNext,
  onBack,
  error,
}: OnboardingStep3Props) {
  const [mode, setMode] = useState<'input' | 'level' | null>(null);

  const handleSelectTime = (time: string) => {
    onUpdatePersonalRecord(time);
  };

  const handleInputChange = (value: string) => {
    onUpdatePersonalRecord(value);
  };

  const resetMode = () => {
    setMode(null);
    onUpdatePersonalRecord('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>⏱️</Text>
          <Text style={styles.title}>Seu tempo nos 5K</Text>
          <Text style={styles.subtitle}>
            Vamos descobrir seu ritmo atual para criar o plano perfeito
          </Text>
        </View>

        {!mode && (
          <View style={styles.modeSelection}>
            <Text style={styles.sectionTitle}>Como você prefere informar seu pace?</Text>
            
            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => setMode('input')}
            >
              <View style={styles.modeCardContent}>
                <Text style={styles.modeEmoji}>🎯</Text>
                <View style={styles.modeText}>
                  <Text style={styles.modeTitle}>Sei meu tempo</Text>
                  <Text style={styles.modeDescription}>
                    Digitar meu melhor tempo nos 5K
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => setMode('level')}
            >
              <View style={styles.modeCardContent}>
                <Text style={styles.modeEmoji}>🤔</Text>
                <View style={styles.modeText}>
                  <Text style={styles.modeTitle}>Não sei meu tempo</Text>
                  <Text style={styles.modeDescription}>
                    Escolher baseado no meu nível de atividade
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'input' && (
          <View style={styles.inputMode}>
            <View style={styles.modeHeader}>
              <TouchableOpacity onPress={resetMode} style={styles.backToMode}>
                <Text style={styles.backToModeText}>← Voltar às opções</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Digite seu melhor tempo nos 5K</Text>
            <Text style={styles.inputHint}>
              Se nunca cronometrou, tente estimar baseado em corridas similares
            </Text>

            <View style={styles.inputContainer}>
              <Input
                label="Tempo nos 5K (MM:SS)"
                value={personalRecord}
                onChangeText={handleInputChange}
                placeholder="22:30"
                error={error}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.paceExamples}>
              <Text style={styles.examplesTitle}>Exemplos de ritmos:</Text>
              <Text style={styles.exampleText}>• 18:00 - Atleta avançado</Text>
              <Text style={styles.exampleText}>• 22:00 - Corredor experiente</Text>
              <Text style={styles.exampleText}>• 28:00 - Iniciante regular</Text>
              <Text style={styles.exampleText}>• 35:00 - Primeira vez</Text>
            </View>
          </View>
        )}

        {mode === 'level' && (
          <View style={styles.levelMode}>
            <View style={styles.modeHeader}>
              <TouchableOpacity onPress={resetMode} style={styles.backToMode}>
                <Text style={styles.backToModeText}>← Voltar às opções</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Escolha seu nível atual</Text>
            <Text style={styles.levelHint}>
              Selecione a opção que melhor descreve sua condição física atual
            </Text>
            
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
                    <View style={styles.timeCardText}>
                      <Text style={[
                        styles.timeText,
                        personalRecord === option.time && styles.timeTextSelected,
                      ]}>
                        {option.time}
                      </Text>
                      <Text style={[
                        styles.timeLabelText,
                        personalRecord === option.time && styles.timeLabelTextSelected,
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.timeDescription,
                    personalRecord === option.time && styles.timeDescriptionSelected,
                  ]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

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
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
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
    paddingHorizontal: 16,
  },
  modeSelection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modeCard: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  modeText: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    lineHeight: 20,
  },
  inputMode: {
    marginBottom: 24,
  },
  levelMode: {
    marginBottom: 24,
  },
  modeHeader: {
    marginBottom: 20,
  },
  backToMode: {
    alignSelf: 'flex-start',
  },
  backToModeText: {
    fontSize: 16,
    color: ProRunnerColors.primary,
    fontWeight: '500',
  },
  inputHint: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  levelHint: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  paceExamples: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  levelEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  timeCardText: {
    flex: 1,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 2,
  },
  timeTextSelected: {
    color: ProRunnerColors.primary,
  },
  timeLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textSecondary,
  },
  timeLabelTextSelected: {
    color: ProRunnerColors.textPrimary,
  },
  timeDescription: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    fontStyle: 'italic',
  },
  timeDescriptionSelected: {
    color: ProRunnerColors.textPrimary,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: ProRunnerColors.background,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
}); 