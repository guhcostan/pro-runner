// Removido import não utilizado: evaluate

/**
 * Converte string de tempo (MM:SS) para segundos totais
 * @param {string} timeString - Tempo no formato MM:SS
 * @returns {number} Tempo em segundos
 */
function timeToSeconds(timeString) {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}

/**
 * Converte segundos totais para string de tempo (MM:SS)
 * @param {number} totalSeconds - Tempo em segundos
 * @returns {string} Tempo no formato MM:SS
 */
function secondsToTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calcula VDOT baseado no tempo de 5K usando fórmula de Jack Daniels
 * @param {number} time5kSeconds - Tempo de 5K em segundos
 * @returns {number} VDOT estimado
 */
function calculateVDOT(time5kSeconds) {
  // Fórmula VDOT de Jack Daniels: VDOT = -4.6 + 0.182258 * (velocidade em m/min) + 0.000104 * (velocidade em m/min)²
  const velocityMPerMin = (5000 / time5kSeconds) * 60; // metros por minuto
  const vdot = -4.6 + 0.182258 * velocityMPerMin + 0.000104 * Math.pow(velocityMPerMin, 2);
  return Math.max(25, Math.min(85, vdot)); // Limita entre 25-85 para valores realistas
}

/**
 * Calcula paces para diferentes zonas baseado no VDOT de Jack Daniels
 * @param {number} time5kSeconds - Tempo de 5K em segundos
 * @returns {Object} Objeto com paces para cada zona
 */
function calculateTrainingPaces(time5kSeconds) {
  const pace5kPerKm = time5kSeconds / 5; // pace de 5K por km em segundos
  
  // Paces baseados no sistema VDOT de Jack Daniels
  const paces = {
    interval: pace5kPerKm, // igual ao pace de 5K
    tempo: pace5kPerKm + 20, // +15 a +25 s/km (média 20s)
    easy: pace5kPerKm + 82, // +75 a +90 s/km (média 82s)
    long: pace5kPerKm + 67, // +60 a +75 s/km (média 67s)
    recovery: pace5kPerKm + 105 // +90 a +120 s/km (média 105s)
  };

  // Converte para strings MM:SS
  return {
    interval: secondsToTime(paces.interval),
    tempo: secondsToTime(paces.tempo),
    easy: secondsToTime(paces.easy),
    long: secondsToTime(paces.long),
    recovery: secondsToTime(paces.recovery),
    intervalSeconds: paces.interval,
    tempoSeconds: paces.tempo,
    easySeconds: paces.easy,
    longSeconds: paces.long,
    recoverySeconds: paces.recovery
  };
}

/**
 * Estima distância máxima suportável baseada no VDOT e condicionamento atual
 * @param {number} time5kSeconds - Tempo de 5K em segundos
 * @param {number} weeklyFrequency - Frequência semanal de treinos
 * @returns {Object} Estimativas de distância e volume
 */
function estimateMaxSupportableDistance(time5kSeconds, weeklyFrequency) {
  const vdot = calculateVDOT(time5kSeconds);
  
  // Estimativa de distâncias equivalentes baseada no VDOT (fórmulas de Jack Daniels)
  const velocity5k = 5000 / time5kSeconds; // m/s
  
  // Estimativas conservadoras para diferentes distâncias
  const estimatedTimes = {
    '10k': time5kSeconds * 2.07, // Fator típico 5K para 10K
    'half': time5kSeconds * 4.67, // Fator típico 5K para meia maratona
    'marathon': time5kSeconds * 9.78 // Fator típico 5K para maratona
  };

  // Calcula capacidade atual baseada no VDOT e frequência
  const baseCapacity = Math.max(5, vdot * 0.6); // Capacidade base em km
  const frequencyMultiplier = Math.min(1.5, 0.7 + (weeklyFrequency * 0.1)); // 0.8 a 1.5
  const currentMaxDistance = baseCapacity * frequencyMultiplier;

  // Volume semanal seguro (60-75% da capacidade máxima)
  const safeWeeklyVolume = currentMaxDistance * 0.65;
  
  // Distância máxima do longão (começar com 60% da capacidade, max 90%)
  const maxLongRunStart = Math.min(currentMaxDistance * 0.6, 21); // Máximo 21km para segurança
  const maxLongRunPeak = Math.min(currentMaxDistance * 0.9, 32); // Máximo 32km para segurança

  return {
    vdot,
    currentMaxDistance: Math.round(currentMaxDistance),
    safeWeeklyVolume: Math.round(safeWeeklyVolume),
    maxLongRunStart: Math.round(maxLongRunStart),
    maxLongRunPeak: Math.round(maxLongRunPeak),
    estimatedTimes,
    canHandle: {
      '5k': true,
      '10k': currentMaxDistance >= 8,
      'half': currentMaxDistance >= 15,
      'marathon': currentMaxDistance >= 25
    }
  };
}

