import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ProRunnerColors } from '../../constants/Colors';

interface WeeklyCalendarProps {
  currentWeek: number;
  totalWeeks: number;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  workoutDays: Record<string, any>; // workouts by date string
}

const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

export default function WeeklyCalendar({
  currentWeek,
  totalWeeks,
  selectedDate,
  onDateSelect,
  workoutDays,
}: WeeklyCalendarProps) {
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const weekDates = getWeekDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    return date.getTime() === today.getTime();
  };

  const isSelected = (date: Date) => {
    return date.getTime() === selectedDate.getTime();
  };

  const hasWorkout = (date: Date) => {
    const dateKey = formatDateKey(date);
    return !!workoutDays[dateKey];
  };

  const getWorkoutType = (date: Date) => {
    const dateKey = formatDateKey(date);
    const workout = workoutDays[dateKey];
    return workout?.type || null;
  };

  const getWorkoutColor = (type: string) => {
    switch (type) {
      case 'longoes':
        return ProRunnerColors.workoutTypes.longao;
      case 'tiros':
        return ProRunnerColors.workoutTypes.tiros;
      case 'tempo':
        return ProRunnerColors.workoutTypes.tempo;
      case 'regenerativo':
        return ProRunnerColors.workoutTypes.regenerativo;
      default:
        return ProRunnerColors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.weekInfo}>
          <View style={styles.weekIndicator}>
            <Text style={styles.weekText}>Week {currentWeek}/{totalWeeks}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {weekDates.map((date, index) => {
          const dayWorkoutType = getWorkoutType(date);
          const workoutColor = dayWorkoutType ? getWorkoutColor(dayWorkoutType) : null;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                isSelected(date) && styles.dayContainerSelected,
                isToday(date) && styles.dayContainerToday,
              ]}
              onPress={() => onDateSelect(date)}
            >
              <Text style={[
                styles.dayLabel,
                isSelected(date) && styles.dayLabelSelected,
                isToday(date) && styles.dayLabelToday,
              ]}>
                {DAYS[index]}
              </Text>
              
              <View style={[
                styles.dayNumber,
                isSelected(date) && styles.dayNumberSelected,
                isToday(date) && styles.dayNumberToday,
              ]}>
                <Text style={[
                  styles.dayNumberText,
                  isSelected(date) && styles.dayNumberTextSelected,
                  isToday(date) && styles.dayNumberTextToday,
                ]}>
                  {date.getDate()}
                </Text>
              </View>

              {hasWorkout(date) && (
                <View style={styles.workoutIndicators}>
                  <View
                    style={[
                      styles.workoutDot,
                      { backgroundColor: workoutColor }
                    ]}
                  />
                  <View
                    style={[
                      styles.workoutLine,
                      { backgroundColor: workoutColor }
                    ]}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ProRunnerColors.background,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekIndicator: {
    backgroundColor: ProRunnerColors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ProRunnerColors.primary,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  daysContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayContainer: {
    alignItems: 'center',
    minWidth: 60,
    paddingVertical: 8,
  },
  dayContainerSelected: {
    backgroundColor: `${ProRunnerColors.primary}15`,
    borderRadius: 12,
  },
  dayContainerToday: {
    backgroundColor: `${ProRunnerColors.primary}08`,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: ProRunnerColors.textSecondary,
    marginBottom: 8,
  },
  dayLabelSelected: {
    color: ProRunnerColors.primary,
  },
  dayLabelToday: {
    color: ProRunnerColors.textPrimary,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dayNumberSelected: {
    backgroundColor: ProRunnerColors.primary,
  },
  dayNumberToday: {
    backgroundColor: ProRunnerColors.cardBackground,
    borderWidth: 2,
    borderColor: ProRunnerColors.primary,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: ProRunnerColors.textPrimary,
  },
  dayNumberTextSelected: {
    color: ProRunnerColors.background,
  },
  dayNumberTextToday: {
    color: ProRunnerColors.primary,
  },
  workoutIndicators: {
    alignItems: 'center',
    gap: 2,
  },
  workoutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  workoutLine: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
  },
}); 