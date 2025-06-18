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
 * Calcula dados de progressão esperada ao longo do plano
 * @param {Object} fitnessInfo - Informações de fitness atuais
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @param {string} goal - Objetivo do usuário
 * @param {number} totalWeeks - Total de semanas do plano
 * @param {number} weeklyFrequency - Frequência semanal de treinos
 * @returns {Object} Dados de progressão
 */
function calculateProgressionData(fitnessInfo, capabilities, goal, totalWeeks, weeklyFrequency) {
  const currentVDOT = capabilities.vdot;
  const currentTime5k = fitnessInfo.time5kSeconds;
  
  // Estimativa de melhoria do VDOT baseada no objetivo e duração do plano
  const vdotImprovement = calculateVDOTImprovement(goal, totalWeeks, weeklyFrequency, currentVDOT);
  const finalVDOT = currentVDOT + vdotImprovement;
  
  // Calcula novo tempo de 5K baseado no VDOT final
  const finalTime5k = calculateTime5kFromVDOT(finalVDOT);
  const finalPaces = calculateTrainingPaces(finalTime5k);
  
  // Calcula capacidades finais
  const finalCapabilities = estimateMaxSupportableDistance(finalTime5k, weeklyFrequency);
  
  // Volume semanal esperado
  const currentWeeklyVolume = capabilities.safeWeeklyVolume;
  const finalWeeklyVolume = finalCapabilities.safeWeeklyVolume;
  
  // Distância máxima do longão
  const currentMaxLongRun = capabilities.maxLongRunStart;
  const finalMaxLongRun = finalCapabilities.maxLongRunPeak;
  
  // Estimativa de tempos para diferentes distâncias
  const currentEstimatedTimes = capabilities.estimatedTimes;
  const finalEstimatedTimes = finalCapabilities.estimatedTimes;
  
  return {
    current: {
      vdot: Math.round(currentVDOT * 10) / 10,
      time5k: secondsToTime(currentTime5k),
      pace5k: secondsToTime(currentTime5k / 5),
      paces: fitnessInfo.paces,
      weeklyVolume: currentWeeklyVolume,
      maxLongRun: currentMaxLongRun,
      estimatedTimes: {
        '5k': secondsToTime(currentTime5k),
        '10k': secondsToTime(currentEstimatedTimes['10k']),
        'half': secondsToTime(currentEstimatedTimes['half']),
        'marathon': secondsToTime(currentEstimatedTimes['marathon'])
      }
    },
    final: {
      vdot: Math.round(finalVDOT * 10) / 10,
      time5k: secondsToTime(finalTime5k),
      pace5k: secondsToTime(finalTime5k / 5),
      paces: finalPaces,
      weeklyVolume: finalWeeklyVolume,
      maxLongRun: finalMaxLongRun,
      estimatedTimes: {
        '5k': secondsToTime(finalTime5k),
        '10k': secondsToTime(finalEstimatedTimes['10k']),
        'half': secondsToTime(finalEstimatedTimes['half']),
        'marathon': secondsToTime(finalEstimatedTimes['marathon'])
      }
    },
    improvements: {
      vdot: Math.round(vdotImprovement * 10) / 10,
      time5k: secondsToTime(Math.abs(currentTime5k - finalTime5k)),
      pace5k: secondsToTime(Math.abs((currentTime5k / 5) - (finalTime5k / 5))),
      weeklyVolume: finalWeeklyVolume - currentWeeklyVolume,
      maxLongRun: finalMaxLongRun - currentMaxLongRun,
      percentageImprovement: Math.round(((currentTime5k - finalTime5k) / currentTime5k) * 100 * 10) / 10
    }
  };
}

/**
 * Calcula melhoria esperada do VDOT baseada no objetivo e parâmetros do plano
 * @param {string} goal - Objetivo do usuário
 * @param {number} totalWeeks - Total de semanas do plano
 * @param {number} weeklyFrequency - Frequência semanal de treinos
 * @param {number} currentVDOT - VDOT atual
 * @returns {number} Melhoria esperada do VDOT
 */