/**
 * Valida se o objetivo é realista para o nível atual do atleta
 * @param {string} goal - Objetivo do usuário
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Object} Validação e ajustes necessários
 */
function validateGoalRealism(goal, capabilities) {
  const goalRequirements = {
    'start_running': { minDistance: 3, idealDistance: 5 },
    'run_5k': { minDistance: 5, idealDistance: 8 },
    'run_10k': { minDistance: 8, idealDistance: 12 },
    'half_marathon': { minDistance: 15, idealDistance: 21 },
    'marathon': { minDistance: 25, idealDistance: 35 },
    'improve_time': { minDistance: 5, idealDistance: 10 }
  };

  const requirement = goalRequirements[goal] || goalRequirements['run_5k'];
  const isRealistic = capabilities.currentMaxDistance >= requirement.minDistance;
  const isIdeal = capabilities.currentMaxDistance >= requirement.idealDistance;

  let adjustedGoal = goal;
  let warning = null;

  if (!isRealistic) {
    // Objetivo muito ambicioso, sugerir ajuste
    if (capabilities.currentMaxDistance < 5) {
      adjustedGoal = 'start_running';
      warning = 'Objetivo ajustado para "Começar a Correr" baseado no condicionamento atual.';
    } else if (capabilities.currentMaxDistance < 8) {
      adjustedGoal = 'run_5k';
      warning = 'Objetivo ajustado para "5K" baseado no condicionamento atual.';
    } else if (capabilities.currentMaxDistance < 15) {
      adjustedGoal = 'run_10k';
      warning = 'Objetivo ajustado para "10K" baseado no condicionamento atual.';
    }
  }

  return {
    isRealistic,
    isIdeal,
    adjustedGoal,
    warning,
    recommendedWeeks: isIdeal ? 8 : Math.max(12, Math.ceil(16 - capabilities.currentMaxDistance))
  };
}

/**
 * Calcula BMI e nível de fitness baseado nos dados do usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Object} Informações de fitness
 */
function calculateFitnessLevel(userData) {
  const { height, weight, personal_record_5k } = userData;
  
  // Calcula BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Converte RP 5k para segundos
  const time5kSeconds = timeToSeconds(personal_record_5k);
  const pace5kPerKm = time5kSeconds / 5;
  
  // Calcula VDOT e capacidades
  const vdot = calculateVDOT(time5kSeconds);
  const paces = calculateTrainingPaces(time5kSeconds);
  
  // Classifica nível baseado no VDOT (mais preciso que apenas o pace)
  let fitnessLevel;
  if (vdot >= 55) {
    fitnessLevel = 'advanced';
  } else if (vdot >= 45) {
    fitnessLevel = 'intermediate';
  } else if (vdot >= 35) {
    fitnessLevel = 'beginner_intermediate';
  } else {
    fitnessLevel = 'beginner';
  }
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    fitnessLevel,
    vdot,
    pace5kPerKm: secondsToTime(pace5kPerKm),
    paces,
    time5kSeconds
  };
}

/**
 * Gera plano de treino baseado nos dados do usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Object} Plano de treino completo
 */
