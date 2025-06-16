import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProRunnerColors } from '../constants/Colors';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';

import OnboardingStep1 from '../components/onboarding/OnboardingStep1';
import OnboardingStep2 from '../components/onboarding/OnboardingStep2';
import OnboardingStep3 from '../components/onboarding/OnboardingStep3';
import OnboardingStep3_5 from '../components/onboarding/OnboardingStep3_5';
import OnboardingStep4 from '../components/onboarding/OnboardingStep4';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUser, setOnboardingComplete, isCreatingUser, setCreatingUser } = useUserStore();
  const { user: authUser } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    height: '',
    weight: '',
    goal: '',
    personal_record_5k: '',
    weekly_frequency: 3, // Default to 3x per week
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      }

      const height = parseInt(formData.height);
      if (!formData.height || isNaN(height) || height < 100 || height > 250) {
        newErrors.height = 'Altura deve estar entre 100 e 250 cm';
      }

      const weight = parseFloat(formData.weight);
      if (!formData.weight || isNaN(weight) || weight < 30 || weight > 200) {
        newErrors.weight = 'Peso deve estar entre 30 e 200 kg';
      }
    }

    if (step === 2) {
      if (!formData.goal) {
        newErrors.goal = 'Selecione um objetivo';
      }
    }

    if (step === 3) {
      const timeRegex = /^([0-5]?[0-9]):([0-5][0-9])$/;
      if (!formData.personal_record_5k || !timeRegex.test(formData.personal_record_5k)) {
        newErrors.personal_record_5k = 'Formato deve ser MM:SS (ex: 25:30)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    if (!validateStep(4)) return;

    setCreatingUser(true);

    try {
      const userData = {
        name: formData.name.trim(),
        height: parseInt(formData.height),
        weight: parseFloat(formData.weight),
        personal_record_5k: formData.personal_record_5k,
        goal: formData.goal,
        weekly_frequency: parseInt(formData.weekly_frequency.toString()),
        auth_user_id: authUser?.id, // Include auth user ID
      };

      const response = await apiService.createUser(userData);

      setUser(response.user);
      setOnboardingComplete(true);
      router.replace('/generating-plan');

    } catch (error: any) {
      console.error('Error creating user:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível criar sua conta. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setCreatingUser(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep1
            formData={formData}
            errors={errors}
            onUpdateField={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <OnboardingStep2
            selectedGoal={formData.goal}
            onSelectGoal={(goal) => updateFormData('goal', goal)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            personalRecord={formData.personal_record_5k}
            onUpdatePersonalRecord={(value) => updateFormData('personal_record_5k', value)}
            onNext={handleNext}
            onBack={handleBack}
            error={errors.personal_record_5k}
          />
        );
      case 4:
        return (
          <OnboardingStep3_5
            selectedFrequency={formData.weekly_frequency}
            onSelectFrequency={(frequency: number) => updateFormData('weekly_frequency', frequency.toString())}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <OnboardingStep4
            formData={formData}
            onFinish={handleFinish}
            onBack={handleBack}
            isLoading={isCreatingUser}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4, 5].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  currentStep >= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepText}>
            Passo {currentStep} de 5
          </Text>
        </View>

        <View style={styles.content}>
          {renderStep()}
        </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ProRunnerColors.cardBackground,
  },
  progressDotActive: {
    backgroundColor: ProRunnerColors.primary,
  },
  stepText: {
    fontSize: 16,
    color: ProRunnerColors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
}); 