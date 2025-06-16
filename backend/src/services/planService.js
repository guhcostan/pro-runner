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
    fitnessLevel = 'avançado';
  } else if (pacePerKm <= 300) { // 4:00-5:00/km
    fitnessLevel = 'intermediário';
  } else if (pacePerKm <= 360) { // 5:00-6:00/km
    fitnessLevel = 'iniciante_intermediário';
  } else { // > 6:00/km
    fitnessLevel = 'iniciante';
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
  const { goal } = userData;
  const fitnessInfo = calculateFitnessLevel(userData);
  
  // Volumes base por nível de fitness (km por semana)
  const baseVolumes = {
    'iniciante': 15,
    'iniciante_intermediário': 25,
    'intermediário': 35,
    'avançado': 50
  };
  
  const baseVolume = baseVolumes[fitnessInfo.fitnessLevel];
  
  // Ajusta volume baseado no objetivo
  const goalMultipliers = {
    'fazer_5km': 0.8,
    'comecar_correr': 0.7, // Adicionado suporte para comecar_correr
    'fazer_10km': 1.0,
    'meia_maratona': 1.3,
    'maratona': 1.5,
    'melhorar_tempo': 1.1, // Simplificado de melhorar_tempo_5km
    'perder_peso': 0.9,
    'voltar_a_correr': 0.7
  };
  
  const adjustedVolume = Math.round(baseVolume * (goalMultipliers[goal] || 1.0));
  
  // Gera 8 semanas de treino
  const weeks = [];
  for (let week = 1; week <= 8; week++) {
    const weeklyVolume = Math.round(adjustedVolume * (0.8 + (week * 0.025))); // Progressão gradual
    
    weeks.push({
      week,
      volume: weeklyVolume,
      workouts: generateWeeklyWorkouts(weeklyVolume, fitnessInfo, goal, week)
    });
  }
  
  return {
    user_id: userData.id,
    goal,
    fitness_level: fitnessInfo.fitnessLevel,
    base_pace: fitnessInfo.pacePerKm,
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
 * @returns {Array} Array de treinos da semana
 */
function generateWeeklyWorkouts(weeklyVolume, fitnessInfo, goal, weekNumber) {
  const workouts = [];
  
  // Distribui volume entre tipos de treino baseado no objetivo
  const distributionByGoal = {
    'fazer_5km': { easy: 0.7, tempo: 0.2, intervals: 0.1 },
    'comecar_correr': { easy: 0.8, tempo: 0.1, intervals: 0.1 },
    'fazer_10km': { easy: 0.6, tempo: 0.25, intervals: 0.15 },
    'meia_maratona': { easy: 0.65, tempo: 0.25, intervals: 0.1 },
    'maratona': { easy: 0.7, tempo: 0.2, intervals: 0.1 },
    'melhorar_tempo': { easy: 0.5, tempo: 0.3, intervals: 0.2 },
    'perder_peso': { easy: 0.75, tempo: 0.15, intervals: 0.1 },
    'voltar_a_correr': { easy: 0.8, tempo: 0.1, intervals: 0.1 }
  };
  
  const distribution = distributionByGoal[goal] || distributionByGoal['fazer_5km']; // fallback
  
  // Treino 1: Corrida Longa (Easy)
  const longRunDistance = Math.round(weeklyVolume * 0.35);
  workouts.push({
    day: 'Domingo',
    type: 'longao',
    title: 'Corrida Longa',
    distance: longRunDistance,
    description: `Corrida em ritmo confortável por ${longRunDistance}km. Mantenha conversação possível.`,
    intensity: 'fácil'
  });
  
  // Treino 2: Treino de Velocidade (Intervals)
  const intervalDistance = Math.round(weeklyVolume * distribution.intervals);
  workouts.push({
    day: 'Terça-feira',
    type: 'tiros',
    title: 'Treino de Velocidade',
    distance: intervalDistance,
    description: generateIntervalWorkout(intervalDistance, fitnessInfo.fitnessLevel),
    intensity: 'alta'
  });
  
  // Treino 3: Treino Tempo
  const tempoDistance = Math.round(weeklyVolume * distribution.tempo);
  workouts.push({
    day: 'Quinta-feira',
    type: 'tempo',
    title: 'Treino Tempo',
    distance: tempoDistance,
    description: `Corrida em ritmo moderadamente difícil por ${tempoDistance}km. Ritmo que você consegue manter por 1 hora.`,
    intensity: 'moderada'
  });
  
  // Treino 4: Corrida Regenerativa
  const easyDistance = weeklyVolume - longRunDistance - intervalDistance - tempoDistance;
  workouts.push({
    day: 'Sábado',
    type: 'regenerativo',
    title: 'Corrida Regenerativa',
    distance: Math.max(easyDistance, 3),
    description: `Corrida muito leve por ${Math.max(easyDistance, 3)}km. Foco na recuperação.`,
    intensity: 'muito_fácil'
  });
  
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
    'iniciante': 'Aquecimento 2km + 4x400m (recuperação 200m caminhada) + desaquecimento 1km',
    'iniciante_intermediário': 'Aquecimento 2km + 6x400m (recuperação 200m trote) + desaquecimento 1km',
    'intermediário': 'Aquecimento 2km + 5x800m (recuperação 400m trote) + desaquecimento 1km',
    'avançado': 'Aquecimento 2km + 6x1000m (recuperação 400m trote) + desaquecimento 2km'
  };
  
  return intervals[fitnessLevel];
}

module.exports = {
  generateTrainingPlan
}; 