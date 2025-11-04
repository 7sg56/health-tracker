'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, User, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export function Header({
  onMenuClick,
  showMenuButton = true,
  className,
}: HeaderProps) {
  const [userName, setUserName] = useState('Test User');

  // Load user data from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('ht_name');
    if (storedName) setUserName(storedName);

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ht_name' && e.newValue) {
        setUserName(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same window
    const handleCustomStorageChange = () => {
      const name = localStorage.getItem('ht_name');
      if (name) setUserName(name);
    };

    window.addEventListener('profileUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleCustomStorageChange);
    };
  }, []);

  const user = {
    name: userName,
    email: 'test@example.com',
    avatar: null,
  };

  return (
    <header
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border fixed top-0 right-0 left-0 z-50 border-b backdrop-blur',
        className
      )}
      role="banner"
    >
      <div className="flex h-14 items-center px-3 sm:h-16 sm:px-4 lg:px-6">
        {/* Mobile menu button */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 h-9 w-9 sm:h-10 sm:w-10 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            aria-expanded={false}
            aria-controls="navigation"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </Button>
        )}

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center space-x-2"
          aria-label="HealthTracker home"
        >
          <Activity
            className="text-primary h-5 w-5 sm:h-6 sm:w-6"
            aria-hidden="true"
          />
          <span className="xs:inline hidden text-base font-bold sm:text-lg">
            HealthTracker
          </span>
          <span className="xs:hidden text-base font-bold sm:text-lg">HT</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full sm:h-9 sm:w-9"
              aria-label={`User menu for ${user.name}`}
            >
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage
                  src={user.avatar || undefined}
                  alt={`${user.name}'s avatar`}
                />
                <AvatarFallback className="text-xs sm:text-sm">
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
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
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="truncate text-sm leading-none font-medium">
                  {user.name}
                </p>
                <p className="text-muted-foreground truncate text-xs leading-none">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/profile"
                className="cursor-pointer"
                role="menuitem"
              >
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem role="menuitem">
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
