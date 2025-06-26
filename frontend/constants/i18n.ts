export type Language = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    // Common
    cancel: 'Cancelar',
    save: 'Salvar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    yes: 'Sim',
    no: 'Não',
    
    // Home Screen
    greeting: 'Olá, {{name}}! 👋',
    plan: 'Plano: {{goal}}',
    configuring_plan: 'Configurando seu plano...',
    loading_plan: 'Carregando seu plano...',
    
    // Weather
    weather_today: '🌤️ Clima de Hoje',
    perfect_for_running: '🏃‍♂️ Perfeito para correr!',
    hot_day: '🌡️ Dia quente, hidrate-se!',
    cold_day: '🧥 Dia frio, aqueça-se bem!',
    rainy_day: '🌧️ Chuva, considere treino indoor!',
    
    // Workouts
    next_workout: 'Próximo Treino',
    start_workout: 'Iniciar Treino',
    week_summary: 'Resumo da Semana',
    workouts_completed: '{{completed}} de {{total}} treinos',
    congratulations: 'Parabéns! 🎉',
    workout_registered: 'Treino registrado com sucesso!',
    
    // Workout Types
    regenerativo: 'Regenerativo',
    tempo: 'Tempo',
    longao: 'Longão',
    tiros: 'Tiros',
    
    // Onboarding
    welcome: 'Bem-vindo!',
    name_placeholder: 'Digite seu nome',
    age_placeholder: 'Idade',
    weight_placeholder: 'Peso (kg)',
    height_placeholder: 'Altura (cm)',
    next: 'Próximo',
    back: 'Voltar',
    finish: 'Finalizar',
    
    // Goals
    goal_selection: 'Qual é o seu objetivo?',
    start_running: 'Começar a correr',
    run_5k: 'Correr 5km',
    run_10k: 'Correr 10km',
    half_marathon: 'Meia maratona',
    marathon: 'Maratona',
    improve_time: 'Melhorar tempo',
    perder_peso: 'Perder peso',
    
    // Frequency
    training_frequency: 'Frequência de treino',
    times_per_week: '{{times}}x por semana',
    
    // Tabs
    today: 'Hoje',
    plan_tab: 'Plano',
    progress: 'Progresso',
    profile: 'Perfil',
    
    // Errors
    error_loading_plan: 'Não foi possível carregar seu plano de treino.',
    try_again: 'Tentar Novamente',
    error_location: 'Erro ao obter localização',
    error_weather: 'Erro ao obter dados do clima',
    unexpected_error: 'Erro Inesperado',
    error_description: 'Algo deu errado. Nossa equipe foi notificada e está trabalhando para resolver o problema.',
    go_home: 'Ir para Início',
    report_error: 'Reportar Erro',
    
    // New keys
    inspiration_of_day: 'Inspiração do Dia',
    motivational_fallback: '🌟 Você é mais forte do que suas desculpas.',
    
    // Auth
    welcome_back: 'Bem-vindo de volta! 🏃‍♂️',
    login_subtitle: 'Faça login para continuar sua jornada',
    email: 'Email',
    password: 'Senha',
    login: 'Entrar',
    forgot_password: 'Esqueci minha senha',
    no_account: 'Não tem uma conta?',
    create_account: ' Criar conta',
    start_journey: 'Começar sua jornada! 🚀',
    signup_subtitle: 'Crie sua conta e comece a treinar imediatamente',
    confirm_password: 'Confirmar Senha',
    signup: 'Criar Conta',
    have_account: 'Já tem uma conta?',
    login_link: ' Fazer login',
    forgot_password_title: 'Esqueceu a senha? 🔐',
    forgot_password_subtitle: 'Não se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.',
    send_reset_link: 'Enviar Link de Recuperação',
    remembered_password: 'Lembrou da senha?',
    email_sent: 'Email Enviado! 📧',
    reset_email_message: 'Enviamos um link para redefinir sua senha para',
    check_email_instruction: 'Verifique sua caixa de entrada e siga as instruções no email para criar uma nova senha.',
    back_to_login: 'Voltar ao Login',
    resend_email: 'Não recebeu o email?',
    resend: 'Reenviar',
  },
  
  en: {
    // Common
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
    
    // Home Screen
    greeting: 'Hello, {{name}}! 👋',
    plan: 'Plan: {{goal}}',
    configuring_plan: 'Setting up your plan...',
    loading_plan: 'Loading your plan...',
    
    // Weather
    weather_today: '🌤️ Today\'s Weather',
    perfect_for_running: '🏃‍♂️ Perfect for running!',
    hot_day: '🌡️ Hot day, stay hydrated!',
    cold_day: '🧥 Cold day, warm up well!',
    rainy_day: '🌧️ Rainy, consider indoor training!',
    
    // Workouts
    next_workout: 'Next Workout',
    start_workout: 'Start Workout',
    week_summary: 'Week Summary',
    workouts_completed: '{{completed}} of {{total}} workouts',
    congratulations: 'Congratulations! 🎉',
    workout_registered: 'Workout registered successfully!',
    
    // Workout Types
    regenerativo: 'Recovery',
    tempo: 'Tempo',
    longao: 'Long Run',
    tiros: 'Intervals',
    
    // Onboarding
    welcome: 'Welcome!',
    name_placeholder: 'Enter your name',
    age_placeholder: 'Age',
    weight_placeholder: 'Weight (kg)',
    height_placeholder: 'Height (cm)',
    next: 'Next',
    back: 'Back',
    finish: 'Finish',
    
    // Goals
    goal_selection: 'What is your goal?',
    start_running: 'Start running',
    run_5k: 'Run 5km',
    run_10k: 'Run 10km',
    half_marathon: 'Half marathon',
    marathon: 'Marathon',
    improve_time: 'Improve time',
    perder_peso: 'Lose weight',
    
    // Frequency
    training_frequency: 'Training frequency',
    times_per_week: '{{times}}x per week',
    
    // Tabs
    today: 'Today',
    plan_tab: 'Plan',
    progress: 'Progress',
    profile: 'Profile',
    
    // Errors
    error_loading_plan: 'Could not load your training plan.',
    try_again: 'Try Again',
    error_location: 'Error getting location',
    error_weather: 'Error getting weather data',
    unexpected_error: 'Unexpected Error',
    error_description: 'Something went wrong. Our team has been notified and is working to resolve the issue.',
    go_home: 'Go Home',
    report_error: 'Report Error',
    
    // New keys
    inspiration_of_day: 'Inspiration of the Day',
    motivational_fallback: '🌟 You are stronger than your excuses.',
    
    // Auth
    welcome_back: 'Welcome back! 🏃‍♂️',
    login_subtitle: 'Sign in to continue your journey',
    email: 'Email',
    password: 'Password',
    login: 'Sign In',
    forgot_password: 'Forgot password',
    no_account: "Don't have an account?",
    create_account: ' Create account',
    start_journey: 'Start your journey! 🚀',
    signup_subtitle: 'Create your account and start training immediately',
    confirm_password: 'Confirm Password',
    signup: 'Create Account',
    have_account: 'Already have an account?',
    login_link: ' Sign in',
    forgot_password_title: 'Forgot password? 🔐',
    forgot_password_subtitle: "Don't worry! Enter your email and we'll send you a link to reset your password.",
    send_reset_link: 'Send Recovery Link',
    remembered_password: 'Remembered your password?',
    email_sent: 'Email Sent! 📧',
    reset_email_message: 'We sent a password reset link to',
    check_email_instruction: 'Check your inbox and follow the instructions in the email to create a new password.',
    back_to_login: 'Back to Login',
    resend_email: "Didn't receive the email?",
    resend: 'Resend',
  },
  
  es: {
    // Common
    cancel: 'Cancelar',
    save: 'Guardar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    yes: 'Sí',
    no: 'No',
    
    // Home Screen
    greeting: '¡Hola, {{name}}! 👋',
    plan: 'Plan: {{goal}}',
    configuring_plan: 'Configurando tu plan...',
    loading_plan: 'Cargando tu plan...',
    
    // Weather
    weather_today: '🌤️ Clima de Hoy',
    perfect_for_running: '🏃‍♂️ ¡Perfecto para correr!',
    hot_day: '🌡️ Día caluroso, ¡hidrátate!',
    cold_day: '🧥 Día frío, ¡calienta bien!',
    rainy_day: '🌧️ Lluvia, ¡considera entrenamiento interior!',
    
    // Workouts
    next_workout: 'Próximo Entrenamiento',
    start_workout: 'Iniciar Entrenamiento',
    week_summary: 'Resumen de la Semana',
    workouts_completed: '{{completed}} de {{total}} entrenamientos',
    congratulations: '¡Felicitaciones! 🎉',
    workout_registered: '¡Entrenamiento registrado con éxito!',
    
    // Workout Types
    regenerativo: 'Regenerativo',
    tempo: 'Tempo',
    longao: 'Carrera Larga',
    tiros: 'Intervalos',
    
    // Onboarding
    welcome: '¡Bienvenido!',
    name_placeholder: 'Ingresa tu nombre',
    age_placeholder: 'Edad',
    weight_placeholder: 'Peso (kg)',
    height_placeholder: 'Altura (cm)',
    next: 'Siguiente',
    back: 'Atrás',
    finish: 'Finalizar',
    
    // Goals
    goal_selection: '¿Cuál es tu objetivo?',
    start_running: 'Empezar a correr',
    run_5k: 'Correr 5km',
    run_10k: 'Correr 10km',
    half_marathon: 'Media maratón',
    marathon: 'Maratón',
    improve_time: 'Mejorar tiempo',
    perder_peso: 'Perder peso',
    
    // Frequency
    training_frequency: 'Frecuencia de entrenamiento',
    times_per_week: '{{times}}x por semana',
    
    // Tabs
    today: 'Hoy',
    plan_tab: 'Plan',
    progress: 'Progreso',
    profile: 'Perfil',
    
    // Errors
    error_loading_plan: 'No se pudo cargar tu plan de entrenamiento.',
    try_again: 'Intentar de Nuevo',
    error_location: 'Error al obtener ubicación',
    error_weather: 'Error al obtener datos del clima',
    
    // New keys
    inspiration_of_day: 'Inspiración del Día',
    motivational_fallback: '🌟 Eres más fuerte que tus excusas.',
    
    // Auth
    welcome_back: '¡Bienvenido de vuelta! 🏃‍♂️',
    login_subtitle: 'Inicia sesión para continuar tu viaje',
    email: 'Email',
    password: 'Contraseña',
    login: 'Iniciar Sesión',
    forgot_password: 'Olvidé mi contraseña',
    no_account: '¿No tienes una cuenta?',
    create_account: ' Crear cuenta',
    start_journey: '¡Comienza tu viaje! 🚀',
    signup_subtitle: 'Crea tu cuenta y empieza a entrenar inmediatamente',
    confirm_password: 'Confirmar Contraseña',
    signup: 'Crear Cuenta',
    have_account: '¿Ya tienes una cuenta?',
    login_link: ' Iniciar sesión',
    forgot_password_title: '¿Olvidaste la contraseña? 🔐',
    forgot_password_subtitle: '¡No te preocupes! Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.',
    send_reset_link: 'Enviar Enlace de Recuperación',
    remembered_password: '¿Recordaste tu contraseña?',
    email_sent: '¡Email Enviado! 📧',
    reset_email_message: 'Enviamos un enlace para restablecer tu contraseña a',
    check_email_instruction: 'Revisa tu bandeja de entrada y sigue las instrucciones en el email para crear una nueva contraseña.',
    back_to_login: 'Volver al Login',
    resend_email: '¿No recibiste el email?',
    resend: 'Reenviar',
  }
};