function calculateVDOTImprovement(goal, totalWeeks, weeklyFrequency, currentVDOT) {
  // Taxa base de melhoria por semana (conservadora)
  const baseImprovementPerWeek = 0.15; // 0.15 pontos VDOT por semana
  
  // Multiplicadores baseados no objetivo
  const goalMultipliers = {
    'start_running': 1.2,      // Iniciantes melhoram mais rapidamente
    'run_5k': 1.0,            // Base
    'run_10k': 1.1,           // Melhoria moderada
    'half_marathon': 1.2,     // Treino mais estruturado
    'marathon': 1.3,          // Máxima melhoria com volume alto
    'improve_time': 1.4       // Foco específico em performance
  };
  
  // Multiplicador de frequência (mais treinos = mais melhoria)
  const frequencyMultipliers = {
    1: 0.5,
    2: 0.7,
    3: 1.0,
    4: 1.2,
    5: 1.3,
    6: 1.4
  };
  
  // Diminui a taxa de melhoria para atletas mais avançados (lei dos retornos decrescentes)
  let levelMultiplier = 1.0;
  if (currentVDOT >= 55) {
    levelMultiplier = 0.6; // Atletas avançados melhoram mais devagar
  } else if (currentVDOT >= 45) {
    levelMultiplier = 0.8; // Intermediários
  } else if (currentVDOT >= 35) {
    levelMultiplier = 1.0; // Iniciantes intermediários
  } else {
    levelMultiplier = 1.3; // Iniciantes melhoram mais rapidamente
  }
  
  const goalMultiplier = goalMultipliers[goal] || goalMultipliers['run_5k'];
  const frequencyMultiplier = frequencyMultipliers[weeklyFrequency] || frequencyMultipliers[3];
  
  const totalImprovement = baseImprovementPerWeek * totalWeeks * goalMultiplier * frequencyMultiplier * levelMultiplier;
  
  // Limita a melhoria máxima (realismo)
  const maxImprovementPercentage = 0.25; // Máximo 25% de melhoria
  const maxImprovement = currentVDOT * maxImprovementPercentage;
  
  return Math.min(totalImprovement, maxImprovement);
}

/**
 * Calcula tempo de 5K baseado no VDOT (fórmula inversa de Jack Daniels)
 * @param {number} vdot - VDOT do atleta
 * @returns {number} Tempo de 5K em segundos
 */
function calculateTime5kFromVDOT(vdot) {
  // Fórmula inversa aproximada: velocidade em m/min baseada no VDOT
  // VDOT = -4.6 + 0.182258 * v + 0.000104 * v²
  // Resolvendo para v usando fórmula quadrática
  const a = 0.000104;
  const b = 0.182258;
  const c = -4.6 - vdot;
  
  const discriminant = b * b - 4 * a * c;
  const velocity = (-b + Math.sqrt(discriminant)) / (2 * a); // metros por minuto
  
  const time5k = (5000 / velocity) * 60; // segundos
  
  // Validação de sanidade (entre 15 e 60 minutos)
  return Math.max(900, Math.min(3600, Math.round(time5k)));
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

  // Calcula dados de progressão esperada
  const progressionData = calculateProgressionData(fitnessInfo, capabilities, finalGoal, totalWeeks, weekly_frequency);
  
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
    progression_data: progressionData,
    weeks,
    created_at: new Date().toISOString()
  };
}

