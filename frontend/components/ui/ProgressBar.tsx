import React from 'react';
import { View, Text, ViewStyle, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'xp' | 'phase';
  phase?: 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery';
  style?: ViewStyle;
  animated?: boolean;
}

export function ProgressBar({ 
  progress,
  height = 8,
  showLabel = false,
  label,
  variant = 'default',
  phase,
  style,
  animated = true
}: ProgressBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const animatedValue = new Animated.Value(animated ? 0 : progress);

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, animated]);

  const getColors = () => {
    if (variant === 'xp') {
      return {
        background: isDark ? Colors.xp.backgroundDark : Colors.xp.background,
        fill: Colors.xp.primary,
      };
    }
    
    if (variant === 'phase' && phase) {
      const phaseColors = Colors.phases[phase];
      return {
        background: isDark ? phaseColors.backgroundDark : phaseColors.background,
        fill: phaseColors.primary,
      };
    }

    return {
      background: isDark ? Colors.ui.borderDark : Colors.ui.border,
      fill: Colors.light.tint,
    };
  };

  const colors = getColors();
  const progressWidth = animated ? animatedValue : new Animated.Value(progress);

  return (
    <View style={[{ width: '100%' }, style]}>
      {showLabel && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ 
            color: isDark ? Colors.dark.text : Colors.light.text,
            fontSize: 14,
            fontWeight: '500'
          }}>
            {label}
          </Text>
          <Text style={{ 
            color: isDark ? Colors.dark.text : Colors.light.text,
            fontSize: 14,
            fontWeight: '600'
          }}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
      
      <View style={{
        height,
        backgroundColor: colors.background,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}>
        <Animated.View style={{
          height: '100%',
          backgroundColor: colors.fill,
          borderRadius: height / 2,
          width: progressWidth.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
            extrapolate: 'clamp',
          }),
        }} />
      </View>
    </View>
  );
} 