import React, { useEffect, useRef, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';
import { t } from '../../constants/i18n';

interface XPProgressBarProps {
  currentXP: number;
  xpToNextLevel: number;
  currentLevel: number;
  totalXPEarned: number;
  showAnimation?: boolean;
  style?: any;
}

const XPProgressBarComponent: React.FC<XPProgressBarProps> = memo(({
  currentXP,
  xpToNextLevel,
  currentLevel,
  totalXPEarned,
  showAnimation = true,
  style,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Memoize expensive calculations
  const calculations = useMemo(() => {
    const { width: screenWidth } = Dimensions.get('window');
    const progressBarWidth = screenWidth - 80; // Account for padding
    const progressPercentage = Math.min((currentXP / xpToNextLevel) * 100, 100);
    const progressWidth = (progressPercentage / 100) * progressBarWidth;
    
    return {
      progressBarWidth,
      progressPercentage,
      progressWidth,
    };
  }, [currentXP, xpToNextLevel]);

  const { progressPercentage, progressWidth } = calculations;

  useEffect(() => {
    if (showAnimation) {
      // Animate progress bar fill
      Animated.timing(progressAnim, {
        toValue: progressWidth,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Pulse animation for level indicator
      const pulseAnimation = Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      pulseAnimation.start();
    } else {
      progressAnim.setValue(progressWidth);
    }
  }, [currentXP, xpToNextLevel, showAnimation, progressAnim, progressWidth, scaleAnim]);

  // Memoize level-based calculations
  const levelColor = useMemo(() => {
    if (currentLevel < 5) return '#4CAF50'; // Green for beginners
    if (currentLevel < 10) return '#FF9800'; // Orange for intermediate
    if (currentLevel < 20) return '#2196F3'; // Blue for advanced
    if (currentLevel < 30) return '#9C27B0'; // Purple for expert
    return '#FF5722'; // Red for elite
  }, [currentLevel]);

  const levelTitle = useMemo(() => {
    if (currentLevel < 5) return t('level_beginner');
    if (currentLevel < 10) return t('level_intermediate');
    if (currentLevel < 20) return t('level_advanced');
    if (currentLevel < 30) return t('level_expert');
    return t('level_elite');
  }, [currentLevel]);

  const formatXP = useMemo(() => {
    return (xp: number) => {
      if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
      if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
      return xp.toString();
    };
  }, []);

  // Memoize formatted values
  const formattedValues = useMemo(() => ({
    currentXP: formatXP(currentXP),
    xpToNextLevel: formatXP(xpToNextLevel),
    totalXPEarned: formatXP(totalXPEarned),
    xpRemaining: formatXP(xpToNextLevel - currentXP),
  }), [currentXP, xpToNextLevel, totalXPEarned, formatXP]);

  return (
    <View style={[styles.container, style]}>
      {/* Level Badge */}
      <View style={styles.levelContainer}>
        <Animated.View 
          style={[
            styles.levelBadge, 
            { 
              backgroundColor: levelColor,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.levelNumber}>{currentLevel}</Text>
        </Animated.View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
          <Text style={styles.totalXP}>
            {formattedValues.totalXPEarned} {t('total_xp')}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              { 
                width: progressAnim,
                backgroundColor: levelColor,
              }
            ]} 
          />
          
          {/* XP Text Overlay */}
          <View style={styles.xpTextContainer}>
            <Text style={styles.xpText}>
              {formattedValues.currentXP} / {formattedValues.xpToNextLevel} {t('xp')}
            </Text>
          </View>
        </View>
        
        {/* Progress Percentage */}
        <Text style={styles.progressPercentage}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      {/* Next Level Info */}
      <View style={styles.nextLevelContainer}>
        <Text style={styles.nextLevelText}>
          🎯 {t('next_level')}: {currentLevel + 1}
        </Text>
        <Text style={styles.xpToNextLevel}>
          {t('xp_remaining', { xp: formattedValues.xpRemaining })}
        </Text>
      </View>
    </View>
  );
});

XPProgressBarComponent.displayName = 'XPProgressBar';

export const XPProgressBar = XPProgressBarComponent;

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
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    marginBottom: 4,
  },
  totalXP: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: ProRunnerColors.border,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    minWidth: 2,
  },
  xpTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressPercentage: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
    textAlign: 'right',
  },
  nextLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextLevelText: {
    fontSize: 14,
    color: ProRunnerColors.textPrimary,
    fontWeight: '600',
  },
  xpToNextLevel: {
    fontSize: 12,
    color: ProRunnerColors.textSecondary,
  },
}); 