/**
 * Gera treinos semanais validados com variedade científica
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
  
  // NOVA LÓGICA: Sistema de variedade baseado em metodologias científicas
  // Distribui treinos baseado na frequência semanal com MUITO mais variedade
  switch (weeklyFrequency) {
  case 2: {
    // Para 2x semana: alterna entre diferentes tipos de treinos de qualidade + longão variado
    const qualityWorkouts = [
      () => generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
      () => generateFartlekWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
      () => generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
      () => generateHillRepeatWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
      () => generateProgressiveRunWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
      () => generateLadderWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities)
    ];
    
    const longRunVariations = [
      () => generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities),
      () => generateLongRunWithSurgesWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities),
      () => generateProgressiveLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities)
    ];
    
    // Seleciona treino baseado na semana para criar variedade
    const qualityIndex = (weekNumber - 1) % qualityWorkouts.length;
    const longIndex = (weekNumber - 1) % longRunVariations.length;
    
    workouts.push(qualityWorkouts[qualityIndex]());
    workouts.push(longRunVariations[longIndex]());
    break;
  }
      
  case 3: {
    // Para 3x semana: ainda mais variedade
    const week3Patterns = [
      // Padrão 1: Interval + Easy + Long
      () => [
        generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.25 * volumeMultiplier), capabilities.currentMaxDistance * 0.3), 'Quinta-feira', capabilities),
        generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities)
      ],
      // Padrão 2: Fartlek + Tempo + Long com surges
      () => [
        generateFartlekWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities),
        generateLongRunWithSurgesWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities)
      ],
      // Padrão 3: Hill + Progressive + Long
      () => [
        generateHillRepeatWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateProgressiveRunWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities),
        generateProgressiveLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities)
      ],
      // Padrão 4: Ladder + Easy + Long
      () => [
        generateLadderWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.25 * volumeMultiplier), capabilities.currentMaxDistance * 0.3), 'Quinta-feira', capabilities),
        generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities)
      ]
    ];
    
    const pattern3Index = (weekNumber - 1) % week3Patterns.length;
    workouts.push(...week3Patterns[pattern3Index]());
    break;
  }
      
  case 4: {
    // Para 4x semana: máxima variedade com periodização
    const week4Patterns = [
      // Padrão 1: Interval + Tempo + Long + Recovery
      () => [
        generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities),
        generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities),
        generateRecoveryRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.15 * volumeMultiplier), 6), 'Domingo', capabilities)
      ],
      // Padrão 2: Fartlek + Hill + Long com surges + Easy
      () => [
        generateFartlekWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateHillRepeatWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities),
        generateLongRunWithSurgesWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities),
        generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.15 * volumeMultiplier), 6), 'Domingo', capabilities)
      ],
      // Padrão 3: Ladder + Progressive + Long + Recovery
      () => [
        generateLadderWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateProgressiveRunWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities),
        generateProgressiveLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities),
        generateRecoveryRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.15 * volumeMultiplier), 6), 'Domingo', capabilities)
      ],
      // Padrão 4: Tempo + Interval + Long + Easy
      () => [
        generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities),
        generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities),
        generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.15 * volumeMultiplier), 6), 'Domingo', capabilities)
      ]
    ];
    
    const pattern4Index = (weekNumber - 1) % week4Patterns.length;
    workouts.push(...week4Patterns[pattern4Index]());
    break;
  }
      
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
      
  default: {
    // Fallback para 3 treinos/semana com variedade
    const defaultVariations = [
      () => [
        generateIntervalWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateEasyRunWorkout(paces, Math.min(Math.round(weeklyVolume * 0.25 * volumeMultiplier), capabilities.currentMaxDistance * 0.3), 'Quinta-feira', capabilities),
        generateLongRunWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities)
      ],
      () => [
        generateFartlekWorkout(paces, weekNumber, volumeMultiplier, 'Terça-feira', capabilities),
        generateTempoRunWorkout(paces, weekNumber, volumeMultiplier, 'Quinta-feira', capabilities),
        generateLongRunWithSurgesWorkout(paces, longRunDistance, volumeMultiplier, 'Sábado', capabilities)
      ]
    ];
    
    const defaultIndex = (weekNumber - 1) % defaultVariations.length;
    workouts.push(...defaultVariations[defaultIndex]());
  }
  }
  
  // AJUSTE FINAL: Garante que a soma dos treinos bate com o volume semanal
  const adjustedWorkouts = adjustWorkoutsToTargetVolume(workouts, weeklyVolume);
  
  return adjustedWorkouts;
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
  
  // Calcula distância baseada na duração e pace de tempo
  const tempoPaceSeconds = paces.tempoSeconds;
  const estimatedDistance = Math.round(((duration * 60) / tempoPaceSeconds) * 10) / 10;
  
  return {
    id: `tempo_${day}_week_${weekNumber}`,
    type: 'tempo',
    day,
    workoutDetails: {
      duration: duration,
      pace: paces.tempo,
      distance: estimatedDistance, // Adiciona distância calculada
      description: 'Ritmo de limiar anaeróbico. Esforço controlado e sustentado.'
    },
    detailedDescription: `${duration} minutos em pace ${paces.tempo}/km. Desenvolvimento do limiar anaeróbico.`,
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
      distance: Math.round(totalDistance * 10) / 10, // Adiciona distância calculada
      description: 'Treino intervalado na velocidade de 5K. Desenvolve VO2max.'
    },
    detailedDescription: `${intervals}x${intervalDuration}min @ ${paces.interval}/km com 2min recuperação. Total: ~${Math.round(totalDistance)}km.`,
    tips: 'Mantenha o pace de 5K durante os intervalos. Recuperação ativa em trote leve.',
    capabilities: capabilities
  };
}

/**
 * Gera treino Fartlek baseado na metodologia sueca
 * @param {Object} paces - Paces calculados para diferentes zonas
 * @param {number} weekNumber - Número da semana no plano
 * @param {number} volumeMultiplier - Multiplicador de volume
 * @param {string} day - Dia da semana
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Object} Treino Fartlek
 */
