import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../ui/Button';

interface OnboardingStep2Props {
  selectedGoal: string;
  onSelectGoal: (goal: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const goals = [
  { id: 'fazer_5km', title: '5K', subtitle: 'Conseguir correr 5km', emoji: '🎯' },
  { id: 'fazer_10km', title: '10K', subtitle: 'Conseguir correr 10km', emoji: '🚀' },
  { id: 'meia_maratona', title: 'Meia Maratona', subtitle: '21.1km - O grande desafio!', emoji: '🏃‍♂️' },
  { id: 'maratona', title: 'Maratona', subtitle: '42.2km - Para os corajosos!', emoji: '🏆' },
  { id: 'melhorar_tempo_5km', title: 'Melhorar 5K', subtitle: 'Bater meu recorde nos 5km', emoji: '⚡' },
  { id: 'melhorar_tempo_10km', title: 'Melhorar 10K', subtitle: 'Bater meu recorde nos 10km', emoji: '💨' },
  { id: 'voltar_a_correr', title: 'Voltar a Correr', subtitle: 'Retomar o hábito da corrida', emoji: '🔄' },
];

export default function OnboardingStep2({
  selectedGoal,
  onSelectGoal,
  onNext,
  onBack,
}: OnboardingStep2Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Qual seu objetivo?</Text>
        <Text style={styles.subtitle}>
          Vamos criar um plano personalizado para você!
        </Text>
      </View>

      <ScrollView 
        style={styles.goals}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.goalsContent}
      >
        {goals.map((goal) => (
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