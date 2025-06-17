import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../ui/Button';

interface OnboardingStep3_5Props {
  onSelectFrequency: (frequency: number) => void;
  selectedFrequency?: number | string;
  onNext?: () => void;
  onBack?: () => void;
}

export default function OnboardingStep3_5({ 
  onSelectFrequency, 
  selectedFrequency,
  onNext,
  onBack
}: OnboardingStep3_5Props) {
  const frequencies = [
    { 
      value: 1, 
      label: '1x por semana', 
      description: 'Para manter o condicionamento',
      emoji: '🚶',
      color: '#94A3B8'
    },
    { 
      value: 2, 
      label: '2x por semana', 
      description: 'Ótimo para quem tem pouco tempo',
      emoji: '🏃',
      color: '#10B981'
    },
    { 
      value: 3, 
      label: '3x por semana', 
      description: 'Ideal para iniciantes',
      emoji: '🚶‍♂️',
      color: '#10B981'
    },
    { 
      value: 4, 
      label: '4x por semana', 
      description: 'Bom equilíbrio treino/descanso',
      emoji: '🏃‍♂️',
      color: '#3B82F6'
    },
    { 
      value: 5, 
      label: '5x por semana', 
      description: 'Para corredores experientes',
      emoji: '🏃‍♂️💨',
      color: '#F59E0B'
    },
    { 
      value: 6, 
      label: '6x por semana', 
      description: 'Alta dedicação ao treino',
      emoji: '🔥',
      color: '#EF4444'
    },
  ];

  const handleFrequencySelect = (frequency: number) => {
    onSelectFrequency(frequency);
  };

  // Convert selectedFrequency to number for consistent comparison
  const selectedFrequencyNumber = typeof selectedFrequency === 'string' 
    ? parseInt(selectedFrequency) 
    : selectedFrequency;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📅</Text>
          <Text style={styles.title}>Quantas vezes por semana você quer treinar?</Text>
          <Text style={styles.subtitle}>
            Escolha a frequência que melhor se adapta à sua rotina e disponibilidade
          </Text>
        </View>
        
                 <View style={styles.frequencyOptions}>
           {frequencies.map((frequency) => (
             <TouchableOpacity
               key={frequency.value}
               style={[
                 styles.frequencyCard,
                 selectedFrequencyNumber === frequency.value && styles.frequencyCardSelected,
                 { borderLeftWidth: 4, borderLeftColor: frequency.color }
               ]}
               onPress={() => handleFrequencySelect(frequency.value)}
             >
               <View style={styles.frequencyContent}>
                 <View style={styles.frequencyHeader}>
                   <Text style={styles.frequencyEmoji}>{frequency.emoji}</Text>
                   <View style={styles.frequencyText}>
                     <Text style={[
                       styles.frequencyLabel,
                       selectedFrequencyNumber === frequency.value && styles.frequencyLabelSelected,
                     ]}>
                       {frequency.label}
                     </Text>
                     <Text style={[
                       styles.frequencyDescription,
                       selectedFrequencyNumber === frequency.value && styles.frequencyDescriptionSelected,
                     ]}>
                       {frequency.description}
                     </Text>
                   </View>
                 </View>
                 
                 {selectedFrequencyNumber === frequency.value && (
                   <View style={styles.selectedIndicator}>
                     <Text style={styles.selectedIcon}>✓</Text>
                   </View>
                 )}
               </View>
             </TouchableOpacity>
           ))}
         </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Dica:</Text>
          <Text style={styles.infoText}>
            Você pode ajustar a frequência depois. Recomendamos começar com menos treinos e aumentar gradualmente.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        {onBack && (
          <Button
            title="Voltar"
            variant="outline"
            onPress={onBack}
            style={styles.backButton}
          />
        )}
                 <Button
           title="Continuar"
           variant="primary"
           onPress={onNext || (() => {})}
           disabled={!selectedFrequencyNumber}
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
  frequencyOptions: {
    marginBottom: 24,
  },
  frequencyCard: {
    backgroundColor: ProRunnerColors.cardBackground,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyCardSelected: {
    borderColor: ProRunnerColors.primary,
    backgroundColor: `${ProRunnerColors.primary}15`,
  },
  frequencyButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  frequencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%',
  },
  frequencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  frequencyEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  frequencyText: {
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 2,
  },
  frequencyLabelSelected: {
    color: ProRunnerColors.primary,
  },
  frequencyDescription: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  frequencyDescriptionSelected: {
    color: ProRunnerColors.textPrimary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ProRunnerColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    lineHeight: 20,
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