function generateFartlekWorkout(paces, weekNumber, volumeMultiplier, day, capabilities) {
  // Duração baseada na progressão e capacidade
  let baseDuration;
  if (capabilities.vdot >= 50) {
    baseDuration = Math.min(25 + weekNumber * 2, 45); // 25-45 minutos
  } else if (capabilities.vdot >= 40) {
    baseDuration = Math.min(20 + weekNumber * 2, 40); // 20-40 minutos
  } else {
    baseDuration = Math.min(15 + weekNumber, 30); // 15-30 minutos
  }
  
  const duration = Math.round(baseDuration * volumeMultiplier);
  
  // Variações de Fartlek baseadas na semana
  const fartlekVariations = [
    {
      name: 'Fartlek Clássico',
      structure: 'Surges livres de 30s-3min',
      description: 'Varie o ritmo conforme se sente. Acelere por pontos de referência (postes, árvores).'
    },
    {
      name: 'Fartlek Estruturado',
      structure: '8x(1min forte + 1min fácil)',
      description: 'Estrutura fixa: 1 minuto em pace de 5K, 1 minuto em pace fácil.'
    },
    {
      name: 'Fartlek Piramidal',
      structure: '1-2-3-2-1min com recuperação igual',
      description: 'Pirâmide de esforços: 1, 2, 3, 2, 1 minutos com recuperação igual.'
    },
    {
      name: 'Fartlek Natural',
      structure: 'Surges por terreno',
      description: 'Acelere nas subidas, mantenha nas descidas, varie no plano.'
    }
  ];
  
  const variation = fartlekVariations[(weekNumber - 1) % fartlekVariations.length];
  
  // Calcula distância estimada baseada na duração e pace médio
  const avgPaceSeconds = (paces.easySeconds + paces.intervalSeconds) / 2;
  const estimatedDistance = Math.round(((duration * 60) / avgPaceSeconds) * 10) / 10;

  return {
    id: `fartlek_${day}_week_${weekNumber}`,
    type: 'fartlek',
    day,
    workoutDetails: {
      duration: duration,
      pace: `${paces.easy} - ${paces.interval}`,
      distance: estimatedDistance, // Adiciona distância estimada
      description: `${variation.name}: jogo de velocidade com mudanças de ritmo.`,
      structure: variation.structure
    },
    detailedDescription: `${duration}min de ${variation.name}. ${variation.description}`,
    tips: 'Fartlek = "jogo de velocidade". Divirta-se variando o ritmo conforme se sente!',
    capabilities: capabilities
  };
}

