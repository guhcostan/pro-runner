import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ProRunnerColors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { t } from '../../constants/i18n';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError(`${t('email')} é obrigatório`);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    const { error: resetError } = await resetPassword(email);
    
    if (resetError) {
      Alert.alert(
        'Erro',
        'Não foi possível enviar o email de recuperação. Tente novamente.',
        [{ text: 'OK' }]
      );
    } else {
      setSent(true);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.content}>
          <View style={styles.successContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={64} color={ProRunnerColors.primary} />
            </View>
            
            <Text style={styles.successTitle}>{t('email_sent')}</Text>
            <Text style={styles.successMessage}>
              {t('reset_email_message')}{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            
            <Text style={styles.instructionText}>
              {t('check_email_instruction')}
            </Text>

            <Button
              title={t('back_to_login')}
              onPress={() => router.replace('/auth/login')}
              style={styles.backButton}
            />
            
            <TouchableOpacity 
              onPress={handleResetPassword}
              style={styles.resendContainer}
            >
              <Text style={styles.resendText}>
                {t('resend_email')} <Text style={styles.linkText}>{t('resend')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={ProRunnerColors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>{t('forgot_password_title')}</Text>
              <Text style={styles.subtitle}>
                {t('forgot_password_subtitle')}
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label={t('email')}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
              />

              <Button
                title={t('send_reset_link')}
                onPress={handleResetPassword}
                loading={isLoading}
                style={styles.resetButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('remembered_password')}</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text style={styles.linkText}>{t('login_link')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProRunnerColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'space-between',
    minHeight: 600,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
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
  },
  form: {
    flex: 1,
  },
  resetButton: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
  },
  linkText: {
    fontSize: 16,
    color: ProRunnerColors.primary,
    fontWeight: '600',
  },
  // Success screen styles
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ProRunnerColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProRunnerColors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emailText: {
    color: ProRunnerColors.primary,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: ProRunnerColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  resendContainer: {
    marginTop: 16,
    padding: 12,
  },
  resendText: {
    fontSize: 14,
    color: ProRunnerColors.textSecondary,
    textAlign: 'center',
  },
}); 