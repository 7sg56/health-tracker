/**
 * Health Goal-Based Limits Configuration
 * 
 * This file defines validation limits for water intake, food intake, and workouts
 * based on the user's selected health goal.
 */

export type HealthGoal = 'Stay Healthy' | 'Lose Weight' | 'Gain Muscle' | 'Improve Performance';

export interface HealthGoalLimits {
  water: {
    min: number;
    max: number;
    recommended: number; // Daily recommended amount in liters
  };
  food: {
    calories: {
      min: number;
      max: number;
    };
    dailyTarget?: number; // Optional daily calorie target
  };
  workout: {
    duration: {
      min: number;
      max: number;
    };
    calories: {
      min: number;
      max: number;
    };
    weeklyMinutes?: number; // Optional weekly target
  };
}

/**
 * Health goal configurations with tailored limits for each goal type
 */
export const HEALTH_GOAL_LIMITS: Record<HealthGoal, HealthGoalLimits> = {
  'Stay Healthy': {
    water: {
      min: 0.1,
      max: 10.0,
      recommended: 2.5,
    },
    food: {
      calories: {
        min: 1,
        max: 5000,
      },
      dailyTarget: 2000,
    },
    workout: {
      duration: {
        min: 1,
        max: 600,
      },
      calories: {
        min: 0,
        max: 2000,
      },
      weeklyMinutes: 150,
    },
  },
  'Lose Weight': {
    water: {
      min: 0.5,
      max: 10.0,
      recommended: 3.0, // More water helps with weight loss
    },
    food: {
      calories: {
        min: 1,
        max: 2500, // Lower calorie ceiling to promote deficit
      },
      dailyTarget: 1800,
    },
    workout: {
      duration: {
        min: 15, // Encourage minimum workout duration
        max: 600,
      },
      calories: {
        min: 100, // Encourage calorie burn
        max: 2000,
      },
      weeklyMinutes: 200, // Higher weekly target
    },
  },
  'Gain Muscle': {
    water: {
      min: 0.5,
      max: 12.0, // Higher water intake for muscle recovery
      recommended: 3.5,
    },
    food: {
      calories: {
        min: 500, // Need substantial calories for muscle building
        max: 6000, // Higher calorie ceiling for bulking
      },
      dailyTarget: 2800,
    },
    workout: {
      duration: {
        min: 1,
        max: 600,
      },
      calories: {
        min: 0,
        max: 2500, // Can burn more with intense training
      },
      weeklyMinutes: 180,
    },
  },
  'Improve Performance': {
    water: {
      min: 0.5,
      max: 12.0, // Hydration is crucial for performance
      recommended: 3.5,
    },
    food: {
      calories: {
        min: 200,
        max: 5500, // Need fuel for high performance
      },
      dailyTarget: 2500,
    },
    workout: {
      duration: {
        min: 10, // Athletes may do shorter intense sessions
        max: 720, // Can train longer for endurance
      },
      calories: {
        min: 50,
        max: 3000, // High-intensity workouts can burn more
      },
      weeklyMinutes: 250,
    },
  },
};

/**
 * Get health goal limits based on user's stored goal
 * Defaults to 'Stay Healthy' if no goal is set
 */
export function getHealthGoalLimits(goal?: string | null): HealthGoalLimits {
  if (!goal || !(goal in HEALTH_GOAL_LIMITS)) {
    return HEALTH_GOAL_LIMITS['Stay Healthy'];
  }
  return HEALTH_GOAL_LIMITS[goal as HealthGoal];
}

/**
 * Get the current user's health goal from localStorage
 */
export function getCurrentHealthGoal(): HealthGoal {
  if (typeof window === 'undefined') {
    return 'Stay Healthy';
  }
  
  const storedGoal = localStorage.getItem('ht_goal');
  if (storedGoal && storedGoal in HEALTH_GOAL_LIMITS) {
    return storedGoal as HealthGoal;
  }
  
  return 'Stay Healthy';
}

/**
 * Get current user's health goal limits
 */
export function getCurrentHealthGoalLimits(): HealthGoalLimits {
  const goal = getCurrentHealthGoal();
  return getHealthGoalLimits(goal);
}

/**
 * Goal descriptions to help users understand each goal
 */
export const HEALTH_GOAL_DESCRIPTIONS: Record<HealthGoal, string> = {
  'Stay Healthy': 'Maintain a balanced lifestyle with moderate exercise and nutrition',
  'Lose Weight': 'Focus on calorie deficit with increased cardio and hydration',
  'Gain Muscle': 'Build muscle mass with higher calorie intake and strength training',
  'Improve Performance': 'Enhance athletic performance with optimized training and nutrition',
};

