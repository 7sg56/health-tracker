/**
 * Lazy-loaded page components for code splitting
 * This file exports dynamically imported page components to improve initial bundle size
 */

import dynamic from 'next/dynamic';
import { 
  DashboardSkeleton, 
  FormPageSkeleton, 
  AuthPageSkeleton 
} from '@/components/layout/LazyPageWrapper';

// Authentication pages
export const LazyLoginPage = dynamic(
  () => import('@/app/auth/login/page'),
  {
    loading: () => <AuthPageSkeleton />,
    ssr: false, // Disable SSR for auth pages to avoid hydration issues
  }
);

export const LazyRegisterPage = dynamic(
  () => import('@/app/auth/register/page'),
  {
    loading: () => <AuthPageSkeleton />,
    ssr: false,
  }
);

// Dashboard and main pages
export const LazyDashboardPage = dynamic(
  () => import('@/app/home/page'),
  {
    loading: () => <DashboardSkeleton />,
  }
);

export const LazyHealthScorePage = dynamic(
  () => import('@/app/home/health-score/page'),
  {
    loading: () => <DashboardSkeleton />,
  }
);

// Health tracking pages
export const LazyWaterIntakePage = dynamic(
  () => import('@/app/home/waterIntake/page'),
  {
    loading: () => <FormPageSkeleton />,
  }
);

export const LazyFoodIntakePage = dynamic(
  () => import('@/app/home/foodIntake/page'),
  {
    loading: () => <FormPageSkeleton />,
  }
);

export const LazyWorkoutPage = dynamic(
  () => import('@/app/home/workout/page'),
  {
    loading: () => <FormPageSkeleton />,
  }
);

// Profile and settings
export const LazyProfilePage = dynamic(
  () => import('@/app/home/profile/page'),
  {
    loading: () => <FormPageSkeleton />,
  }
);

// Chart components (heavy dependencies)
export const LazyHealthScoreChart = dynamic(
  () => import('@/components/charts/health-score-line-chart').then(mod => ({ default: mod.HealthScoreLineChart })),
  {
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    ),
  }
);

export const LazyHealthScoreBarChart = dynamic(
  () => import('@/components/charts/health-score-bar-chart').then(mod => ({ default: mod.HealthScoreBarChart })),
  {
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    ),
  }
);

export const LazyProgressComparisonChart = dynamic(
  () => import('@/components/charts/progress-comparison-chart').then(mod => ({ default: mod.ProgressComparisonChart })),
  {
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    ),
  }
);

export const LazyWeeklySummaryChart = dynamic(
  () => import('@/components/charts/weekly-summary-chart').then(mod => ({ default: mod.WeeklySummaryChart })),
  {
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    ),
  }
);

export const LazyMonthlySummaryChart = dynamic(
  () => import('@/components/charts/monthly-summary-chart').then(mod => ({ default: mod.MonthlySummaryChart })),
  {
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart...</span>
      </div>
    ),
  }
);

// Heavy UI components
export const LazyDataTable = dynamic(
  () => import('@/components/ui/table').then(mod => ({ default: mod.Table })),
  {
    loading: () => (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    ),
  }
);

// Form components with heavy validation
export const LazyEnhancedForm = dynamic(
  () => import('@/components/ui/enhanced-form-field').then(mod => ({ default: mod.EnhancedFormField })),
  {
    loading: () => (
      <div className="space-y-2">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </div>
    ),
  }
);

// API testing page (development only)
export const LazyApiTestPage = dynamic(
  () => import('@/app/api-test/page'),
  {
    loading: () => <FormPageSkeleton />,
    ssr: false, // Only load on client side
  }
);

// Demo/example pages
export const LazyDemoSearchPage = dynamic(
  () => import('@/app/home/demo-search/page'),
  {
    loading: () => <FormPageSkeleton />,
  }
);

// Preload critical components for better UX
export const preloadCriticalComponents = () => {
  // Preload dashboard components
  LazyDashboardPage.preload?.();
  LazyHealthScoreChart.preload?.();
  
  // Preload auth components (likely to be needed)
  LazyLoginPage.preload?.();
  
  // Preload most used tracking pages
  LazyWaterIntakePage.preload?.();
  LazyFoodIntakePage.preload?.();
};

// Preload components based on user interaction
export const preloadOnHover = {
  dashboard: () => LazyDashboardPage.preload?.(),
  waterIntake: () => LazyWaterIntakePage.preload?.(),
  foodIntake: () => LazyFoodIntakePage.preload?.(),
  workout: () => LazyWorkoutPage.preload?.(),
  healthScore: () => LazyHealthScorePage.preload?.(),
  profile: () => LazyProfilePage.preload?.(),
  login: () => LazyLoginPage.preload?.(),
  register: () => LazyRegisterPage.preload?.(),
};

// Bundle information for monitoring
export const bundleInfo = {
  pages: {
    auth: ['LazyLoginPage', 'LazyRegisterPage'],
    dashboard: ['LazyDashboardPage', 'LazyHealthScorePage'],
    tracking: ['LazyWaterIntakePage', 'LazyFoodIntakePage', 'LazyWorkoutPage'],
    profile: ['LazyProfilePage'],
    charts: ['LazyHealthScoreChart', 'LazyHealthScoreBarChart', 'LazyProgressComparisonChart'],
  },
  estimatedSizes: {
    auth: '~15KB',
    dashboard: '~25KB',
    tracking: '~20KB each',
    charts: '~30KB each (includes Recharts)',
    profile: '~10KB',
  },
};