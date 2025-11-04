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

export interface HealthGoalGuidance {
  priority: string;
  focusAreas: string[];
  dailyTips: string[];
  weeklyGoals: string[];
  nutrition: {
    focus: string;
    recommendations: string[];
  };
  exercise: {
    focus: string;
    recommendations: string[];
  };
  hydration: {
    focus: string;
    recommendations: string[];
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
 * Personalized guidance and action items for each health goal
 */
export const HEALTH_GOAL_GUIDANCE: Record<HealthGoal, HealthGoalGuidance> = {
  'Stay Healthy': {
    priority: 'Balance and consistency',
    focusAreas: ['Balanced nutrition', 'Regular exercise', 'Adequate hydration', 'Consistent sleep'],
    dailyTips: [
      'Drink water throughout the day, not all at once',
      'Include vegetables in at least 2 meals',
      'Take a 10-minute walk after meals',
      'Aim for 7-8 hours of sleep',
    ],
    weeklyGoals: [
      'Exercise at least 3-4 times per week',
      'Try one new healthy recipe',
      'Complete 150 minutes of moderate activity',
      'Maintain a consistent meal schedule',
    ],
    nutrition: {
      focus: 'Balanced meals with variety',
      recommendations: [
        'Eat a mix of proteins, carbs, and healthy fats',
        'Include fruits and vegetables in every meal',
        'Practice portion control',
        'Limit processed foods and added sugars',
      ],
    },
    exercise: {
      focus: 'Consistent moderate activity',
      recommendations: [
        'Mix cardio and strength training',
        '30 minutes of activity most days',
        'Try walking, cycling, or swimming',
        'Include flexibility exercises',
      ],
    },
    hydration: {
      focus: 'Stay consistently hydrated',
      recommendations: [
        'Drink 2.5L of water daily',
        'Start your day with a glass of water',
        'Drink water before meals',
        'Monitor urine color (should be pale yellow)',
      ],
    },
  },
  'Lose Weight': {
    priority: 'Calorie deficit with proper nutrition',
    focusAreas: ['Calorie tracking', 'Increased cardio', 'Hydration', 'Portion control'],
    dailyTips: [
      'Drink water before each meal to reduce appetite',
      'Track every meal and snack',
      'Do at least 20 minutes of cardio',
      'Avoid eating 2-3 hours before bed',
    ],
    weeklyGoals: [
      'Create a 500-750 calorie daily deficit',
      'Exercise 5-6 times per week',
      'Complete 200+ minutes of cardio',
      'Meal prep for the week ahead',
    ],
    nutrition: {
      focus: 'Calorie deficit with adequate protein',
      recommendations: [
        'Aim for 1800 calories per day',
        'Increase protein to preserve muscle (1g per lb bodyweight)',
        'Fill half your plate with vegetables',
        'Choose whole grains over refined carbs',
        'Avoid liquid calories (sodas, juices)',
      ],
    },
    exercise: {
      focus: 'High-intensity cardio and strength training',
      recommendations: [
        'Prioritize cardio for calorie burn',
        '20-30 minutes of HIIT 3x per week',
        'Add strength training 2-3x per week',
        'Stay active with 10,000+ steps daily',
        'Try interval training for efficiency',
      ],
    },
    hydration: {
      focus: 'Drink extra water to support weight loss',
      recommendations: [
        'Drink 3L of water daily',
        'Water helps boost metabolism',
        'Drink cold water to burn extra calories',
        'Replace sugary drinks with water or tea',
      ],
    },
  },
  'Gain Muscle': {
    priority: 'Calorie surplus with high protein',
    focusAreas: ['Progressive overload', 'High protein intake', 'Recovery', 'Consistent training'],
    dailyTips: [
      'Eat protein with every meal (30-40g)',
      'Drink water during and after workouts',
      'Focus on compound exercises',
      'Get 8-9 hours of sleep for recovery',
    ],
    weeklyGoals: [
      'Strength train 4-5 times per week',
      'Consume 2800+ calories daily',
      'Increase weights or reps progressively',
      'Track your lifts and progress',
    ],
    nutrition: {
      focus: 'Calorie surplus with high protein',
      recommendations: [
        'Target 2800+ calories per day',
        'Consume 1.6-2.2g protein per kg bodyweight',
        'Eat carbs around workouts for energy',
        'Include healthy fats (nuts, avocado, olive oil)',
        'Eat every 3-4 hours to maintain energy',
      ],
    },
    exercise: {
      focus: 'Progressive resistance training',
      recommendations: [
        'Focus on compound lifts (squat, deadlift, bench)',
        'Train each muscle group 2x per week',
        'Use progressive overload (increase weight/reps)',
        '45-60 minute sessions, 4-5x per week',
        'Limit cardio to preserve muscle',
      ],
    },
    hydration: {
      focus: 'Hydrate for performance and recovery',
      recommendations: [
        'Drink 3.5L of water daily',
        'Hydration aids muscle recovery',
        'Drink 500ml before workouts',
        'Consider electrolytes for long sessions',
      ],
    },
  },
  'Improve Performance': {
    priority: 'Sport-specific training and recovery',
    focusAreas: ['Performance metrics', 'Optimal nutrition timing', 'Recovery', 'Skill development'],
    dailyTips: [
      'Track performance metrics (speed, strength, endurance)',
      'Time nutrition around training',
      'Include mobility work daily',
      'Focus on quality sleep and recovery',
    ],
    weeklyGoals: [
      'Train 5-6 times with varied intensity',
      'Hit sport-specific performance targets',
      'Complete 250+ minutes of training',
      'Include one active recovery day',
    ],
    nutrition: {
      focus: 'Performance-optimized nutrition',
      recommendations: [
        'Target 2500 calories with macro tracking',
        'Carb-load before intense training',
        'Protein within 30 min post-workout',
        'Time meals around training sessions',
        'Consider supplements (protein, creatine, BCAAs)',
      ],
    },
    exercise: {
      focus: 'Periodized sport-specific training',
      recommendations: [
        'Follow a structured training plan',
        'Mix high-intensity and low-intensity days',
        'Include sport-specific drills',
        'Track progress with measurable metrics',
        'Incorporate plyometrics and speed work',
      ],
    },
    hydration: {
      focus: 'Optimal hydration for peak performance',
      recommendations: [
        'Drink 3.5L+ of water daily',
        'Hydrate before, during, and after training',
        'Monitor hydration status closely',
        'Use electrolyte drinks for intense sessions',
      ],
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
 * Get health goal guidance based on user's stored goal
 */
export function getHealthGoalGuidance(goal?: string | null): HealthGoalGuidance {
  if (!goal || !(goal in HEALTH_GOAL_GUIDANCE)) {
    return HEALTH_GOAL_GUIDANCE['Stay Healthy'];
  }
  return HEALTH_GOAL_GUIDANCE[goal as HealthGoal];
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
 * Get current user's health goal guidance
 */
export function getCurrentHealthGoalGuidance(): HealthGoalGuidance {
  const goal = getCurrentHealthGoal();
  return getHealthGoalGuidance(goal);
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
