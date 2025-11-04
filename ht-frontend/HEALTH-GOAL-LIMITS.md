# Health Goal-Based Limits Feature

## Overview

This feature implements personalized health tracking limits based on the user's selected health goal. Different health goals (Stay Healthy, Lose Weight, Gain Muscle, Improve Performance) now have tailored validation limits for water intake, food calories, and workout metrics.

## Health Goals

### 1. Stay Healthy (Default)
**Purpose**: Maintain a balanced lifestyle with moderate exercise and nutrition

**Limits**:
- **Water**: 0.1L - 10L per entry, 2.5L daily recommended
- **Food**: 1 - 5000 cal per meal, 2000 cal daily target
- **Workout**: 1 - 600 min duration, 0 - 2000 cal burned, 150 min weekly target

### 2. Lose Weight
**Purpose**: Focus on calorie deficit with increased cardio and hydration

**Limits**:
- **Water**: 0.5L - 10L per entry, 3.0L daily recommended (increased hydration)
- **Food**: 1 - 2500 cal per meal, 1800 cal daily target (lower ceiling for deficit)
- **Workout**: 15 - 600 min duration (encouraged minimum), 100 - 2000 cal burned, 200 min weekly target

### 3. Gain Muscle
**Purpose**: Build muscle mass with higher calorie intake and strength training

**Limits**:
- **Water**: 0.5L - 12L per entry, 3.5L daily recommended (higher for recovery)
- **Food**: 500 - 6000 cal per meal (substantial calories for bulking), 2800 cal daily target
- **Workout**: 1 - 600 min duration, 0 - 2500 cal burned, 180 min weekly target

### 4. Improve Performance
**Purpose**: Enhance athletic performance with optimized training and nutrition

**Limits**:
- **Water**: 0.5L - 12L per entry, 3.5L daily recommended (crucial for performance)
- **Food**: 200 - 5500 cal per meal, 2500 cal daily target
- **Workout**: 10 - 720 min duration (shorter intense or longer endurance), 50 - 3000 cal burned, 250 min weekly target

## Implementation Details

### New Files

#### `lib/config/health-goal-limits.ts`
- Defines `HealthGoalLimits` interface
- Contains `HEALTH_GOAL_LIMITS` configuration object
- Exports helper functions:
  - `getHealthGoalLimits(goal)`: Get limits for a specific goal
  - `getCurrentHealthGoal()`: Get user's current goal from localStorage
  - `getCurrentHealthGoalLimits()`: Get current user's goal limits
- Includes `HEALTH_GOAL_DESCRIPTIONS` for UI display

### Modified Files

#### `lib/validations/health.ts`
- Added dynamic schema creation functions:
  - `createWaterIntakeSchema(limits?)`
  - `createFoodIntakeSchema(limits?)`
  - `createWorkoutSchema(limits?)`
- Validation messages now dynamically reflect the selected goal's limits
- Maintains backward compatibility with default schemas

#### `components/forms/water-intake-form.tsx`
- Added health goal state management
- Listens for `profileUpdated` events to refresh limits
- Displays goal-specific information banner with:
  - Current health goal name
  - Daily recommended water amount
  - Per-entry range limits
- Input field attributes (min/max) dynamically set based on goal

#### `components/forms/food-intake-form.tsx`
- Similar health goal state management as water form
- Shows goal-specific banner with:
  - Current health goal name
  - Daily calorie target (if applicable)
  - Per-meal calorie range
- Calorie input validation reflects goal limits

#### `components/forms/workout-form.tsx`
- Implements dynamic limits for workout tracking
- Displays goal banner with:
  - Current health goal name
  - Weekly workout minutes target
  - Duration and calorie ranges
- Both duration and calories burned inputs use goal-specific limits

#### `app/dashboard/profile/page.tsx`
- Enhanced with new "Health Goal Details" card
- Shows comprehensive breakdown of all limits for selected goal
- Displays goal description
- Real-time preview of limits as user changes goals
- Organized by category (Water, Food, Workout)

## User Experience

### Profile Page
1. User selects a health goal from dropdown
2. Goal description appears immediately
3. "Health Goal Details" card shows all personalized limits
4. User clicks "Save changes" to apply the goal

### Tracking Forms
1. Each form (water, food, workout) displays the current goal
2. Recommended daily targets are prominently shown
3. Form validation automatically adjusts to goal limits
4. Input fields show appropriate min/max values
5. Error messages reflect the selected goal's constraints

### Dynamic Updates
- When a user updates their health goal in the profile:
  - A `profileUpdated` event is dispatched
  - All tracking forms listen for this event
  - Forms automatically reload with new limits
  - No page refresh required

## Benefits

1. **Personalized Experience**: Each goal has scientifically-informed limits
2. **Guided Tracking**: Users receive appropriate guidance for their goals
3. **Flexible Validation**: Backend limits remain unchanged; frontend adapts to user needs
4. **Clear Communication**: Users always know what ranges are expected
5. **Motivation**: Weekly and daily targets provide clear objectives

## Technical Notes

- All limits are stored in a centralized configuration file
- The health goal is persisted in localStorage
- Forms react to goal changes without page reloads
- The implementation is type-safe with TypeScript
- Backward compatible with existing data

## Future Enhancements

Potential improvements:
- Custom goal creation where users define their own limits
- Progress tracking against weekly/daily targets
- Notifications when approaching daily limits
- Historical comparison of performance across different goals
- Integration with backend for persistent goal storage
- Adaptive limits based on user's actual performance data