function generateTrainingPlan(userData) {
  const { goal, goal_date, weekly_frequency = 3 } = userData;
  const fitnessInfo = calculateFitnessLevel(userData);
  
  // Estima capacidades do atleta
  const capabilities = estimateMaxSupportableDistance(fitnessInfo.time5kSeconds, weekly_frequency);
  
  // Valida realismo do objetivo
  const validation = validateGoalRealism(goal, capabilities);
  const finalGoal = validation.adjustedGoal;
  
  // Calcula o número de semanas até a data objetivo (se fornecida)
  let totalWeeks = validation.recommendedWeeks || 8;
  if (goal_date) {
    const now = new Date();
    const goalDate = new Date(goal_date);
    const timeDiff = goalDate.getTime() - now.getTime();
    const weeksDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
    
    // Ajusta baseado na validação, mas respeita limites mínimos e máximos
    totalWeeks = Math.max(6, Math.min(24, weeksDiff));
    
    // Se o tempo é insuficiente para o objetivo, avisa
    if (weeksDiff < validation.recommendedWeeks && !validation.isIdeal) {
      validation.warning = `Tempo insuficiente para ${goal}. Considere uma data ${validation.recommendedWeeks} semanas à frente.`;
    }
  }
  
  // Volume base baseado nas capacidades reais do atleta
  const baseVolume = capabilities.safeWeeklyVolume;
  
  // Ajusta volume baseado no objetivo (mais conservador)
  const goalMultipliers = {
    'start_running': 0.8,     
    'run_5k': 0.9,           
    'run_10k': 1.0,          
    'half_marathon': 1.2,     
    'marathon': 1.4,          
    'improve_time': 1.1       
  };
  
  // Ajusta volume baseado na frequência semanal
  const frequencyMultipliers = {
    1: 0.5,  
    2: 0.7,  
    3: 0.9,  
    4: 1.0,  
    5: 1.1,  
    6: 1.2   
  };
  
  const adjustedVolume = Math.round(
    baseVolume * 
    (goalMultipliers[finalGoal] || goalMultipliers['run_5k']) * 
    (frequencyMultipliers[weekly_frequency] || frequencyMultipliers[3])
  );
  
  // Gera treinos para o número calculado de semanas
  const weeks = [];
  for (let week = 1; week <= totalWeeks; week++) {
    // Progressão gradual com taper nas últimas 2 semanas
    let progressionMultiplier;
    const taperWeeks = Math.min(2, Math.floor(totalWeeks * 0.15));
    
    if (week <= totalWeeks - taperWeeks) {
      // Fase de build-up: 70% na primeira semana, progride até 100%
      const buildWeeks = totalWeeks - taperWeeks;
      progressionMultiplier = 0.7 + (0.3 * (week - 1) / (buildWeeks - 1));
    } else {
      // Fase de taper: reduz gradualmente
      const taperPosition = week - (totalWeeks - taperWeeks);
      progressionMultiplier = 1.0 - (0.3 * taperPosition / taperWeeks);
    }
    
    const weeklyVolume = Math.max(5, Math.round(adjustedVolume * progressionMultiplier));
    
    weeks.push({
      week,
      volume: weeklyVolume,
      workouts: generateWeeklyWorkouts(weeklyVolume, fitnessInfo, finalGoal, week, weekly_frequency, totalWeeks, capabilities)
    });
  }
  
  return {
    user_id: userData.id,
    goal: finalGoal,
    originalGoal: goal,
    fitness_level: fitnessInfo.fitnessLevel,
    base_pace: fitnessInfo.pace5kPerKm,
    vdot: capabilities.vdot,
    training_paces: fitnessInfo.paces,
    weekly_frequency,
    total_weeks: totalWeeks,
    estimated_capabilities: capabilities,
    validation: validation,
    weeks,
    created_at: new Date().toISOString()
  };
}

/**
 * Gera treinos semanais validados
 * @param {number} weeklyVolume - Volume semanal em km
 * @param {Object} fitnessInfo - Informações de fitness
 * @param {string} goal - Objetivo do usuário
 * @param {number} weekNumber - Número da semana
 * @param {number} weeklyFrequency - Frequência semanal de treinos
 * @param {number} totalWeeks - Total de semanas do plano
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Array} Array de treinos da semana
 */
