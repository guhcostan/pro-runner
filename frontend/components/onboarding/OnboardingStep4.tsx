import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../ui/Button';

interface OnboardingStep4Props {
  formData: {
    name: string;
    height: string;
    weight: string;
    goal: string;
    personal_record_5k: string;
    weekly_frequency?: number;
  };
  onFinish: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const goalLabels: Record<string, string> = {
  start_running: 'Começar a Correr - Dar os primeiros passos',
  run_5k: 'Correr 5km - Completar primeira corrida de 5km',
  run_10k: 'Correr 10km - Conquistar a distância de 10km',
  half_marathon: 'Meia Maratona - Completar os 21km',
  marathon: 'Maratona - Conquistar os 42km completos',
  improve_time: 'Melhorar Tempo - Bater recorde pessoal',
};

export default function OnboardingStep4({
  formData,
  onFinish,
  onBack,
  isLoading,
}: OnboardingStep4Props) {
  const bmi = (parseInt(formData.weight) / Math.pow(parseInt(formData.height) / 100, 2)).toFixed(1);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Tudo pronto, {formData.name}!</Text>
          <Text style={styles.subtitle}>
            Confira suas informações antes de criarmos seu plano personalizado
          </Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>👤 Informações Pessoais</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome:</Text>
              <Text style={styles.infoValue}>{formData.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Altura:</Text>
              <Text style={styles.infoValue}>{formData.height}cm</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Peso:</Text>
              <Text style={styles.infoValue}>{formData.weight}kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IMC:</Text>
              <Text style={styles.infoValue}>{bmi}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>🎯 Objetivo de Corrida</Text>
            <Text style={styles.goalText}>
              {goalLabels[formData.goal] || formData.goal}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>⏱️ Tempo nos 5K</Text>
            <Text style={styles.timeText}>
              {formData.personal_record_5k}
            </Text>
            <Text style={styles.timeSubtext}>
              Usaremos isso para calcular seus ritmos ideais
            </Text>
          </View>

          {formData.weekly_frequency && (
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>📅 Frequência Semanal</Text>
              <Text style={styles.frequencyText}>
                {formData.weekly_frequency}x por semana
              </Text>
              <Text style={styles.timeSubtext}>
                Treinos distribuídos conforme sua disponibilidade
              </Text>
            </View>
          )}

          <View style={styles.planPreview}>
            <Text style={styles.previewTitle}>📋 Seu Plano Incluirá:</Text>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>✓ Treinos personalizados por 8 semanas</Text>
              <Text style={styles.featureItem}>✓ 4 tipos de treino diferentes</Text>
              <Text style={styles.featureItem}>✓ Progressão gradual e segura</Text>
              <Text style={styles.featureItem}>✓ Acompanhamento do progresso</Text>
              <Text style={styles.featureItem}>✓ Paces calculados automaticamente</Text>
              <Text style={styles.featureItem}>✓ Zonas de treinamento otimizadas</Text>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>🏥 Importante:</Text>
            <Text style={styles.warningText}>
              Consulte um médico antes de iniciar qualquer programa de exercícios. 
              Este plano é apenas uma orientação geral.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <Button
          title="Voltar"
          onPress={onBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title={isLoading ? "Criando..." : "Criar Meu Plano! 🚀"}
          onPress={onFinish}
          loading={isLoading}
          style={styles.finishButton}
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
  summary: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.primary,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.primary,
    marginBottom: 4,
  },
  frequencyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.primary,
    marginBottom: 4,
  },
  timeSubtext: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    fontStyle: 'italic',
  },
  planPreview: {
    backgroundColor: `${ProRunnerColors.primary}15`,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${ProRunnerColors.primary}30`,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 16,
    color: ProRunnerColors.textPrimary,
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: ProRunnerColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  warningText: {
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
  finishButton: {
    flex: 2,
  },
}); 