/**
 * Gera treino de subidas (Hill Repeats)
 * @param {Object} paces - Paces calculados para diferentes zonas
 * @param {number} weekNumber - Número da semana no plano
 * @param {number} volumeMultiplier - Multiplicador de volume
 * @param {string} day - Dia da semana
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Object} Treino de subidas
 */
function generateHillRepeatWorkout(paces, weekNumber, volumeMultiplier, day, capabilities) {
  // Número de repetições baseado na progressão
  const baseRepeats = Math.min(4 + Math.floor(weekNumber / 2), 10);
  const repeats = Math.round(baseRepeats * volumeMultiplier);
  
  // Duração das subidas baseada na capacidade
  let hillDuration;
  if (capabilities.vdot >= 50) {
    hillDuration = weekNumber <= 4 ? 90 : weekNumber <= 8 ? 120 : 150; // 90-150 segundos
  } else if (capabilities.vdot >= 40) {
    hillDuration = weekNumber <= 4 ? 60 : weekNumber <= 8 ? 90 : 120; // 60-120 segundos
  } else {
    hillDuration = weekNumber <= 6 ? 45 : 60; // 45-60 segundos
  }
  
  // Calcula distância estimada: ~200m por repetição + aquecimento/volta à calma
  const estimatedDistance = Math.round(((repeats * 0.4) + 2.5) * 10) / 10;

  return {
    id: `hill_${day}_week_${weekNumber}`,
    type: 'hill',
    day,
    workoutDetails: {
      repeats: repeats,
      hillDuration: hillDuration,
      incline: '5-8%',
      pace: 'Esforço de 5K em subida',
      distance: estimatedDistance, // Adiciona distância estimada
      description: 'Treino de força e potência em subidas. Desenvolve força específica.'
    },
    detailedDescription: `${repeats}x${hillDuration}s em subida de 5-8%. Descida caminhando para recuperação total.`,
    tips: 'Mantenha postura ereta, passos curtos e frequentes. Foque na força, não na velocidade.',
    capabilities: capabilities
  };
}

/**
 * Gera treino progressivo
 * @param {Object} paces - Paces calculados para diferentes zonas
 * @param {number} weekNumber - Número da semana no plano
 * @param {number} volumeMultiplier - Multiplicador de volume
 * @param {string} day - Dia da semana
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Object} Treino progressivo
 */
function generateProgressiveRunWorkout(paces, weekNumber, volumeMultiplier, day, capabilities) {
  // Distância baseada na capacidade e progressão
  let baseDistance;
  if (capabilities.vdot >= 50) {
    baseDistance = Math.min(6 + weekNumber * 0.5, 12); // 6-12 km
  } else if (capabilities.vdot >= 40) {
    baseDistance = Math.min(5 + weekNumber * 0.5, 10); // 5-10 km
  } else {
    baseDistance = Math.min(4 + weekNumber * 0.3, 8); // 4-8 km
  }
  
  const distance = Math.round(baseDistance * volumeMultiplier);
  
  // Estrutura progressiva baseada na distância
  const thirds = Math.round(distance / 3);
  
  return {
    id: `progressive_${day}_week_${weekNumber}`,
    type: 'progressive',
    day,
    workoutDetails: {
      distance: distance,
      structure: `${thirds}km fácil + ${thirds}km moderado + ${thirds}km forte`,
      pace: `${paces.easy} → ${paces.tempo}`,
      description: 'Corrida progressiva: acelera gradualmente a cada terço.'
    },
    detailedDescription: `${distance}km progressivos: ${thirds}km @ ${paces.easy}/km, ${thirds}km @ ${paces.long}/km, ${thirds}km @ ${paces.tempo}/km.`,
    tips: 'Comece devagar e acelere gradualmente. Último terço deve ser desafiador mas controlado.',
    capabilities: capabilities
  };
}

