'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Droplets, 
  Utensils, 
  Dumbbell, 
  User, 
  Settings,
  Menu,
  X,
  Heart,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  children: React.ReactNode;
  basePath?: string; // e.g. '/dashboard' (default) or '/home' (legacy)
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function AppSidebar({ children, basePath = '/dashboard' }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Build navigation based on basePath
  const navigation: NavigationItem[] = useMemo(() => {
    const base = basePath.replace(/\/$/, '');
    return [
      { name: 'Dashboard', href: `${base}`, icon: Home },
      { name: 'Water Intake', href: `${base}/water`, icon: Droplets, badge: 'Daily' },
      { name: 'Food Intake', href: `${base}/food`, icon: Utensils, badge: 'Track' },
      { name: 'Workouts', href: `${base}/workout`, icon: Dumbbell, badge: 'Fit' },
      { name: 'Profile', href: `${base}/profile`, icon: User },
    ];
  }, [basePath]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                HealthTracker
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stay Healthy</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/avatar-placeholder.png" />
              <AvatarFallback className="bg-blue-100 text-blue-600">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Sourish Ghosh
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Health Goal: Stay Fit
              </p>
            </div>
          </div>
        </div>

        {/* Daily Health Summary */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Today&apos;s Health
              </span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            
            <div className="space-y-2">
              {/* Health Score */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Health Score</span>
                <Badge variant="default" className="bg-green-100 text-green-700">
                  85/100
                </Badge>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-blue-600 font-medium">1.2L</div>
                  <div className="text-gray-500">Water</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-600 font-medium">1,450</div>
                  <div className="text-gray-500">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-medium">25min</div>
                  <div className="text-gray-500">Exercise</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-500"
                )} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/settings"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            HealthTracker
          </h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
