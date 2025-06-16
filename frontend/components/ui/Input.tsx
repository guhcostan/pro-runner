import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={ProRunnerColors.textMuted}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: ProRunnerColors.surface,
    borderWidth: 1,
    borderColor: ProRunnerColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: ProRunnerColors.textPrimary,
    minHeight: 48,
  },
  inputError: {
    borderColor: ProRunnerColors.error,
  },
  errorText: {
    fontSize: 14,
    color: ProRunnerColors.error,
    marginTop: 4,
  },
}); 