/**
 * Gera treino em escada (Ladder Workout)
 * @param {Object} paces - Paces calculados para diferentes zonas
 * @param {number} weekNumber - Número da semana no plano
 * @param {number} volumeMultiplier - Multiplicador de volume
 * @param {string} day - Dia da semana
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Object} Treino em escada
 */
function generateLadderWorkout(paces, weekNumber, volumeMultiplier, day, capabilities) {
  // Estruturas de escada baseadas na capacidade
  let ladderStructure;
  let totalMinutes;
  if (capabilities.vdot >= 50) {
    ladderStructure = weekNumber <= 4 ? '1-2-3-2-1min' : '1-2-3-4-3-2-1min';
    totalMinutes = weekNumber <= 4 ? 18 : 32; // (1+2+3+2+1)*2 ou (1+2+3+4+3+2+1)*2
  } else if (capabilities.vdot >= 40) {
    ladderStructure = weekNumber <= 4 ? '1-2-3-2-1min' : '2-3-4-3-2min';
    totalMinutes = weekNumber <= 4 ? 18 : 28; // (1+2+3+2+1)*2 ou (2+3+4+3+2)*2
  } else {
    ladderStructure = '1-2-3-2-1min';
    totalMinutes = 18; // (1+2+3+2+1)*2
  }
  
  // Calcula distância baseada na duração total e pace de interval
  const intervalPaceSeconds = paces.intervalSeconds;
  const estimatedDistance = Math.round(((totalMinutes * 60) / intervalPaceSeconds) * 10) / 10;
  
  return {
    id: `ladder_${day}_week_${weekNumber}`,
    type: 'ladder',
    day,
    workoutDetails: {
      structure: ladderStructure,
      pace: paces.interval,
      recoveryTime: 'Igual ao esforço',
      distance: estimatedDistance, // Adiciona distância calculada
      description: 'Treino em escada: intervalos crescentes e decrescentes.'
    },
    detailedDescription: `Escada ${ladderStructure} @ ${paces.interval}/km. Recuperação ativa igual ao esforço.`,
    tips: 'Mantenha o mesmo pace em todos os intervalos. A dificuldade vem da duração crescente.',
    capabilities: capabilities
  };
}

/**
 * Gera longão com surges
 * @param {Object} paces - Paces calculados para diferentes zonas
 * @param {number} distance - Distância do longão
 * @param {number} volumeMultiplier - Multiplicador de volume
 * @param {string} day - Dia da semana
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Object} Longão com surges
 */
function generateLongRunWithSurgesWorkout(paces, distance, volumeMultiplier, day, capabilities) {
  const adjustedDistance = Math.min(
    Math.round(distance * volumeMultiplier),
    capabilities.maxLongRunPeak
  );
  
  // Número de surges baseado na distância
  const surges = Math.min(Math.floor(adjustedDistance / 2), 6);
  
  return {
    id: `long_surges_${day}_distance_${adjustedDistance}`,
    type: 'long_surges',
    day,
    workoutDetails: {
      distance: Math.max(adjustedDistance, 5),
      pace: paces.long,
      surges: surges,
      surgePace: paces.tempo,
      description: 'Longão com surges de 1-2min em ritmo de limiar.'
    },
    detailedDescription: `${Math.max(adjustedDistance, 5)}km @ ${paces.long}/km com ${surges} surges de 1-2min @ ${paces.tempo}/km.`,
    tips: 'Faça os surges nos últimos 60% da corrida. Volte ao pace base entre os surges.',
    capabilities: capabilities
  };
}

/**
 * Gera longão progressivo
 * @param {Object} paces - Paces calculados para diferentes zonas
 * @param {number} distance - Distância do longão
 * @param {number} volumeMultiplier - Multiplicador de volume
 * @param {string} day - Dia da semana
 * @param {Object} capabilities - Capacidades estimadas do atleta
 * @returns {Object} Longão progressivo
 */
