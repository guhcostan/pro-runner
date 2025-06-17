const { evaluate } = require('mathjs');

/**
 * Converte tempo MM:SS para segundos
 * @param {string} timeString - Tempo no formato MM:SS
 * @returns {number} Tempo em segundos
 */
function timeToSeconds(timeString) {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}

/**
 * Converte segundos para formato MM:SS
 * @param {number} totalSeconds - Tempo em segundos
 * @returns {string} Tempo no formato MM:SS
 */
function secondsToTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  
  // Converte RP 5k para pace (min/km)
  const prSeconds = timeToSeconds(personal_record_5k);
  const pacePerKm = prSeconds / 5; // pace por km em segundos
  
  // Classifica nível baseado no pace dos 5k
  let fitnessLevel;
  if (pacePerKm <= 240) { // < 4:00/km
    fitnessLevel = 'advanced';
  } else if (pacePerKm <= 300) { // 4:00-5:00/km
    fitnessLevel = 'intermediate';
  } else if (pacePerKm <= 360) { // 5:00-6:00/km
    fitnessLevel = 'beginner_intermediate';
  } else { // > 6:00/km
    fitnessLevel = 'beginner';
  }
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    fitnessLevel,
    pacePerKm: secondsToTime(pacePerKm)
  };
}

/**
 * Gera plano de treino baseado nos dados do usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Object} Plano de treino completo
 */
function generateTrainingPlan(userData) {
  const { goal, weekly_frequency = 3 } = userData;
  const fitnessInfo = calculateFitnessLevel(userData);
  
  // Volumes base por nível de fitness (km por semana)
  const baseVolumes = {
    'beginner': 15,
    'beginner_intermediate': 25,
    'intermediate': 35,
    'advanced': 50
  };
  
  const baseVolume = baseVolumes[fitnessInfo.fitnessLevel];
  
  // Ajusta volume baseado no objetivo
  const goalMultipliers = {
    'start_running': 0.7,     // Iniciantes - volume menor
    'run_5k': 0.8,           // 5K - volume moderado baixo
    'run_10k': 1.0,          // 10K - volume base
    'half_marathon': 1.3,     // Meia maratona - volume maior
    'marathon': 1.6,          // Maratona - volume máximo
    'improve_time': 1.1       // Melhorar tempo - volume ligeiramente maior
  };
  
  // Ajusta volume baseado na frequência semanal
  const frequencyMultipliers = {
    1: 0.4,  // 1x por semana - volume muito reduzido
    2: 0.6,  // 2x por semana - volume reduzido
    3: 0.8,  // 3x por semana - volume padrão
    4: 1.0,  // 4x por semana - volume base
    5: 1.2,  // 5x por semana - volume aumentado
    6: 1.4   // 6x por semana - volume máximo
  };
  
  const adjustedVolume = Math.round(
    baseVolume * 
    (goalMultipliers[goal] || goalMultipliers['run_5k']) * 
    (frequencyMultipliers[weekly_frequency] || frequencyMultipliers[3])
  );
  
  // Gera 8 semanas de treino
  const weeks = [];
  for (let week = 1; week <= 8; week++) {
    const weeklyVolume = Math.round(adjustedVolume * (0.8 + (week * 0.025))); // Progressão gradual
    
    weeks.push({
      week,
      volume: weeklyVolume,
      workouts: generateWeeklyWorkouts(weeklyVolume, fitnessInfo, goal, week, weekly_frequency)
    });
  }
  
  return {
    user_id: userData.id,
    goal,
    fitness_level: fitnessInfo.fitnessLevel,
    base_pace: fitnessInfo.pacePerKm,
    weekly_frequency,
    total_weeks: 8,
    weeks,
    created_at: new Date().toISOString()
  };
}

/**
 * Gera treinos semanais
 * @param {number} weeklyVolume - Volume semanal em km
 * @param {Object} fitnessInfo - Informações de fitness
 * @param {string} goal - Objetivo do usuário
 * @param {number} weekNumber - Número da semana
 * @param {number} weeklyFrequency - Frequência semanal de treinos
 * @returns {Array} Array de treinos da semana
 */
