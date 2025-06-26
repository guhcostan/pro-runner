import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { t } from '../../constants/i18n';

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_emoji: string;
  criteria_type: string;
  criteria_value: number;
  earned_at?: string;
}

interface AchievementsCardProps {
  achievements: Achievement[];
  totalAchievements?: number;
  onAchievementPress?: (achievement: Achievement) => void;
  style?: any;
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  achievements,
  totalAchievements = 15,
  onAchievementPress,
  style,
}) => {
  const earnedAchievements = achievements.filter(a => a.earned_at);
  const earnedCount = earnedAchievements.length;
  const completionPercentage = Math.round((earnedCount / totalAchievements) * 100);

  const getAchievementColor = (criteriaType: string) => {
    const colors: { [key: string]: string } = {
      'first_workout': '#4CAF50',
      'distance_milestone': '#2196F3',
      'consistency_streak': '#FF9800',
      'level_milestone': '#9C27B0',
      'phase_advancement': '#FF5722',
      'special_achievement': '#795548',
    };
    return colors[criteriaType] || '#757575';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderAchievementBadge = (achievement: Achievement, index: number) => {
    const isEarned = !!achievement.earned_at;
    const backgroundColor = isEarned 
      ? getAchievementColor(achievement.criteria_type)
      : ProRunnerColors.border;

    return (
      <TouchableOpacity
        key={achievement.id || index}
        style={[
          styles.achievementBadge,
          { backgroundColor },
          !isEarned && styles.achievementBadgeDisabled,
        ]}
        onPress={() => onAchievementPress?.(achievement)}
        disabled={!isEarned}
      >
        <Text style={[
          styles.achievementEmoji,
          !isEarned && styles.achievementEmojiDisabled,
        ]}>
          {achievement.badge_emoji}
        </Text>
        {isEarned && (
          <View style={styles.earnedIndicator}>
            <Text style={styles.earnedIndicatorText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>🏆 {t('achievements')}</Text>
          <Text style={styles.subtitle}>
            {t('achievements_unlocked', { count: earnedCount, total: totalAchievements })}
          </Text>
        </View>
        <View style={styles.completionBadge}>
          <Text style={styles.completionPercentage}>{completionPercentage}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${completionPercentage}%` }
            ]} 
          />
        </View>
      </View>

      {/* Recent Achievements */}
      {earnedAchievements.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>🎉 {t('recent_achievements')}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.recentScroll}
          >
            {earnedAchievements
              .sort((a, b) => new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime())
              .slice(0, 5)
              .map((achievement, index) => (
                <TouchableOpacity
                  key={achievement.id || index}
                  style={styles.recentAchievement}
                  onPress={() => onAchievementPress?.(achievement)}
                >
                  <View style={[
                    styles.recentBadge,
                    { backgroundColor: getAchievementColor(achievement.criteria_type) }
                  ]}>
                    <Text style={styles.recentEmoji}>
                      {achievement.badge_emoji}
                    </Text>
                  </View>
                  <Text style={styles.recentName} numberOfLines={2}>
                    {achievement.name}
                  </Text>
                  <Text style={styles.recentDate}>
                    {formatDate(achievement.earned_at!)}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}

      {/* All Achievements Grid */}
      <View style={styles.allAchievementsSection}>
        <Text style={styles.sectionTitle}>📋 {t('all_achievements')}</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map(renderAchievementBadge)}
          
          {/* Placeholder badges for future achievements */}
          {Array.from({ length: Math.max(0, totalAchievements - achievements.length) }, (_, index) => (
            <View
              key={`placeholder-${index}`}
              style={[styles.achievementBadge, styles.achievementBadgeDisabled]}
            >
              <Text style={[styles.achievementEmoji, styles.achievementEmojiDisabled]}>
                ?
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Motivational Message */}
      {earnedCount === 0 ? (
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            🚀 {t('first_workout_motivation')}
          </Text>
        </View>
      ) : earnedCount < totalAchievements ? (
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            💪 {t('continue_training_motivation')}
          </Text>
        </View>
      ) : (
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            🎉 {t('all_achievements_motivation')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ProRunnerColors.surface,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  completionBadge: {
    backgroundColor: ProRunnerColors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completionPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: ProRunnerColors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ProRunnerColors.primary,
    borderRadius: 4,
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 12,
  },
  recentScroll: {
    marginHorizontal: -4,
  },
  recentAchievement: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 80,
  },
  recentBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentEmoji: {
    fontSize: 20,
  },
  recentName: {
    fontSize: 12,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 10,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
  },
  allAchievementsSection: {
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  achievementBadgeDisabled: {
    backgroundColor: ProRunnerColors.border,
    opacity: 0.5,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementEmojiDisabled: {
    opacity: 0.6,
  },
  earnedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  motivationContainer: {
    backgroundColor: ProRunnerColors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 