function generateProgressiveLongRunWorkout(paces, distance, volumeMultiplier, day, capabilities) {
  const adjustedDistance = Math.min(
    Math.round(distance * volumeMultiplier),
    capabilities.maxLongRunPeak
  );
  
  // Divide em terços para progressão
  const firstThird = Math.round(adjustedDistance * 0.4);
  const secondThird = Math.round(adjustedDistance * 0.3);
  const finalThird = adjustedDistance - firstThird - secondThird;
  
  return {
    id: `progressive_long_${day}_distance_${adjustedDistance}`,
    type: 'progressive_long',
    day,
    workoutDetails: {
      distance: Math.max(adjustedDistance, 5),
      structure: `${firstThird}km fácil + ${secondThird}km moderado + ${finalThird}km forte`,
      pace: `${paces.easy} → ${paces.tempo}`,
      description: 'Longão progressivo: acelera gradualmente durante a corrida.'
    },
    detailedDescription: `${Math.max(adjustedDistance, 5)}km progressivos: ${firstThird}km @ ${paces.easy}/km, ${secondThird}km @ ${paces.long}/km, ${finalThird}km @ ${paces.tempo}/km.`,
    tips: 'Metodologia africana: comece bem devagar e termine forte. Controle o esforço.',
    capabilities: capabilities
  };
}

/**
 * Calcula a distância real de um treino baseado em seus detalhes
 * @param {Object} workout - Objeto do treino
 * @returns {number} Distância em km
 */
function calculateWorkoutDistance(workout) {
  if (!workout.workoutDetails) return 0;
  
  const details = workout.workoutDetails;
  
  // Se tem distância direta, usa ela
  if (details.distance) {
    return details.distance;
  }
  
  // Para treinos por tempo (fartlek, tempo)
  if (details.duration && details.pace) {
    const paceStr = details.pace.includes(' - ') ? details.pace.split(' - ')[0] : details.pace;
    const paceMatch = paceStr.match(/(\d+):(\d+)/);
    if (paceMatch) {
      const paceSeconds = parseInt(paceMatch[1]) * 60 + parseInt(paceMatch[2]);
      return (details.duration * 60) / paceSeconds;
    }
  }
  
  // Para treinos intervalados
  if (details.intervals && details.intervalDuration && details.pace) {
    const paceMatch = details.pace.match(/(\d+):(\d+)/);
    if (paceMatch) {
      const paceSeconds = parseInt(paceMatch[1]) * 60 + parseInt(paceMatch[2]);
      const intervalDistance = (details.intervalDuration * 60) / paceSeconds;
      // Adiciona distância de recuperação (estimada em pace fácil)
      const recoveryDistance = (details.recoveryTime * 60) / 400; // ~6:40/km
      return (intervalDistance + recoveryDistance) * details.intervals;
    }
  }
  
  // Para treinos de subida (estimativa baseada no tempo)
  if (details.repeats && details.hillDuration) {
    // Estima ~200m por repetição de subida + descida + aquecimento/volta à calma
    const hillDistance = (details.repeats * 0.4) + 2; // +2km para aquecimento/volta à calma
    return hillDistance;
  }
  
  return 0;
}

/**
 * Ajusta as distâncias dos treinos para bater com o volume semanal
 * @param {Array} workouts - Array de treinos da semana
 * @param {number} targetVolume - Volume alvo em km
 * @returns {Array} Treinos ajustados
 */