function generateWeeklyWorkouts(weeklyVolume, fitnessInfo, goal, weekNumber, weeklyFrequency = 3) {
  const workouts = [];
  
  // Distribui volume entre tipos de treino baseado no objetivo
  const distributionByGoal = {
    'start_running': { easy: 0.8, tempo: 0.1, intervals: 0.1 },
    'run_5k': { easy: 0.7, tempo: 0.2, intervals: 0.1 },
    'run_10k': { easy: 0.65, tempo: 0.25, intervals: 0.1 },
    'half_marathon': { easy: 0.7, tempo: 0.2, intervals: 0.1 },
    'marathon': { easy: 0.8, tempo: 0.15, intervals: 0.05 },
    'improve_time': { easy: 0.5, tempo: 0.3, intervals: 0.2 }
  };
  
  const distribution = distributionByGoal[goal] || distributionByGoal['run_5k'];
  
  // Gera treinos baseado na frequência semanal
  if (weeklyFrequency === 1) {
    // 1x por semana: apenas um treino moderado
    workouts.push({
      day: 'Domingo',
      type: 'tempo',
      title: 'Treino Único Semanal',
      distance: weeklyVolume,
      description: `Corrida em ritmo moderado por ${weeklyVolume}km. Mantenha um ritmo confortável mas desafiador.`,
      intensity: 'moderada'
    });
  } else if (weeklyFrequency === 2) {
    // 2x por semana: um fácil e um mais intenso
    const longRunDistance = Math.round(weeklyVolume * 0.6);
    const tempoDistance = weeklyVolume - longRunDistance;
    
    workouts.push({
      day: 'Quarta-feira',
      type: 'tempo',
      title: 'Treino Tempo',
      distance: tempoDistance,
      description: `Corrida em ritmo moderadamente difícil por ${tempoDistance}km.`,
      intensity: 'moderada'
    });
    
    workouts.push({
      day: 'Domingo',
      type: 'longao',
      title: 'Corrida Longa',
      distance: longRunDistance,
      description: `Corrida em ritmo confortável por ${longRunDistance}km. Mantenha conversação possível.`,
      intensity: 'fácil'
    });
  } else {
    // 3+ vezes por semana: distribuição completa de treinos
    const longRunDistance = Math.round(weeklyVolume * 0.35);
    const intervalDistance = Math.round(weeklyVolume * distribution.intervals);
    const tempoDistance = Math.round(weeklyVolume * distribution.tempo);
    const easyDistance = weeklyVolume - longRunDistance - intervalDistance - tempoDistance;
    
    // Treino 1: Corrida Longa
    workouts.push({
      day: 'Domingo',
      type: 'longao',
      title: 'Corrida Longa',
      distance: longRunDistance,
      description: `Corrida em ritmo confortável por ${longRunDistance}km. Mantenha conversação possível.`,
      intensity: 'fácil'
    });
    
    // Treino 2: Treino de Velocidade (apenas se 4+ treinos por semana)
    if (weeklyFrequency >= 4) {
      workouts.push({
        day: 'Terça-feira',
        type: 'tiros',
        title: 'Treino de Velocidade',
        distance: intervalDistance,
        description: generateIntervalWorkout(intervalDistance, fitnessInfo.fitnessLevel),
        intensity: 'alta'
      });
    }
    
    // Treino 3: Treino Tempo
    workouts.push({
      day: 'Quinta-feira',
      type: 'tempo',
      title: 'Treino Tempo',
      distance: tempoDistance,
      description: `Corrida em ritmo moderadamente difícil por ${tempoDistance}km. Ritmo que você consegue manter por 1 hora.`,
      intensity: 'moderada'
    });
    
    // Treino 4: Corrida Regenerativa (apenas se 3+ treinos)
    if (weeklyFrequency >= 3 && easyDistance > 0) {
      workouts.push({
        day: 'Sábado',
        type: 'regenerativo',
        title: 'Corrida Regenerativa',
        distance: Math.max(easyDistance, 3),
        description: `Corrida muito leve por ${Math.max(easyDistance, 3)}km. Foco na recuperação.`,
        intensity: 'muito_fácil'
      });
    }
    
    // Treinos adicionais para frequências mais altas
    if (weeklyFrequency >= 5) {
      workouts.push({
        day: 'Segunda-feira',
        type: 'regenerativo',
        title: 'Corrida Leve',
        distance: Math.round(weeklyVolume * 0.15),
        description: `Corrida muito leve para começar a semana. Ritmo bem confortável.`,
        intensity: 'muito_fácil'
      });
    }
    
    if (weeklyFrequency >= 6) {
      workouts.push({
        day: 'Sexta-feira',
        type: 'regenerativo',
        title: 'Corrida de Recuperação',
        distance: Math.round(weeklyVolume * 0.1),
        description: `Corrida curta de recuperação antes do fim de semana.`,
        intensity: 'muito_fácil'
      });
    }
  }
  
  return workouts;
}

/**
 * Gera descrição de treino intervalado
 * @param {number} distance - Distância total
 * @param {string} fitnessLevel - Nível de fitness
 * @returns {string} Descrição do treino
 */
function generateIntervalWorkout(distance, fitnessLevel) {
  const intervals = {
    'beginner': 'Aquecimento 2km + 4x400m (recuperação 200m caminhada) + desaquecimento 1km',
    'beginner_intermediate': 'Aquecimento 2km + 6x400m (recuperação 200m trote) + desaquecimento 1km',
    'intermediate': 'Aquecimento 2km + 5x800m (recuperação 400m trote) + desaquecimento 1km',
    'advanced': 'Aquecimento 2km + 6x1000m (recuperação 400m trote) + desaquecimento 2km'
  };
  
  return intervals[fitnessLevel];
}

module.exports = {
  generateTrainingPlan
}; 