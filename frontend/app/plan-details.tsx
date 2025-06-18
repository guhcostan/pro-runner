import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import { ProRunnerColors } from '../constants/Colors';
import { useUserStore } from '../store/userStore';
import { translateFitnessLevel, getGoalDisplayName } from '../lib/utils';

export default function PlanDetailsScreen() {
  // router removed as it's not being used
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
      type: 'easy',
      name: 'Corrida Leve',
      emoji: '🚶‍♂️',
      description: 'Base aeróbica e recuperação ativa',
      pace: plan.training_paces?.easy || 'Fácil',
      zone: 'Zona Aeróbica',
      environment: 'Rua/Parque',
      duration: '30-60 min',
      intensity: 'Baixa',
      tips: 'Ritmo que permite conversa fácil. Desenvolve a base aeróbica.',
    },
    {
      type: 'long',
      name: 'Corrida Longa',
      emoji: '🏃‍♂️',
      description: 'Resistência aeróbica e endurance',
      pace: plan.training_paces?.long || 'Moderado',
      zone: 'Zona Aeróbica',
      environment: 'Rua/Parque',
      duration: '60-120 min',
      intensity: 'Baixa-Moderada',
      tips: 'Ritmo ligeiramente mais rápido que o fácil. Foque na duração.',
    },
    {
      type: 'tempo',
      name: 'Treino Tempo',
      emoji: '🔥',
      description: 'Limiar anaeróbico',
      pace: plan.training_paces?.tempo || 'Limiar',
      zone: 'Zona Limiar',
      environment: 'Rua/Esteira',
      duration: '15-30 min',
      intensity: 'Moderada-Alta',
      tips: 'Ritmo "comfortavelmente difícil". Pode sustentar por ~1 hora.',
    },
    {
      type: 'interval',
      name: 'Treino Intervalado',
      emoji: '⚡',
      description: 'VO2 máximo e velocidade',
      pace: plan.training_paces?.interval || 'Pace 5K',
      zone: 'Zona VO2 Max',
      environment: 'Pista/Rua plana',
      duration: '20-40 min',
      intensity: 'Alta',
      tips: 'Pace de 5K. Aquecimento obrigatório. Respeite a recuperação.',
    },
    {
      type: 'recovery',
      name: 'Recuperação',
      emoji: '🧘‍♂️',
      description: 'Recuperação ativa',
      pace: plan.training_paces?.recovery || 'Muito fácil',
      zone: 'Zona Regenerativa',
      environment: 'Rua/Parque',
      duration: '20-40 min',
      intensity: 'Muito Baixa',
      tips: 'Mais lento que corrida fácil. Foque na recuperação muscular.',
    },
    // Novos tipos baseados em metodologias científicas
    {
      type: 'fartlek',
      name: 'Fartlek (Jogo de Velocidade)',
      emoji: '🎲',
      description: 'Variações de ritmo espontâneas',
      pace: 'Fácil → 5K',
      zone: 'Zonas Múltiplas',
      environment: 'Qualquer terreno',
      duration: '20-45 min',
      intensity: 'Variável',
      tips: 'Metodologia sueca. Varie o ritmo conforme se sente. Divertido!',
    },
    {
      type: 'hill',
      name: 'Treino de Subidas',
      emoji: '⛰️',
      description: 'Força específica e potência',
      pace: 'Esforço 5K em subida',
      zone: 'Zona Neuromuscular',
      environment: 'Subidas 5-8%',
      duration: '30-50 min',
      intensity: 'Alta',
      tips: 'Desenvolve força das pernas. Passos curtos e frequentes.',
    },
    {
      type: 'progressive',
      name: 'Corrida Progressiva',
      emoji: '📈',
      description: 'Acelera gradualmente',
      pace: 'Fácil → Tempo',
      zone: 'Progressão de Zonas',
      environment: 'Rua/Pista',
      duration: '30-60 min',
      intensity: 'Crescente',
      tips: 'Comece devagar, termine forte. Ótimo para controle de pace.',
    },
    {
      type: 'ladder',
      name: 'Treino em Escada',
      emoji: '🪜',
      description: 'Intervalos crescentes/decrescentes',
      pace: plan.training_paces?.interval || 'Pace 5K',
      zone: 'Zona VO2 Max',
      environment: 'Pista/Rua plana',
      duration: '25-40 min',
      intensity: 'Alta',
      tips: 'Exemplo: 1-2-3-2-1min. Mantenha o mesmo pace em todos.',
    },
    {
      type: 'long_surges',
      name: 'Longão com Surges',
      emoji: '🏃‍♂️💨',
      description: 'Longão + acelerações de limiar',
      pace: `${plan.training_paces?.long || 'Moderado'} + Surges`,
      zone: 'Aeróbica + Limiar',
      environment: 'Rua/Parque',
      duration: '60-120 min',
      intensity: 'Moderada + Picos',
      tips: 'Faça surges de 1-2min nos últimos 60% da corrida.',
    },
    {
      type: 'progressive_long',
      name: 'Longão Progressivo',
      emoji: '🏃‍♂️📈',
      description: 'Longão que acelera gradualmente',
      pace: 'Fácil → Tempo',
      zone: 'Aeróbica → Limiar',
      environment: 'Rua/Parque',
      duration: '60-120 min',
      intensity: 'Crescente',
      tips: 'Metodologia africana. Termine os últimos km em ritmo forte.',
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
    <>
      <Stack.Screen 
        options={{
          title: "Detalhes do Plano",
          headerBackTitle: "Voltar",
          headerStyle: {
            backgroundColor: ProRunnerColors.background,
          },
          headerTintColor: ProRunnerColors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }} 
      />
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
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
          {plan.vdot && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VDOT:</Text>
              <Text style={styles.summaryValue}>{Math.round(plan.vdot)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pace Base (5K):</Text>
            <Text style={styles.summaryValue}>{plan.base_pace}/km</Text>
          </View>
          {plan.estimated_capabilities && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Capacidade Máxima:</Text>
              <Text style={styles.summaryValue}>{plan.estimated_capabilities.currentMaxDistance}km</Text>
            </View>
          )}
        </View>

        {/* VDOT Training Paces */}
        {plan.training_paces && (
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>🎯 Paces de Treino (VDOT)</Text>
            <Text style={styles.cardSubtitle}>Baseados na metodologia científica de Jack Daniels</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fácil (Easy):</Text>
              <Text style={styles.summaryValue}>{plan.training_paces.easy}/km</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Longão (Long):</Text>
              <Text style={styles.summaryValue}>{plan.training_paces.long}/km</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tempo (Threshold):</Text>
              <Text style={styles.summaryValue}>{plan.training_paces.tempo}/km</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tiros (Interval):</Text>
              <Text style={styles.summaryValue}>{plan.training_paces.interval}/km</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Recuperação:</Text>
              <Text style={styles.summaryValue}>{plan.training_paces.recovery}/km</Text>
            </View>
          </View>
        )}

        {/* Validation Warning */}
        {plan.validation && plan.validation.warning && (
          <View style={[styles.summaryCard, { backgroundColor: ProRunnerColors.warning + '20', borderLeftWidth: 4, borderLeftColor: ProRunnerColors.warning }]}>
            <Text style={styles.cardTitle}>⚠️ Aviso Importante</Text>
            <Text style={[styles.summaryValue, { color: ProRunnerColors.warning }]}>
              {plan.validation.warning}
            </Text>
          </View>
        )}

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
    </>
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
  cardSubtitle: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
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