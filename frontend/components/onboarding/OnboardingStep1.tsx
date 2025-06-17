import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface OnboardingStep1Props {
  formData: {
    name: string;
    height: string;
    weight: string;
  };
  errors: Record<string, string>;
  onUpdateField: (field: string, value: string) => void;
  onNext: () => void;
}

export default function OnboardingStep1({
  formData,
  errors,
  onUpdateField,
  onNext,
}: OnboardingStep1Props) {
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>Vamos nos conhecer!</Text>
          <Text style={styles.subtitle}>
            Primeiro, me conte um pouco sobre você
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Como você se chama?"
            value={formData.name}
            onChangeText={(value) => onUpdateField('name', value)}
            placeholder="Seu nome"
            error={errors.name}
          />

          <Input
            label="Qual sua altura? (cm)"
            value={formData.height}
            onChangeText={(value) => onUpdateField('height', value)}
            placeholder="170"
            keyboardType="numeric"
            error={errors.height}
          />

          <Input
            label="Qual seu peso? (kg)"
            value={formData.weight}
            onChangeText={(value) => onUpdateField('weight', value)}
            placeholder="70"
            keyboardType="numeric"
            error={errors.weight}
          />
        </View>

        <Button
          title="Próximo"
          onPress={onNext}
          style={styles.nextButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  form: {
    flex: 1,
    minHeight: 250, // Garante espaço mínimo para os inputs
  },
  nextButton: {
    marginTop: 20,
  },
}); 