function generateWeeklyWorkouts(weeklyVolume, fitnessInfo, goal, weekNumber, weeklyFrequency = 3, totalWeeks = 8, capabilities) {
  const workouts = [];
  const paces = fitnessInfo.paces;
  
  // Calcula progressão do longão baseado nas capacidades reais
  const targetDistances = {
    'start_running': Math.min(5, capabilities.maxLongRunPeak),
    'run_5k': Math.min(8, capabilities.maxLongRunPeak),
    'run_10k': Math.min(12, capabilities.maxLongRunPeak),
    'half_marathon': Math.min(18, capabilities.maxLongRunPeak),
    'marathon': Math.min(32, capabilities.maxLongRunPeak),
    'improve_time': Math.min(10, capabilities.maxLongRunPeak)
  };
  
  const targetDistance = targetDistances[goal] || targetDistances['run_5k'];
  
  // Progressão segura do longão: 60% na primeira semana até 90% no pico
  const progressionPercentage = Math.min(0.6 + (weekNumber - 1) * 0.04, 0.9);
  let longRunDistance = Math.round(Math.max(3, targetDistance * progressionPercentage));
  
  // Validação de segurança: nunca exceder capacidades
  longRunDistance = Math.min(longRunDistance, capabilities.maxLongRunPeak);
  
  // Ajustes para semana de deload e taper
  const isDeloadWeek = weekNumber % 4 === 0;
  const taperWeeks = Math.min(2, Math.floor(totalWeeks * 0.15));
  const isTaperWeek = weekNumber > (totalWeeks - taperWeeks);
  
  let volumeMultiplier = 1.0;
  if (isDeloadWeek) volumeMultiplier = 0.8;
  if (isTaperWeek) volumeMultiplier = 0.7;
  
  // Aplica multiplicador ao longão também
  longRunDistance = Math.round(longRunDistance * volumeMultiplier);
  
  // Distribui treinos baseado na frequência semanal
  switch (weeklyFrequency) {
    case 2:
      workouts.push(generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities));
      workouts.push(generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities));
      break;
      
    case 3:
      workouts.push(generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities));
      workouts.push(generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.25 * volumeMultiplier), capabilities.currentMaxDistance * 0.3), 'Quinta-feira', capabilities));
      workouts.push(generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities));
      break;
      
    case 4:
      workouts.push(generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities));
      workouts.push(generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities));
      workouts.push(generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities));
      workouts.push(generateRecoveryRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.15 * volumeMultiplier), 6), 'Domingo', capabilities));
      break;
      
    case 5:
      workouts.push(generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.2 * volumeMultiplier), capabilities.currentMaxDistance * 0.25), 'Segunda-feira', capabilities));
      workouts.push(generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities));
      workouts.push(generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities));
      workouts.push(generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities));
      workouts.push(generateRecoveryRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.15 * volumeMultiplier), 6), 'Domingo', capabilities));
      break;
      
    case 6:
      workouts.push(generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.15 * volumeMultiplier), capabilities.currentMaxDistance * 0.2), 'Segunda-feira', capabilities));
      workouts.push(generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities));
      workouts.push(generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.2 * volumeMultiplier), capabilities.currentMaxDistance * 0.25), 'Quarta-feira', capabilities));
      workouts.push(generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities));
      workouts.push(generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities));
      workouts.push(generateRecoveryRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.15 * volumeMultiplier), 6), 'Domingo', capabilities));
      break;
      
    default:
      // Fallback para 3 treinos/semana
      workouts.push(generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities));
      workouts.push(generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.25 * volumeMultiplier), capabilities.currentMaxDistance * 0.3), 'Quinta-feira', capabilities));
      workouts.push(generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities));
  }
  
  return workouts;
}

// Funções auxiliares para gerar cada tipo de treino específico

function generateEasyRunWorkout(paces, distance, day, capabilities) {
  // Valida distância baseada nas capacidades
  const adjustedDistance = Math.min(distance, capabilities.currentMaxDistance * 0.4);
  
  return {
    id: `easy_${day}_distance_${adjustedDistance}`,
    type: 'easy',
    day,
    workoutDetails: {
      distance: Math.max(adjustedDistance, 3),
      pace: paces.easy,
      description: 'Ritmo confortável, permite conversa fácil. Base aeróbica.'
    },
    detailedDescription: `${Math.max(adjustedDistance, 3)}km em pace ${paces.easy}/km. Zona aeróbica para desenvolvimento da base.`,
    capabilities: capabilities
  };
}

function generateLongRunWorkout(paces, distance, volumeMultiplier, day, capabilities) {
  // Aplica validação rigorosa baseada nas capacidades
  const adjustedDistance = Math.min(
    Math.round(distance * volumeMultiplier),
    capabilities.maxLongRunPeak
  );
  
  return {
    id: `long_${day}_distance_${adjustedDistance}`,
    type: 'long',
    day,
    workoutDetails: {
      distance: Math.max(adjustedDistance, 5),
      pace: paces.long,
      description: 'Ritmo leve para longão. Desenvolve endurance aeróbica.'
    },
    detailedDescription: `${Math.max(adjustedDistance, 5)}km em pace ${paces.long}/km. Corrida longa para endurance.`,
    capabilities: capabilities
  };
}

function generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, day, capabilities) {
  // Duração do tempo baseada no VDOT e progressão
  let baseDuration;
  if (capabilities.vdot >= 50) {
    baseDuration = Math.min(15 + weekNumber, 30); // 15-30 minutos
  } else if (capabilities.vdot >= 40) {
    baseDuration = Math.min(12 + weekNumber, 25); // 12-25 minutos
  } else {
    baseDuration = Math.min(10 + Math.floor(weekNumber / 2), 20); // 10-20 minutos
  }
  
  const duration = Math.round(baseDuration * volumeMultiplier);
  
  return {
    id: `tempo_${day}_week_${weekNumber}`,
    type: 'tempo',
    day,
    workoutDetails: {
      duration: duration,
      pace: paces.tempo,
      description: 'Ritmo de limiar anaeróbico. Esforço controlado e sustentado.'
    },
    detailedDescription: `${duration} minutos em pace ${paces.tempo}/km. Desenvolvimento do limiar anaeróbico.`,
    duration: duration,
    capabilities: capabilities
  };
}

function generateRecoveryRunWorkout(paces, distance, day, capabilities) {
  // Limita distância de recuperação
  const adjustedDistance = Math.min(distance, capabilities.currentMaxDistance * 0.2, 8);
  
  return {
    id: `recovery_${day}_distance_${adjustedDistance}`,
    type: 'recovery',
    day,
    workoutDetails: {
      distance: Math.max(adjustedDistance, 3),
      pace: paces.recovery,
      description: 'Ritmo muito leve para recuperação ativa. Soltar a musculatura.'
    },
    detailedDescription: `${Math.max(adjustedDistance, 3)}km em pace ${paces.recovery}/km. Recuperação ativa.`,
    capabilities: capabilities
  };
}

/**
 * Gera treino intervalado baseado no VDOT de Jack Daniels
 * @param {Object} paces - Paces calculados para diferentes zonas
 * @param {number} weekNumber - Número da semana no plano
 * @param {number} volumeMultiplier - Multiplicador de volume
 * @param {string} day - Dia da semana
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Object} Treino intervalado
 */
function generateIntervalWorkout(paces, weekNumber, volumeMultiplier, day, capabilities) {
  // Progressão de intervalos baseada no VDOT de Jack Daniels
  const baseIntervals = Math.min(4 + Math.floor(weekNumber / 2), 8); // 4-8 intervalos
  const intervals = Math.round(baseIntervals * volumeMultiplier);
  
  // Duração dos intervalos baseada na capacidade e semana
  let intervalDuration;
  if (capabilities.vdot >= 50) {
    intervalDuration = weekNumber <= 4 ? 3 : weekNumber <= 8 ? 4 : 5; // 3-5 minutos
  } else if (capabilities.vdot >= 40) {
    intervalDuration = weekNumber <= 4 ? 2 : weekNumber <= 8 ? 3 : 4; // 2-4 minutos
  } else {
    intervalDuration = weekNumber <= 6 ? 2 : 3; // 2-3 minutos
  }
  
  // Calcula distância total estimada
  const intervalPaceSeconds = paces.intervalSeconds;
  const kmPerInterval = (intervalDuration * 60) / intervalPaceSeconds;
  const totalDistance = (intervals * kmPerInterval) + (intervals * 0.4); // Inclui recuperação
  
  return {
    id: `interval_${day}_week_${weekNumber}`,
    type: 'interval',
    day,
    workoutDetails: {
      intervals: intervals,
      intervalDuration: intervalDuration,
      recoveryTime: 2,
      pace: paces.interval,
      description: 'Treino intervalado na velocidade de 5K. Desenvolve VO2max.'
    },
    detailedDescription: `${intervals}x${intervalDuration}min @ ${paces.interval}/km com 2min recuperação. Total: ~${Math.round(totalDistance)}km.`,
    tips: 'Mantenha o pace de 5K durante os intervalos. Recuperação ativa em trote leve.',
    capabilities: capabilities
  };
}



module.exports = {
  generateTrainingPlan
}; 