function adjustWorkoutsToTargetVolume(workouts, targetVolume) {
  if (!workouts || workouts.length === 0) return workouts;
  
  // Calcula volume atual
  let currentVolume = 0;
  workouts.forEach(workout => {
    currentVolume += calculateWorkoutDistance(workout);
  });
  
  // Se a diferença for pequena (< 0.5km), não ajusta
  const difference = targetVolume - currentVolume;
  if (Math.abs(difference) < 0.5) {
    return workouts;
  }
  
  // Identifica treinos que podem ser ajustados
  const adjustableWorkouts = workouts.filter(w => 
    w.workoutDetails && (
      w.workoutDetails.distance || // Treinos com distância fixa
      (w.workoutDetails.repeats && w.workoutDetails.hillDuration) || // Treinos de subida
      (w.workoutDetails.duration) // Treinos por tempo
    )
  );
  
  if (adjustableWorkouts.length === 0) {
    return workouts;
  }
  
  // Prioriza ajustar treinos longos primeiro, depois outros
  const longWorkouts = adjustableWorkouts.filter(w => 
    w.type === 'long' || w.type === 'long_surges' || w.type === 'progressive_long' || w.type === 'easy' || w.type === 'progressive'
  );
  // Se a diferença for muito grande (>1.5km), ajusta todos os treinos
  // Senão, prioriza treinos longos
  const workoutsToAdjust = Math.abs(difference) > 1.5 ? adjustableWorkouts : 
    (longWorkouts.length > 0 ? longWorkouts : adjustableWorkouts);
  const adjustmentPerWorkout = difference / workoutsToAdjust.length;
  
  workoutsToAdjust.forEach(workout => {
    if (workout.workoutDetails.distance) {
      // Treinos com distância fixa
      const oldDistance = workout.workoutDetails.distance;
      const newDistance = Math.max(3, Math.round((oldDistance + adjustmentPerWorkout) * 10) / 10);
      
      workout.workoutDetails.distance = newDistance;
      
      if (workout.detailedDescription) {
        workout.detailedDescription = workout.detailedDescription.replace(
          /\d+(?:\.\d+)?km/,
          `${newDistance}km`
        );
      }
      
      // Para treinos progressivos, ajusta a estrutura
      if (workout.type === 'progressive_long' && workout.workoutDetails.structure) {
        const thirds = Math.round(newDistance / 3);
        const finalThird = newDistance - (thirds * 2);
        workout.workoutDetails.structure = `${thirds}km fácil + ${thirds}km moderado + ${finalThird}km forte`;
        
        if (workout.detailedDescription) {
          workout.detailedDescription = workout.detailedDescription.replace(
            /\d+km @ .+?, \d+km @ .+?, \d+km @ .+?\./,
            `${thirds}km @ ${workout.workoutDetails.pace.split(' → ')[0]}/km, ${thirds}km @ ${workout.workoutDetails.pace.split(' → ')[0]}/km, ${finalThird}km @ ${workout.workoutDetails.pace.split(' → ')[1]}/km.`
          );
        }
      }
    } else if (workout.workoutDetails.duration) {
      // Treinos por tempo - ajusta duração
      const oldDuration = workout.workoutDetails.duration;
      const estimatedPace = workout.workoutDetails.pace.includes(' - ') ? 
        workout.workoutDetails.pace.split(' - ')[0] : workout.workoutDetails.pace;
      const paceMatch = estimatedPace.match(/(\d+):(\d+)/);
      
      if (paceMatch) {
        const paceSeconds = parseInt(paceMatch[1]) * 60 + parseInt(paceMatch[2]);
        const targetDurationMinutes = Math.max(5, (adjustmentPerWorkout * paceSeconds) / 60);
        const newDuration = Math.round(oldDuration + targetDurationMinutes);
        
        workout.workoutDetails.duration = newDuration;
        
        if (workout.detailedDescription) {
          workout.detailedDescription = workout.detailedDescription.replace(
            /\d+min/,
            `${newDuration}min`
          );
        }
      }
    } else if (workout.workoutDetails.repeats && workout.workoutDetails.hillDuration) {
      // Treinos de subida - adiciona aquecimento/volta à calma
      const currentDistance = calculateWorkoutDistance(workout);
      const targetDistance = currentDistance + adjustmentPerWorkout;
      
      // Atualiza descrição para incluir aquecimento/volta à calma
      if (workout.detailedDescription) {
        const warmupCooldown = Math.round(adjustmentPerWorkout);
        workout.detailedDescription = workout.detailedDescription.replace(
          /\. Descida caminhando/,
          `. Inclui ${warmupCooldown}km de aquecimento/volta à calma. Descida caminhando`
        );
      }
    }
  });
  
  return workouts;
}

module.exports = {
  generateTrainingPlan
}; 