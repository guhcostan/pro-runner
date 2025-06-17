import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../ui/Button';

interface OnboardingStep2_5Props {
  goalDate: Date | null;
  onSelectDate: (date: Date) => void;
  onNext: () => void;
  onBack: () => void;
  selectedGoal: string;
}

// Função para obter o nome do objetivo em português
function getGoalName(goalId: string): string {
  const goalNames = {
    start_running: 'Começar a Correr',
    run_5k: 'Corrida de 5km',
    run_10k: 'Corrida de 10km',
    half_marathon: 'Meia Maratona',
    marathon: 'Maratona',
    improve_time: 'Melhorar Tempo',
  };
  return goalNames[goalId as keyof typeof goalNames] || 'Objetivo';
}

// Função para calcular durações mínimas e máximas por objetivo
function getRecommendedTrainingDuration(goalId: string): { min: number; max: number; recommended: number } {
  const durations = {
    start_running: { min: 6, max: 12, recommended: 8 },
    run_5k: { min: 6, max: 12, recommended: 8 },
    run_10k: { min: 8, max: 16, recommended: 10 },
    half_marathon: { min: 12, max: 20, recommended: 16 },
    marathon: { min: 16, max: 24, recommended: 20 },
    improve_time: { min: 8, max: 16, recommended: 12 },
  };
  return durations[goalId as keyof typeof durations] || durations.run_5k;
}

export default function OnboardingStep2_5({
  goalDate,
  onSelectDate,
  onNext,
  onBack,
  selectedGoal,
}: OnboardingStep2_5Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const goalName = getGoalName(selectedGoal);
  const duration = getRecommendedTrainingDuration(selectedGoal);
  
  // Data mínima: hoje + período mínimo de treino
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + (duration.min * 7));
  
  // Data máxima: hoje + 1 ano
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  // Data sugerida: hoje + período recomendado
  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + (duration.recommended * 7));

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      // Validar se a data está dentro do período recomendado
      if (selectedDate < minDate) {
        Alert.alert(
          'Data muito próxima',
          `Para ${goalName.toLowerCase()}, recomendamos pelo menos ${duration.min} semanas de treino. Escolha uma data a partir de ${minDate.toLocaleDateString('pt-BR')}.`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      if (selectedDate > maxDate) {
        Alert.alert(
          'Data muito distante',
          'Planos de treino são mais eficazes com objetivos em até 1 ano.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      onSelectDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const handleNext = () => {
    if (!goalDate) {
      Alert.alert(
        'Data necessária',
        'Por favor, selecione a data do seu objetivo para criarmos o plano ideal.',
        [{ text: 'OK' }]
      );
      return;
    }
    onNext();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>📅</Text>
          <Text style={styles.title}>Quando é seu objetivo?</Text>
          <Text style={styles.subtitle}>
            Vamos ajustar seu plano para que você chegue preparado no {goalName.toLowerCase()}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 Recomendações para {goalName}</Text>
          <Text style={styles.infoText}>
            • Tempo mínimo de treino: <Text style={styles.bold}>{duration.min} semanas</Text>
          </Text>
          <Text style={styles.infoText}>
            • Tempo recomendado: <Text style={styles.bold}>{duration.recommended} semanas</Text>
          </Text>
          <Text style={styles.infoText}>
            • Data sugerida: <Text style={styles.bold}>{formatDate(suggestedDate)}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dateSelector}
          onPress={showDatePickerHandler}
        >
          <View style={styles.dateSelectorContent}>
            <Text style={styles.dateSelectorLabel}>Data do Objetivo</Text>
            <Text style={styles.dateSelectorValue}>
              {goalDate ? formatDate(goalDate) : 'Toque para selecionar'}
            </Text>
          </View>
          <Text style={styles.dateSelectorIcon}>📅</Text>
        </TouchableOpacity>

        {goalDate && (
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateText}>
              Perfeito! Você terá{' '}
              <Text style={styles.bold}>
                {Math.ceil((goalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))} semanas
              </Text>{' '}
              para se preparar.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.quickSelect}
          onPress={() => onSelectDate(suggestedDate)}
        >
          <Text style={styles.quickSelectText}>
            ⚡ Usar data sugerida ({duration.recommended} semanas)
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={goalDate || suggestedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}

      <View style={styles.buttons}>
        <Button
          title="Voltar"
          onPress={onBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Próximo"
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </View>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100, // Espaço extra para não sobrepor os botões
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
    paddingHorizontal: 10,
  },
  infoCard: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${ProRunnerColors.primary}20`,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  dateSelector: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: ProRunnerColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSelectorContent: {
    flex: 1,
  },
  dateSelectorLabel: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 4,
  },
  dateSelectorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    flexWrap: 'wrap',
  },
  dateSelectorIcon: {
    fontSize: 24,
    marginLeft: 10,
  },
  selectedDateInfo: {
    backgroundColor: `${ProRunnerColors.success}15`,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${ProRunnerColors.success}30`,
  },
  selectedDateText: {
    fontSize: 14,
    color: ProRunnerColors.success,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickSelect: {
    backgroundColor: `${ProRunnerColors.primary}10`,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${ProRunnerColors.primary}30`,
    marginBottom: 20,
  },
  quickSelectText: {
    fontSize: 14,
    color: ProRunnerColors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: ProRunnerColors.background,
    borderTopWidth: 1,
    borderTopColor: `${ProRunnerColors.primary}10`,
    paddingTop: 16,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
}); 