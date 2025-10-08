"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, User, Settings, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export function Header({ 
  onMenuClick, 
  showMenuButton = true, 
  className 
}: HeaderProps) {
  // Mock user data - this will be replaced with actual auth context
  const user = {
    name: "Sourish Ghosh",
    email: "sourish@example.com",
    avatar: null,
  };


  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border",
        className
      )}
      role="banner"
    >
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4 lg:px-6">
        {/* Mobile menu button */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-2 h-9 w-9 sm:h-10 sm:w-10"
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
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
          <span className="font-bold text-base sm:text-lg hidden xs:inline">HealthTracker</span>
          <span className="font-bold text-base sm:text-lg xs:hidden">HT</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full"
              aria-label={`User menu for ${user.name}`}
            >
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={user.avatar || undefined} alt={`${user.name}'s avatar`} />
                <AvatarFallback className="text-xs sm:text-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
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
                <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
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