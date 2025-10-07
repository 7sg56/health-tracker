"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Droplets, 
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  X,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview of your health metrics",
  },
  {
    title: "Water Intake",
    href: "/dashboard/water",
    icon: Droplets,
    description: "Track your daily hydration",
  },
  {
    title: "Food Intake",
    href: "/dashboard/food",
    icon: Utensils,
    description: "Log your meals and calories",
  },
  {
    title: "Workouts",
    href: "/dashboard/workout",
    icon: Dumbbell,
    description: "Record your exercise activities",
  },
  {
    title: "Health Score",
    href: "/dashboard/health-score",
    icon: TrendingUp,
    description: "View your health trends",
  },
];

export function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        id="navigation"
        className={cn(
          "fixed left-0 top-14 sm:top-16 z-30 hidden h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-64 border-r border-border bg-background lg:block",
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 sm:w-80 transform border-r border-border bg-background transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        {/* Mobile header */}
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 border-b border-border">
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-2" 
            onClick={onClose}
            aria-label="HealthTracker home"
          >
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
            <span className="font-bold text-base sm:text-lg">HealthTracker</span>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-9 w-9 sm:h-10 sm:w-10"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </Button>
        </div>

        <SidebarContent pathname={pathname} onItemClick={onClose} isMobile />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  pathname: string;
  onItemClick?: () => void;
  isMobile?: boolean;
}

function SidebarContent({ pathname, onItemClick, isMobile = false }: SidebarContentProps) {
  return (
    <ScrollArea className="h-full py-4 sm:py-6">
      <div className="px-3 space-y-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-base sm:text-lg font-semibold tracking-tight">
            Health Tracking
          </h2>
        </div>
        
        <nav className="space-y-1" role="navigation" aria-label="Health tracking navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center rounded-lg px-3 py-3 sm:py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  // Touch-friendly sizing for mobile
                  isMobile && "min-h-[48px]",
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-muted-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-describedby={item.description ? `${item.href}-desc` : undefined}
              >
                <Icon className="mr-3 h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.title}</div>
                  {item.description && (
                    <div 
                      id={`${item.href}-desc`}
                      className={cn(
                        "text-xs mt-0.5 truncate",
                        isActive 
                          ? "text-primary-foreground/80" 
                          : "text-muted-foreground/80"
                      )}
                    >
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" role="separator" />

        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
            Quick Actions
          </h3>
          <div className="space-y-1" role="group" aria-label="Quick actions">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start text-sm font-normal",
                isMobile && "h-12 py-3"
              )}
              onClick={onItemClick}
              aria-label="Add water intake"
            >
              <Droplets className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Add Water</span>
            </Button>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start text-sm font-normal",
                isMobile && "h-12 py-3"
              )}
              onClick={onItemClick}
              aria-label="Log meal"
            >
              <Utensils className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Log Meal</span>
            </Button>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start text-sm font-normal",
                isMobile && "h-12 py-3"
              )}
              onClick={onItemClick}
              aria-label="Add workout"
            >
              <Dumbbell className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Add Workout</span>
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}