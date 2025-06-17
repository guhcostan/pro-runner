import { fitnessLevels, workoutTypes } from '../constants/i18n';

export function translateFitnessLevel(level: string, language: 'pt' | 'en' = 'pt'): string {
  return fitnessLevels[language][level as keyof typeof fitnessLevels.pt] || level;
}

export function translateWorkoutType(type: string, language: 'pt' | 'en' = 'pt'): string {
  return workoutTypes[language][type as keyof typeof workoutTypes.pt] || type;
}

export function formatPace(pace: string): string {
  return pace ? `${pace}/km` : '';
}

export function formatDistance(distance: number): string {
  return `${distance}km`;
}

export function getGoalDisplayName(goal: string): string {
  const goalNames = {
    start_running: 'Começar a Correr',
    run_5k: 'Correr 5K',
    run_10k: 'Correr 10K',
    half_marathon: 'Meia Maratona',
    marathon: 'Maratona',
    improve_time: 'Melhorar Tempo',
  };
  
  return goalNames[goal as keyof typeof goalNames] || goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
} 