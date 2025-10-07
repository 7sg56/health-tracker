'use client';

import React from 'react';
import { 
  createNavigationConfig,
  useNavigation,
  DEFAULT_USER_PROFILE,
  DEFAULT_HEALTH_SUMMARY,
} from '@/lib/navigation';

/**
 * Example component showing how to use the navigation utilities
 */
export function NavigationExample() {
  // Create navigation configuration
  const navigationConfig = createNavigationConfig('/dashboard', {
    extended: false, // Use basic navigation items
    userProfile: DEFAULT_USER_PROFILE,
    healthSummary: DEFAULT_HEALTH_SUMMARY,
  });

  // Use the navigation hook
  const {
    state,
    navigationItems,
    activeItem,
    breadcrumbs,
    navigate,
    toggleMobile,
    isActive,
    getItemById,
  } = useNavigation(navigationConfig, {
    onNavigate: (item) => {
      console.log('Navigating to:', item.label);
    },
    onMobileToggle: (open) => {
      console.log('Mobile navigation:', open ? 'opened' : 'closed');
    },
    onLogout: () => {
      console.log('User logged out');
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Navigation Utilities Example</h1>
      
      {/* Current State */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Current Navigation State</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p><strong>Active Item:</strong> {activeItem?.label || 'None'}</p>
          <p><strong>Active Path:</strong> {state.activePath}</p>
          <p><strong>Mobile Open:</strong> {state.mobileOpen ? 'Yes' : 'No'}</p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Breadcrumbs</h2>
        <nav className="flex space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => navigate(getItemById(crumb.href.split('/').pop() || '') || navigationItems[0])}
                className={`hover:underline ${
                  crumb.isCurrentPage ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </section>

      {/* Navigation Items */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Navigation Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                isActive(item.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => navigate(item)}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.label}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                </div>
                {item.badge && (
                  <span className="px-2 py-1 text-xs bg-gray-200 rounded">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.shortcut && (
                <p className="text-xs text-gray-500 mt-2">
                  Shortcut: {item.shortcut}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Controls */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Controls</h2>
        <div className="space-x-4">
          <button
            onClick={() => toggleMobile()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Toggle Mobile Navigation
          </button>
          <button
            onClick={() => navigate(navigationItems[0])}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Go to Dashboard
          </button>
        </div>
      </section>

      {/* User Profile */}
      {navigationConfig.userProfile && (
        <section>
          <h2 className="text-lg font-semibold mb-2">User Profile</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>Name:</strong> {navigationConfig.userProfile.name}</p>
            <p><strong>Email:</strong> {navigationConfig.userProfile.email}</p>
            <p><strong>Health Goal:</strong> {navigationConfig.userProfile.healthGoal}</p>
          </div>
        </section>
      )}

      {/* Health Summary */}
      {navigationConfig.healthSummary && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Health Summary</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>Health Score:</strong> {navigationConfig.healthSummary.healthScore}/100</p>
            <p><strong>Water:</strong> {navigationConfig.healthSummary.waterIntake.current}L / {navigationConfig.healthSummary.waterIntake.goal}L</p>
            <p><strong>Calories:</strong> {navigationConfig.healthSummary.calories.current} / {navigationConfig.healthSummary.calories.goal}</p>
            <p><strong>Exercise:</strong> {navigationConfig.healthSummary.exercise.current}min / {navigationConfig.healthSummary.exercise.goal}min</p>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Example of creating a custom navigation configuration
 */
export function CustomNavigationExample() {
  const customConfig = createNavigationConfig('/app', {
    extended: true, // Use extended navigation items
    userProfile: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      healthGoal: 'Lose Weight',
      initials: 'JS',
    },
    healthSummary: {
      healthScore: 92,
      waterIntake: { current: 2.1, goal: 2.5, unit: 'L' },
      calories: { current: 1200, goal: 1500, unit: 'kcal' },
      exercise: { current: 45, goal: 60, unit: 'min' },
      lastUpdated: new Date(),
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Custom Navigation Configuration</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>Base Path:</strong> {customConfig.basePath}</p>
        <p><strong>Items Count:</strong> {customConfig.items.length}</p>
        <p><strong>Groups Count:</strong> {customConfig.groups?.length || 0}</p>
        <p><strong>User:</strong> {customConfig.userProfile?.name}</p>
        <p><strong>Health Score:</strong> {customConfig.healthSummary?.healthScore}/100</p>
      </div>
    </div>
  );
}