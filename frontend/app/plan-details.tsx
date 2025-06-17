import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProRunnerColors } from '../constants/Colors';
import { useUserStore } from '../store/userStore';
import { translateFitnessLevel, getGoalDisplayName } from '../lib/utils';

export default function PlanDetailsScreen() {
  const router = useRouter();
  const { user, plan } = useUserStore();

  if (!user || !plan) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando detalhes do plano...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const workoutTypes = [
    {
      type: 'longao',
      name: 'Corrida Longa',
      emoji: '🏃‍♂️',
      description: 'Treino de resistência aeróbica',
      pace: 'Conversa (Z2)',
      environment: 'Rua/Parque',
      duration: '45-90 min',
      intensity: 'Baixa-Moderada',
      tips: 'Mantenha um ritmo que permita conversar. Foque na duração, não na velocidade.',
    },
    {
      type: 'tiros',
      name: 'Treino de Velocidade',
      emoji: '⚡',
      description: 'Intervalos de alta intensidade',
      pace: 'Forte (Z4-Z5)',
      environment: 'Pista/Rua plana',
      duration: '30-45 min',
      intensity: 'Alta',
      tips: 'Aquecimento obrigatório. Respeite os intervalos de recuperação.',
    },
    {
      type: 'tempo',
      name: 'Treino Tempo',
      emoji: '🎯',
      description: 'Ritmo moderadamente difícil',
      pace: 'Limiar (Z3)',
      environment: 'Rua/Esteira',
      duration: '25-40 min',
      intensity: 'Moderada-Alta',
      tips: 'Ritmo que você consegue manter por 1 hora em competição.',
    },
    {
      type: 'regenerativo',
      name: 'Corrida Regenerativa',
      emoji: '🌱',
      description: 'Recuperação ativa',
      pace: 'Muito fácil (Z1)',
      environment: 'Rua/Parque',
      duration: '20-35 min',
      intensity: 'Muito Baixa',
      tips: 'Mais lento que o ritmo de conversa. Foque na recuperação.',
    },
  ];

  const zones = [
    { zone: 'Z1', name: 'Recuperação', color: '#4CAF50', description: 'Muito fácil, respiração natural' },
    { zone: 'Z2', name: 'Aeróbico', color: '#2196F3', description: 'Fácil, pode conversar normalmente' },
    { zone: 'Z3', name: 'Limiar', color: '#FF9800', description: 'Moderado, conversa difícil' },
    { zone: 'Z4', name: 'VO2 Max', color: '#F44336', description: 'Difícil, poucas palavras' },
    { zone: 'Z5', name: 'Neuromuscular', color: '#9C27B0', description: 'Máximo, sem conversa' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={ProRunnerColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Plano</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Plan Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📋 Resumo do Plano</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Objetivo:</Text>
            <Text style={styles.summaryValue}>{getGoalDisplayName(plan.goal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duração:</Text>
            <Text style={styles.summaryValue}>{plan.total_weeks} semanas</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nível:</Text>
            <Text style={styles.summaryValue}>{translateFitnessLevel(plan.fitness_level)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pace Base:</Text>
            <Text style={styles.summaryValue}>{plan.base_pace}/km</Text>
          </View>
        </View>

        {/* Workout Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏃‍♂️ Tipos de Treino</Text>
          {workoutTypes.map((workout, index) => (
            <View key={index} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDescription}>{workout.description}</Text>
                </View>
              </View>
              
              <View style={styles.workoutDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Zona/Pace:</Text>
                  <Text style={styles.detailValue}>{workout.pace}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Local:</Text>
                  <Text style={styles.detailValue}>{workout.environment}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duração:</Text>
                  <Text style={styles.detailValue}>{workout.duration}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Intensidade:</Text>
                  <Text style={styles.detailValue}>{workout.intensity}</Text>
                </View>
              </View>
              
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Dicas:</Text>
                <Text style={styles.tipsText}>{workout.tips}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Heart Rate Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️ Zonas de Frequência Cardíaca</Text>
          {zones.map((zone, index) => (
            <View key={index} style={styles.zoneCard}>
              <View style={[styles.zoneIndicator, { backgroundColor: zone.color }]} />
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.zone} - {zone.name}</Text>
                <Text style={styles.zoneDescription}>{zone.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Environment Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Dicas de Ambiente</Text>
          <View style={styles.environmentCard}>
            <Text style={styles.environmentTitle}>🏃‍♂️ Corrida na Rua</Text>
            <Text style={styles.environmentText}>
              • Melhor para treinos longos e tempo{'\n'}
              • Terreno variado fortalece músculos{'\n'}
              • Atenção ao trânsito e piso irregular{'\n'}
              • Use roupas reflexivas no escuro
            </Text>
          </View>
          
          <View style={styles.environmentCard}>
            <Text style={styles.environmentTitle}>🏃‍♂️ Corrida na Esteira</Text>
            <Text style={styles.environmentText}>
              • Ideal para treinos de velocidade{'\n'}
              • Controle total do ritmo e inclinação{'\n'}
              • Seguro em qualquer clima{'\n'}
              • Use inclinação de 1-2% para simular vento
            </Text>
          </View>
          
          <View style={styles.environmentCard}>
            <Text style={styles.environmentTitle}>🏃‍♂️ Pista de Atletismo</Text>
            <Text style={styles.environmentText}>
              • Perfeita para intervalos e tiros{'\n'}
              • Superfície consistente e medida{'\n'}
              • 400m = 1 volta completa{'\n'}
              • Corra no sentido anti-horário
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProRunnerColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: ProRunnerColors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: ProRunnerColors.textSecondary,
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: ProRunnerColors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 2,
  },
  workoutDescription: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  workoutDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: ProRunnerColors.textPrimary,
  },
  tipsContainer: {
    backgroundColor: `${ProRunnerColors.primary}10`,
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.primary,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: ProRunnerColors.textSecondary,
    lineHeight: 18,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  zoneIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 2,
  },
  zoneDescription: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
  },
  environmentCard: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
  },
  environmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  environmentText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
}); 