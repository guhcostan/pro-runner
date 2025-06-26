import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ThemedView } from '@/components/ThemedView';

// Tipos para o sistema adaptativo
interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  running_since: string;
  preferred_distance_unit: 'km' | 'miles';
  preferred_pace_unit: 'min_km' | 'min_mile';
  timezone: string;
  privacy_settings: {
    show_progress: boolean;
    show_achievements: boolean;
    show_stats: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_workouts: number;
  total_distance: number;
  total_time: number;
  current_level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  achievements_count: number;
  current_phase: string;
  member_since: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned_at: string;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, signOut } = useAuthStore();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileData = async () => {
    try {
      // TODO: Implementar chamadas para a API
      // Simulando dados por enquanto
      const mockProfile: UserProfile = {
        id: '1',
        user_id: user?.id || '1',
        display_name: user?.email?.split('@')[0] || 'Runner',
        bio: 'Apaixonado por corrida e sempre buscando evoluir!',
        running_since: '2024-01-01',
        preferred_distance_unit: 'km',
        preferred_pace_unit: 'min_km',
        timezone: 'America/Sao_Paulo',
        privacy_settings: {
          show_progress: true,
          show_achievements: true,
          show_stats: true
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2025-01-16T00:00:00Z'
      };

      const mockStats: UserStats = {
        total_workouts: 47,
        total_distance: 234.5,
        total_time: 1380, // minutos
        current_level: 8,
        total_xp: 4750,
        current_streak: 5,
        longest_streak: 12,
        achievements_count: 8,
        current_phase: 'Desenvolvimento',
        member_since: '2024-01-01'
      };

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'Primeira Corrida',
          description: 'Complete seu primeiro treino',
          icon: '🏃‍♂️',
          category: 'milestone',
          earned_at: '2024-01-02T10:00:00Z'
        },
        {
          id: '2',
          name: 'Maratonista Iniciante',
          description: 'Complete 10 treinos',
          icon: '🎯',
          category: 'consistency',
          earned_at: '2024-02-15T18:30:00Z'
        },
        {
          id: '3',
          name: '100km Conquistados',
          description: 'Corra um total de 100km',
          icon: '🏆',
          category: 'distance',
          earned_at: '2024-03-10T12:00:00Z'
        }
      ];

      setUserProfile(mockProfile);
      setUserStats(mockStats);
      setRecentAchievements(mockAchievements);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível sair da conta');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    // TODO: Implementar edição de perfil
    Alert.alert('Em desenvolvimento', 'Funcionalidade de edição de perfil será implementada em breve');
  };

  const handlePrivacySettings = () => {
    // TODO: Implementar configurações de privacidade
    Alert.alert('Em desenvolvimento', 'Configurações de privacidade serão implementadas em breve');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLevelTitle = (level: number) => {
    if (level < 5) return 'Iniciante';
    if (level < 10) return 'Intermediário';
    if (level < 20) return 'Avançado';
    if (level < 30) return 'Expert';
    return 'Elite';
  };

  const getLevelColor = (level: number) => {
    if (level < 5) return Colors.status.success;
    if (level < 10) return Colors.status.warning;
    if (level < 20) return Colors.status.info;
    if (level < 30) return Colors.phases.performance;
    return Colors.status.error;
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: isDark ? Colors.dark.text : Colors.light.text }}>
            Carregando perfil...
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Perfil
          </Text>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color={Colors.xp.primary} />
          </TouchableOpacity>
        </View>

        {/* Perfil do Usuário */}
        {userProfile && userStats && (
          <Card variant="elevated" margin="small">
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: getLevelColor(userStats.current_level) + '20' }]}>
                <Text style={[styles.avatarText, { color: getLevelColor(userStats.current_level) as string }]}>
                  {userProfile.display_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={[styles.displayName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {userProfile.display_name}
                </Text>
                <Badge 
                  variant="default" 
                  size="small"
                  style={{ backgroundColor: getLevelColor(userStats.current_level) as string }}
                  textStyle={{ color: '#ffffff' }}
                >
                  {getLevelTitle(userStats.current_level)} • Nível {userStats.current_level}
                </Badge>
                <Text style={[styles.currentPhase, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Fase: {userStats.current_phase}
                </Text>
              </View>
            </View>

            {userProfile.bio && (
              <Text style={[styles.bio, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {userProfile.bio}
              </Text>
            )}

            <View style={styles.memberSince}>
              <Ionicons name="calendar-outline" size={16} color={isDark ? Colors.dark.icon : Colors.light.icon} />
              <Text style={[styles.memberSinceText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Membro desde {formatDate(userStats.member_since)}
              </Text>
            </View>
          </Card>
        )}

        {/* Estatísticas Gerais */}
        {userStats && (
          <Card variant="elevated" margin="small">
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Estatísticas Gerais
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="fitness" size={24} color={Colors.status.success} />
                <Text style={[styles.statNumber, { color: Colors.status.success }]}>
                  {userStats.total_workouts}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Treinos
                </Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="location" size={24} color={Colors.status.info} />
                <Text style={[styles.statNumber, { color: Colors.status.info }]}>
                  {userStats.total_distance.toFixed(1)}km
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Distância
                </Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color={Colors.status.warning} />
                <Text style={[styles.statNumber, { color: Colors.status.warning }]}>
                  {formatTime(userStats.total_time)}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Tempo total
                </Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="star" size={24} color={Colors.xp.primary} />
                <Text style={[styles.statNumber, { color: Colors.xp.primary }]}>
                  {userStats.total_xp}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  XP Total
                </Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="flame" size={24} color={Colors.status.success} />
                <Text style={[styles.statNumber, { color: Colors.status.success }]}>
                  {userStats.current_streak}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Sequência atual
                </Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="trophy" size={24} color={Colors.status.warning} />
                <Text style={[styles.statNumber, { color: Colors.status.warning }]}>
                  {userStats.achievements_count}
                </Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Conquistas
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Conquistas Recentes */}
        {recentAchievements.length > 0 && (
          <Card variant="elevated" margin="small">
            <View style={styles.achievementsHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Conquistas Recentes
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Em desenvolvimento', 'Página de conquistas será implementada em breve')}>
                <Text style={[styles.viewAllText, { color: Colors.xp.primary }]}>
                  Ver todas
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={[styles.achievementName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {achievement.name}
                  </Text>
                  <Text style={[styles.achievementDescription, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    {achievement.description}
                  </Text>
                  <Badge variant="info" size="small">
                    {achievement.category}
                  </Badge>
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Configurações */}
        <Card variant="outlined" margin="small">
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Configurações
          </Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="person-outline" size={20} color={isDark ? Colors.dark.icon : Colors.light.icon} />
              <Text style={[styles.settingItemText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Editar Perfil
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? Colors.dark.icon : Colors.light.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="shield-outline" size={20} color={isDark ? Colors.dark.icon : Colors.light.icon} />
              <Text style={[styles.settingItemText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Privacidade
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? Colors.dark.icon : Colors.light.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Em desenvolvimento', 'Configurações gerais serão implementadas em breve')}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="settings-outline" size={20} color={isDark ? Colors.dark.icon : Colors.light.icon} />
              <Text style={[styles.settingItemText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Configurações Gerais
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? Colors.dark.icon : Colors.light.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Em desenvolvimento', 'Ajuda e suporte serão implementados em breve')}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color={isDark ? Colors.dark.icon : Colors.light.icon} />
              <Text style={[styles.settingItemText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Ajuda e Suporte
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? Colors.dark.icon : Colors.light.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.signOutItem]} onPress={handleSignOut}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="log-out-outline" size={20} color={Colors.status.error} />
              <Text style={[styles.settingItemText, { color: Colors.status.error }]}>
                Sair da Conta
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Informações do App */}
        <Card variant="outlined" margin="small">
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Sobre o App
          </Text>
          
          <View style={styles.appInfo}>
            <Text style={[styles.appName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              ProRunner v2.0
            </Text>
            <Text style={[styles.appDescription, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Sistema adaptativo e gamificado para treinos de corrida
            </Text>
            <Text style={[styles.appVersion, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Versão 2.0.0 (Build 1)
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  currentPhase: {
    fontSize: 14,
    marginTop: 6,
    opacity: 0.7,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  memberSinceText: {
    marginLeft: 8,
    fontSize: 12,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.ui.border + '10',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementCard: {
    width: 120,
    backgroundColor: Colors.ui.border + '10',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  signOutItem: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  appVersion: {
    fontSize: 12,
    opacity: 0.5,
  },
}); 