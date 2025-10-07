"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, User, LogOut, Settings, Activity, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"
import { announceToScreenReader } from "@/lib/utils/accessibility"
import { useAuth } from "@/contexts/AuthContext"
import { useBreadcrumbs } from "@/hooks/use-navigation-routes"

interface TopHeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
  className?: string
}

interface BreadcrumbItem {
  label: string
  href?: string
}



export function TopHeader({ 
  onMenuClick, 
  showMenuButton = true, 
  className 
}: TopHeaderProps) {
  const pathname = usePathname()
  const { state, logout } = useAuth()
  const { user } = state

  const breadcrumbs = useBreadcrumbs()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      role="banner"
    >
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Mobile menu button */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => {
              onMenuClick?.();
              // Announce to screen readers
              announceToScreenReader('Navigation menu opened', 'polite');
            }}
            aria-label="Open navigation menu"
            aria-expanded={false}
            aria-controls="navigation"
            aria-haspopup="dialog"
          >
            <Menu className="h-4 w-4 transition-transform duration-200" aria-hidden="true" />
          </Button>
        )}

        {/* Logo - visible on mobile when sidebar is closed */}
        <Link 
          href="/dashboard" 
          className="mr-4 flex items-center space-x-2 lg:hidden transition-all duration-200 hover:scale-105 active:scale-95 group"
          aria-label="HealthTracker dashboard"
        >
          <Activity className="h-5 w-5 text-primary transition-transform duration-200 group-hover:rotate-12" aria-hidden="true" />
          <span className="font-bold transition-colors duration-200 group-hover:text-primary">HealthTracker</span>
        </Link>

        {/* Breadcrumb Navigation - hidden on mobile */}
        <div className="hidden lg:flex">
          <Breadcrumb>
            <BreadcrumbList role="navigation" aria-label="Breadcrumb navigation">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link 
                          href={item.href}
                          className="focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none rounded-sm"
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage aria-current="page">{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* User profile dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label={`User menu for ${user.username}`}
                  aria-haspopup="menu"
                  aria-expanded={false}
                >
                  <Avatar className="h-8 w-8 transition-all duration-200 hover:ring-2 hover:ring-primary/20">
                    <AvatarImage 
                      src={undefined} 
                      alt={`${user.username}'s avatar`} 
                    />
                    <AvatarFallback className="text-xs transition-colors duration-200 hover:bg-primary/10">
                      {user.username
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56" 
                align="end" 
                forceMount
                role="menu"
                aria-label="User account menu"
                onCloseAutoFocus={(e) => {
                  // Prevent auto-focus behavior that might interfere with screen readers
                  e.preventDefault();
                }}
              >
                <DropdownMenuLabel className="font-normal" role="none">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator role="separator" />
                <DropdownMenuItem asChild>
                  <Link 
                    href="/dashboard/profile" 
                    className="cursor-pointer transition-all duration-200 hover:bg-accent/80 focus:bg-accent focus:outline-none"
                    role="menuitem"
                  >
                    <User className="mr-2 h-4 w-4 transition-transform duration-200 hover:scale-110" aria-hidden="true" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  role="menuitem" 
                  className="transition-all duration-200 hover:bg-accent/80 focus:bg-accent cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4 transition-transform duration-200 hover:rotate-90" aria-hidden="true" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator role="separator" />
                <DropdownMenuItem 
                  onClick={() => {
                    handleLogout();
                    announceToScreenReader('Signing out...', 'polite');
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                  role="menuitem"
                >
                  <LogOut className="mr-2 h-4 w-4 transition-transform duration-200 hover:scale-110" aria-hidden="true" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}