export type Language = 'pt' | 'en';

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
    
    // New keys
    inspiration_of_day: 'Inspiração do Dia',
    motivational_fallback: '🌟 Você é mais forte do que suas desculpas.',
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
    
    // New keys
    inspiration_of_day: 'Inspiration of the Day',
    motivational_fallback: '🌟 You are stronger than your excuses.',
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