// Current language - default to Portuguese
let currentLanguage: Language = 'pt';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
};

export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};

export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation key "${key}" not found for language "${currentLanguage}"`);
    return key;
  }
  
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match: string, param: string) => {
      return params[param]?.toString() || match;
    });
  }
  
  return value;
};

export const fitnessLevels = {
  pt: {
    beginner: 'Iniciante',
    beginner_intermediate: 'Iniciante-Intermediário', 
    intermediate: 'Intermediário',
    advanced: 'Avançado'
  },
  en: {
    beginner: 'Beginner',
    beginner_intermediate: 'Beginner-Intermediate',
    intermediate: 'Intermediate', 
    advanced: 'Advanced'
  }
} as const;

export const workoutTypes = {
  pt: {
    longao: 'Corrida Longa',
    tiros: 'Treino de Velocidade',
    tempo: 'Treino Tempo',
    regenerativo: 'Corrida Regenerativa',
    // Novos tipos baseados em metodologias científicas
    easy: 'Corrida Leve',
    interval: 'Treino Intervalado',
    long: 'Corrida Longa',
    recovery: 'Recuperação Ativa',
    fartlek: 'Fartlek (Jogo de Velocidade)',
    hill: 'Treino de Subidas',
    progressive: 'Corrida Progressiva',
    ladder: 'Treino em Escada',
    long_surges: 'Longão com Surges',
    progressive_long: 'Longão Progressivo'
  },
  en: {
    longao: 'Long Run',
    tiros: 'Speed Workout',
    tempo: 'Tempo Run',
    regenerativo: 'Recovery Run',
    // New types based on scientific methodologies
    easy: 'Easy Run',
    interval: 'Interval Training',
    long: 'Long Run',
    recovery: 'Recovery Run',
    fartlek: 'Fartlek (Speed Play)',
    hill: 'Hill Repeats',
    progressive: 'Progressive Run',
    ladder: 'Ladder Workout',
    long_surges: 'Long Run with Surges',
    progressive_long: 'Progressive Long Run'
  }
} as const; 