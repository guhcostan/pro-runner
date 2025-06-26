import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { translations, getCurrentLanguage, Language } from '../constants/i18n';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Error logging service
class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: Array<{
    error: Error;
    timestamp: string;
    context?: Record<string, any>;
  }> = [];

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error, context?: Record<string, any>) {
    const errorEntry = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      context,
    };

    this.errors.push(errorEntry);
    
    // Log to console in development
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error);
      console.error('Context:', context);
    }

    // In production, you would send this to your error tracking service
    this.sendToErrorService(errorEntry);
  }

  private async sendToErrorService(errorEntry: any) {
    try {
      // In a real app, send to your error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorEntry),
      // });
    } catch (e) {
      console.error('Failed to send error to service:', e);
    }
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Get user language helper
const getUserLanguage = (): Language => {
  return getCurrentLanguage();
};

// Error Fallback Component
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const lang = getUserLanguage();
  const theme = Colors[colorScheme ?? 'light'];
  const messages = translations[lang];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      backgroundColor: theme.tint + '10',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      width: '100%',
      maxWidth: 400,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    message: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 24,
    },
    errorDetails: {
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
    },
    errorText: {
      fontSize: 12,
      color: theme.text,
      fontFamily: 'monospace',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      maxWidth: 400,
    },
    button: {
      backgroundColor: theme.tint,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 120,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderColor: theme.tint,
      borderWidth: 1,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    secondaryButtonText: {
      color: theme.tint,
    },
  });

  const handleGoHome = () => {
    try {
      resetErrorBoundary();
      router.replace('/');
    } catch (e) {
      console.error('Failed to navigate home:', e);
    }
  };

  const handleReportError = () => {
    // In a real app, you would implement error reporting
    console.log('Error reported:', error);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.errorContainer}>
        <Text style={styles.title}>
          {(messages as any).unexpected_error || 'Erro Inesperado'}
        </Text>
        
        <Text style={styles.message}>
          {(messages as any).error_description || 
           'Algo deu errado. Nossa equipe foi notificada e está trabalhando para resolver o problema.'}
        </Text>

        {__DEV__ && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorText}>
              {error.name}: {error.message}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={resetErrorBoundary}>
          <Text style={styles.buttonText}>
            {(messages as any).try_again || 'Tentar Novamente'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={handleGoHome}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {(messages as any).go_home || 'Ir para Início'}
          </Text>
        </TouchableOpacity>
      </View>

      {__DEV__ && (
        <TouchableOpacity 
          style={[styles.button, { marginTop: 20 }]} 
          onPress={handleReportError}
        >
          <Text style={styles.buttonText}>
            {(messages as any).report_error || 'Reportar Erro'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

// Main Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: any) => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback: FallbackComponent = ErrorFallback,
  onError 
}) => {
  const handleError = (error: Error, errorInfo: any) => {
    // Log error to our service
    ErrorLogger.getInstance().logError(error, errorInfo);
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      onReset={() => {
        // Clear any error state if needed
        ErrorLogger.getInstance().clearErrors();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Hook for accessing error logger
export const useErrorLogger = () => {
  return ErrorLogger.getInstance();
};

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  const errorLogger = ErrorLogger.getInstance();

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: any) => {
    console.error('Unhandled promise rejection:', event.reason);
    errorLogger.logError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      { type: 'unhandledRejection' }
    );
  };

  // Handle uncaught errors
  const handleError = (event: any) => {
    console.error('Uncaught error:', event.error);
    errorLogger.logError(
      event.error || new Error(event.message),
      { 
        type: 'uncaughtError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno 
      }
    );
  };

  // Add global error listeners (for web)
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Return cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }

  return () => {}; // No-op for React Native
};

export default ErrorBoundary; 