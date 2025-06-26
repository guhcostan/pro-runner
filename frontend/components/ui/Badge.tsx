import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'phase';
  size?: 'small' | 'medium' | 'large';
  phase?: 'foundation' | 'development' | 'performance' | 'maintenance' | 'recovery';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ 
  children, 
  variant = 'default',
  size = 'medium',
  phase,
  style,
  textStyle
}: BadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getVariantColors = () => {
    if (variant === 'phase' && phase) {
      const phaseColors = Colors.phases[phase];
      return {
        backgroundColor: phaseColors.primary,
        color: '#ffffff',
      };
    }

    switch (variant) {
      case 'success':
        return {
          backgroundColor: Colors.status.success,
          color: '#ffffff',
        };
      case 'warning':
        return {
          backgroundColor: Colors.status.warning,
          color: '#ffffff',
        };
      case 'error':
        return {
          backgroundColor: Colors.status.error,
          color: '#ffffff',
        };
      case 'info':
        return {
          backgroundColor: Colors.status.info,
          color: '#ffffff',
        };
      default:
        return {
          backgroundColor: isDark ? Colors.ui.borderDark : Colors.ui.border,
          color: isDark ? Colors.dark.text : Colors.light.text,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          fontSize: 12,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          fontSize: 16,
        };
      default: // medium
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          fontSize: 14,
        };
    }
  };

  const colors = getVariantColors();
  const sizeStyle = getSizeStyle();

  return (
    <View 
      style={[
        {
          backgroundColor: colors.backgroundColor,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          borderRadius: sizeStyle.borderRadius,
          alignSelf: 'flex-start',
        },
        style
      ]}
    >
      <Text 
        style={[
          {
            color: colors.color,
            fontSize: sizeStyle.fontSize,
            fontWeight: '600',
            textAlign: 'center',
          },
          textStyle
        ]}
      >
        {children}
      </Text>
    </View>
  );
} 