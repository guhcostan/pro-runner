import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({ 
  children, 
  style, 
  variant = 'default',
  padding = 'medium',
  margin = 'none'
}: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: isDark ? Colors.background.secondary : Colors.background.light,
      borderRadius: 16,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: isDark ? Colors.ui.shadowDark : Colors.ui.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: Colors.ui.border,
        };
      case 'gradient':
        return {
          ...baseStyle,
          // Gradient será implementado com LinearGradient quando necessário
        };
      default:
        return baseStyle;
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none': return { padding: 0 };
      case 'small': return { padding: 12 };
      case 'medium': return { padding: 16 };
      case 'large': return { padding: 24 };
      default: return { padding: 16 };
    }
  };

  const getMarginStyle = () => {
    switch (margin) {
      case 'none': return { margin: 0 };
      case 'small': return { margin: 8 };
      case 'medium': return { margin: 16 };
      case 'large': return { margin: 24 };
      default: return { margin: 0 };
    }
  };

  return (
    <View 
      style={[
        getCardStyle(),
        getPaddingStyle(),
        getMarginStyle(),
        style
      ]}
    >
      {children}
    </View>
  );
} 