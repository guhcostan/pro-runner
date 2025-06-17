import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../ui/Button';

interface OnboardingStep2Props {
  selectedGoal: string;
  onSelectGoal: (goal: string) => void;
  onNext: () => void;
  onBack: () => void;
  personalRecord5k: string; // Para determinar o nível do usuário
}

// Função para determinar o nível do usuário baseado no tempo de 5k
function getUserLevel(personalRecord5k: string): 'beginner' | 'intermediate' | 'advanced' {
  const [minutes, seconds] = personalRecord5k.split(':').map(Number);
  const totalSeconds = minutes * 60 + seconds;
  const pacePerKm = totalSeconds / 5; // pace por km em segundos
  
  if (pacePerKm <= 240) { // < 4:00/km
    return 'advanced';
  } else if (pacePerKm <= 360) { // 4:00-6:00/km
    return 'intermediate';
  } else { // > 6:00/km
    return 'beginner';
  }
}

// Objetivos disponíveis por nível
const goalsByLevel = {
  beginner: [
    { id: 'start_running', title: 'Começar a Correr', subtitle: 'Dar os primeiros passos na corrida', emoji: '🚶‍♂️' },
    { id: 'run_5k', title: 'Correr 5km', subtitle: 'Completar minha primeira corrida de 5km', emoji: '🎯' },
  ],
  intermediate: [
    { id: 'start_running', title: 'Começar a Correr', subtitle: 'Dar os primeiros passos na corrida', emoji: '🚶‍♂️' },
    { id: 'run_5k', title: 'Correr 5km', subtitle: 'Completar minha primeira corrida de 5km', emoji: '🎯' },
    { id: 'run_10k', title: 'Correr 10km', subtitle: 'Conquistar a distância de 10 quilômetros', emoji: '🏃‍♂️' },
    { id: 'half_marathon', title: 'Meia Maratona', subtitle: 'Completar os 21km da meia maratona', emoji: '🏃‍♀️' },
    { id: 'improve_time', title: 'Melhorar Tempo', subtitle: 'Bater meu recorde pessoal atual', emoji: '⚡' },
  ],
  advanced: [
    { id: 'start_running', title: 'Começar a Correr', subtitle: 'Dar os primeiros passos na corrida', emoji: '🚶‍♂️' },
    { id: 'run_5k', title: 'Correr 5km', subtitle: 'Completar minha primeira corrida de 5km', emoji: '🎯' },
    { id: 'run_10k', title: 'Correr 10km', subtitle: 'Conquistar a distância de 10 quilômetros', emoji: '🏃‍♂️' },
    { id: 'half_marathon', title: 'Meia Maratona', subtitle: 'Completar os 21km da meia maratona', emoji: '🏃‍♀️' },
    { id: 'marathon', title: 'Maratona', subtitle: 'Conquistar os 42km da maratona completa', emoji: '🏆' },
    { id: 'improve_time', title: 'Melhorar Tempo', subtitle: 'Bater meu recorde pessoal atual', emoji: '⚡' },
  ],
};

// Mensagens explicativas por nível
const levelMessages = {
  beginner: 'Com base no seu tempo atual, estes objetivos são ideais para começar de forma segura:',
  intermediate: 'Ótimo ritmo! Você pode escolher entre estes objetivos progressivos:',
  advanced: 'Excelente forma física! Todos os objetivos estão disponíveis para você:',
};

export default function OnboardingStep2({
  selectedGoal,
  onSelectGoal,
  onNext,
  onBack,
  personalRecord5k,
}: OnboardingStep2Props) {
  const userLevel = getUserLevel(personalRecord5k);
  const availableGoals = goalsByLevel[userLevel];
  const levelMessage = levelMessages[userLevel];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Qual seu objetivo?</Text>
        <Text style={styles.subtitle}>
          {levelMessage}
        </Text>
      </View>

      <ScrollView 
        style={styles.goals}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.goalsContent}
      >
        {availableGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              selectedGoal === goal.id && styles.goalCardSelected,
            ]}
            onPress={() => onSelectGoal(goal.id)}
          >
            <Text style={styles.goalEmoji}>{goal.emoji}</Text>
            <View style={styles.goalContent}>
              <Text style={[
                styles.goalTitle,
                selectedGoal === goal.id && styles.goalTitleSelected,
              ]}>
                {goal.title}
              </Text>
              <Text style={[
                styles.goalSubtitle,
                selectedGoal === goal.id && styles.goalSubtitleSelected,
              ]}>
                {goal.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
          disabled={!selectedGoal}
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
  goals: {
    flex: 1,
  },
  goalsContent: {
    paddingBottom: 20,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: ProRunnerColors.primary,
    backgroundColor: `${ProRunnerColors.primary}15`,
  },
  goalEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  goalTitleSelected: {
    color: ProRunnerColors.primary,
  },
  goalSubtitle: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  goalSubtitleSelected: {
    color: ProRunnerColors.textPrimary,
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