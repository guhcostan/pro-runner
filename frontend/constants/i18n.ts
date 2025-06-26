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
    
    // Adaptive System & Gamification
    adaptive_plan: 'Plano Adaptativo',
    level: 'Nível',
    xp: 'XP',
    total_xp: 'XP Total',
    next_level: 'Próximo nível',
    xp_remaining: 'Faltam {{xp}} XP',
    current_phase: 'Fase Atual',
    next_phase: 'Próxima Fase',
    advance_to_phase: 'Avançar para {{phase}}',
    phase_advancement: 'Avanço de Fase',
    
    // Level Titles
    level_beginner: 'Iniciante',
    level_intermediate: 'Intermediário',
    level_advanced: 'Avançado',
    level_expert: 'Expert',
    level_elite: 'Elite',
    
    // Training Phases
    phase_foundation: 'Fundação',
    phase_development: 'Desenvolvimento',
    phase_performance: 'Desempenho',
    phase_specialization: 'Especialização',
    phase_mastery: 'Maestria',
    
    // Phase Descriptions
    phase_foundation_desc: 'Construindo base aeróbica e adaptação inicial ao treino de corrida.',
    phase_development_desc: 'Desenvolvendo resistência e aumentando volume de treino gradualmente.',
    phase_performance_desc: 'Foco em velocidade, intervalos e melhoria de performance.',
    phase_specialization_desc: 'Treinos específicos para objetivos e especialização técnica.',
    phase_mastery_desc: 'Refinamento técnico e manutenção de alto nível de performance.',
    
    // Achievements
    achievements: 'Conquistas',
    achievements_unlocked: '{{count}} de {{total}} desbloqueadas',
    recent_achievements: 'Recentes',
    all_achievements: 'Todas as Conquistas',
    achievement_earned: 'Conquista Desbloqueada!',
    first_workout_achievement: 'Primeira Corrida',
    first_workout_desc: 'Completou seu primeiro treino!',
    distance_milestone_achievement: 'Marco de Distância',
    consistency_streak_achievement: 'Sequência de Consistência',
    level_milestone_achievement: 'Marco de Nível',
    phase_advancement_achievement: 'Avanço de Fase',
    
    // Adaptive Plan Generation
    generating_adaptive_plan: 'Gerando Plano Adaptativo...',
    adaptive_plan_generated: 'Plano Adaptativo Gerado!',
    generate_new_plan: 'Gerar Novo Plano',
    plan_message: 'Seu plano foi personalizado baseado na sua fase atual e progresso.',
    
    // Workout Completion
    workout_completed: 'Treino Concluído!',
    xp_earned: '{{xp}} XP Ganhos',
    level_up: 'Subiu de Nível!',
    new_level_reached: 'Nível {{level}} Alcançado!',
    
    // Progress & Stats
    gamified_stats: 'Estatísticas Gamificadas',
    ranking_position: 'Posição no Ranking',
    total_workouts: 'Total de Treinos',
    current_streak: 'Sequência Atual',
    phase_progress: 'Progresso da Fase',
    
    // Phase Advancement
    advance_phase_title: 'Avançar para Próxima Fase',
    advance_phase_question: 'Tem certeza que deseja avançar para a fase {{phase}}?',
    advance_phase_success: 'Parabéns! Você avançou para {{phase}}!',
    advancement_criteria: 'Para avançar, você precisa:',
    mastery_reached: 'Parabéns! Você alcançou a fase máxima!',
    mastery_message: 'Continue treinando para manter sua excelência',
    
    // Motivational Messages
    first_workout_motivation: 'Complete seu primeiro treino para ganhar sua primeira conquista!',
    continue_training_motivation: 'Continue treinando para desbloquear mais conquistas!',
    all_achievements_motivation: 'Parabéns! Você desbloqueou todas as conquistas!',
    
    // Legacy Plan
    legacy_plan: 'Plano Legado',
    continuous_training: 'Treino contínuo baseado na sua progressão',
    plans_evolve: 'Planos que evoluem com você',
    
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
    
    // Adaptive System & Gamification
    adaptive_plan: 'Adaptive Plan',
    level: 'Level',
    xp: 'XP',
    total_xp: 'Total XP',
    next_level: 'Next level',
    xp_remaining: '{{xp}} XP remaining',
    current_phase: 'Current Phase',
    next_phase: 'Next Phase',
    advance_to_phase: 'Advance to {{phase}}',
    phase_advancement: 'Phase Advancement',
    
    // Level Titles
    level_beginner: 'Beginner',
    level_intermediate: 'Intermediate',
    level_advanced: 'Advanced',
    level_expert: 'Expert',
    level_elite: 'Elite',
    
    // Training Phases
    phase_foundation: 'Foundation',
    phase_development: 'Development',
    phase_performance: 'Performance',
    phase_specialization: 'Specialization',
    phase_mastery: 'Mastery',
    
    // Phase Descriptions
    phase_foundation_desc: 'Building aerobic base and initial adaptation to running training.',
    phase_development_desc: 'Developing endurance and gradually increasing training volume.',
    phase_performance_desc: 'Focus on speed, intervals and performance improvement.',
    phase_specialization_desc: 'Specific training for goals and technical specialization.',
    phase_mastery_desc: 'Technical refinement and maintenance of high performance level.',
    
    // Achievements
    achievements: 'Achievements',
    achievements_unlocked: '{{count}} of {{total}} unlocked',
    recent_achievements: 'Recent',
    all_achievements: 'All Achievements',
    achievement_earned: 'Achievement Unlocked!',
    first_workout_achievement: 'First Run',
    first_workout_desc: 'Completed your first workout!',
    distance_milestone_achievement: 'Distance Milestone',
    consistency_streak_achievement: 'Consistency Streak',
    level_milestone_achievement: 'Level Milestone',
    phase_advancement_achievement: 'Phase Advancement',
    
    // Adaptive Plan Generation
    generating_adaptive_plan: 'Generating Adaptive Plan...',
    adaptive_plan_generated: 'Adaptive Plan Generated!',
    generate_new_plan: 'Generate New Plan',
    plan_message: 'Your plan has been personalized based on your current phase and progress.',
    
    // Workout Completion
    workout_completed: 'Workout Completed!',
    xp_earned: '{{xp}} XP Earned',
    level_up: 'Level Up!',
    new_level_reached: 'Level {{level}} Reached!',
    
    // Progress & Stats
    gamified_stats: 'Gamified Stats',
    ranking_position: 'Ranking Position',
    total_workouts: 'Total Workouts',
    current_streak: 'Current Streak',
    phase_progress: 'Phase Progress',
    
    // Phase Advancement
    advance_phase_title: 'Advance to Next Phase',
    advance_phase_question: 'Are you sure you want to advance to {{phase}} phase?',
    advance_phase_success: 'Congratulations! You advanced to {{phase}}!',
    advancement_criteria: 'To advance, you need:',
    mastery_reached: 'Congratulations! You reached the maximum phase!',
    mastery_message: 'Keep training to maintain your excellence',
    
    // Motivational Messages
    first_workout_motivation: 'Complete your first workout to earn your first achievement!',
    continue_training_motivation: 'Keep training to unlock more achievements!',
    all_achievements_motivation: 'Congratulations! You unlocked all achievements!',
    
    // Legacy Plan
    legacy_plan: 'Legacy Plan',
    continuous_training: 'Continuous training based on your progression',
    plans_evolve: 'Plans that evolve with you',
    
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
    
    // Adaptive System & Gamification
    adaptive_plan: 'Plan Adaptativo',
    level: 'Nivel',
    xp: 'XP',
    total_xp: 'XP Total',
    next_level: 'Siguiente nivel',
    xp_remaining: 'Faltan {{xp}} XP',
    current_phase: 'Fase Actual',
    next_phase: 'Siguiente Fase',
    advance_to_phase: 'Avanzar a {{phase}}',
    phase_advancement: 'Avance de Fase',
    
    // Level Titles
    level_beginner: 'Principiante',
    level_intermediate: 'Intermedio',
    level_advanced: 'Avanzado',
    level_expert: 'Experto',
    level_elite: 'Elite',
    
    // Training Phases
    phase_foundation: 'Fundación',
    phase_development: 'Desarrollo',
    phase_performance: 'Rendimiento',
    phase_specialization: 'Especialización',
    phase_mastery: 'Maestría',
    
    // Phase Descriptions
    phase_foundation_desc: 'Construyendo base aeróbica y adaptación inicial al entrenamiento de carrera.',
    phase_development_desc: 'Desarrollando resistencia y aumentando volumen de entrenamiento gradualmente.',
    phase_performance_desc: 'Enfoque en velocidad, intervalos y mejora del rendimiento.',
    phase_specialization_desc: 'Entrenamiento específico para objetivos y especialización técnica.',
    phase_mastery_desc: 'Refinamiento técnico y mantenimiento de alto nivel de rendimiento.',
    
    // Achievements
    achievements: 'Logros',
    achievements_unlocked: '{{count}} de {{total}} desbloqueados',
    recent_achievements: 'Recientes',
    all_achievements: 'Todos los Logros',
    achievement_earned: '¡Logro Desbloqueado!',
    first_workout_achievement: 'Primera Carrera',
    first_workout_desc: '¡Completaste tu primer entrenamiento!',
    distance_milestone_achievement: 'Hito de Distancia',
    consistency_streak_achievement: 'Racha de Consistencia',
    level_milestone_achievement: 'Hito de Nivel',
    phase_advancement_achievement: 'Avance de Fase',
    
    // Adaptive Plan Generation
    generating_adaptive_plan: 'Generando Plan Adaptativo...',
    adaptive_plan_generated: '¡Plan Adaptativo Generado!',
    generate_new_plan: 'Generar Nuevo Plan',
    plan_message: 'Tu plan ha sido personalizado basado en tu fase actual y progreso.',
    
    // Workout Completion
    workout_completed: '¡Entrenamiento Completado!',
    xp_earned: '{{xp}} XP Ganados',
    level_up: '¡Subiste de Nivel!',
    new_level_reached: '¡Nivel {{level}} Alcanzado!',
    
    // Progress & Stats
    gamified_stats: 'Estadísticas Gamificadas',
    ranking_position: 'Posición en el Ranking',
    total_workouts: 'Total de Entrenamientos',
    current_streak: 'Racha Actual',
    phase_progress: 'Progreso de Fase',
    
    // Phase Advancement
    advance_phase_title: 'Avanzar a Siguiente Fase',
    advance_phase_question: '¿Estás seguro que quieres avanzar a la fase {{phase}}?',
    advance_phase_success: '¡Felicitaciones! ¡Avanzaste a {{phase}}!',
    advancement_criteria: 'Para avanzar, necesitas:',
    mastery_reached: '¡Felicitaciones! ¡Alcanzaste la fase máxima!',
    mastery_message: 'Continúa entrenando para mantener tu excelencia',
    
    // Motivational Messages
    first_workout_motivation: '¡Completa tu primer entrenamiento para ganar tu primer logro!',
    continue_training_motivation: '¡Continúa entrenando para desbloquear más logros!',
    all_achievements_motivation: '¡Felicitaciones! ¡Desbloqueaste todos los logros!',
    
    // Legacy Plan
    legacy_plan: 'Plan Legado',
    continuous_training: 'Entrenamiento continuo basado en tu progresión',
    plans_evolve: 'Planes que evolucionan contigo',
    
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
      return params[param] !== undefined ? params[param].toString() : match;
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