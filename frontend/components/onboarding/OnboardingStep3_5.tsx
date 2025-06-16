import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';

interface OnboardingStep3_5Props {
  onSelectFrequency: (frequency: number) => void;
  selectedFrequency?: number;
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
    { value: 3, label: '3x por semana' },
    { value: 4, label: '4x por semana' },
    { value: 5, label: '5x por semana' },
    { value: 6, label: '6x por semana' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quantas vezes por semana você quer treinar?</Text>
      <Text style={styles.subtitle}>
        Escolha a frequência que melhor se adapta à sua rotina
      </Text>
      
      <View style={styles.optionsContainer}>
        {frequencies.map((frequency) => (
          <Button
            key={frequency.value}
            title={frequency.label}
            variant={selectedFrequency === frequency.value ? "primary" : "outline"}
            onPress={() => onSelectFrequency(frequency.value)}
            style={styles.option}
          />
        ))}
      </View>

      {selectedFrequency && onNext && (
        <View style={styles.buttonContainer}>
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
            onPress={onNext}
            style={styles.nextButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  option: {
    marginVertical: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
}); 