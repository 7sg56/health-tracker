'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Avatar, AvatarFallback } from './avatar';
import { LoadingButton } from './loading-button';
import { LoadingSpinner } from './loading-spinner';
import { Skeleton } from './skeleton';
import {
  createInteractiveElement,
  microInteractions,
  animationVariants,
  getStaggerDelay,
} from '@/lib/utils/animations';
import {
  Heart,
  Star,
  Zap,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface AnimationShowcaseProps {
  className?: string;
}

export function AnimationShowcase({ className }: AnimationShowcaseProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [loadingStates, setLoadingStates] = React.useState({
    button1: false,
    button2: false,
    button3: false,
  });

  const handleLoadingDemo = (buttonKey: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [buttonKey]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonKey]: false }));
    }, 2000);
  };

  const demoItems = [
    { id: 1, label: 'Water Intake', icon: '💧', value: '2.1L' },
    { id: 2, label: 'Calories', icon: '🍎', value: '1,450' },
    { id: 3, label: 'Exercise', icon: '🏃', value: '45min' },
    { id: 4, label: 'Sleep', icon: '😴', value: '7.5h' },
  ];

  return (
    <div className={cn('space-y-8 p-6', className)}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Animation Showcase</h2>
        <p className="text-muted-foreground">
          Demonstrating smooth animations and micro-interactions
        </p>
      </div>

      {/* Hover Effects Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            Hover Effects & Micro-interactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interactive Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium">Interactive Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button className={microInteractions.button}>Scale Effect</Button>
              <Button
                variant="outline"
                className={createInteractiveElement('', {
                  hover: 'lift',
                  focus: 'ring',
                  transition: 'normal',
                })}
              >
                Lift Effect
              </Button>
              <Button
                variant="secondary"
                className={createInteractiveElement('', {
                  hover: 'glow',
                  focus: 'ring',
                  transition: 'slow',
                })}
              >
                Glow Effect
              </Button>
            </div>
          </div>

          {/* Interactive Cards */}
          <div className="space-y-3">
            <h4 className="font-medium">Interactive Cards</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {demoItems.slice(0, 2).map((item, index) => (
                <Card
                  key={item.id}
                  className={cn(microInteractions.card, 'cursor-pointer')}
                  style={getStaggerDelay(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-muted-foreground text-sm">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Interactive Icons */}
          <div className="space-y-3">
            <h4 className="font-medium">Interactive Icons</h4>
            <div className="flex gap-4">
              <Heart
                className={cn('h-8 w-8 text-red-500', microInteractions.icon)}
              />
              <Star
                className={cn(
                  'h-8 w-8 text-yellow-500',
                  microInteractions.icon
                )}
              />
              <Zap
                className={cn('h-8 w-8 text-blue-500', microInteractions.icon)}
              />
            </div>
          </div>

          {/* Interactive Avatars */}
          <div className="space-y-3">
            <h4 className="font-medium">Interactive Avatars</h4>
            <div className="flex gap-3">
              {['JD', 'SM', 'AB'].map((initials, index) => (
                <Avatar
                  key={initials}
                  className={cn(microInteractions.avatar, 'cursor-pointer')}
                  style={getStaggerDelay(index, 100)}
                >
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading States Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Loading States & Animations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium">Loading Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <LoadingButton
                loading={loadingStates.button1}
                onClick={() => handleLoadingDemo('button1')}
                loadingText="Saving..."
              >
                Save Changes
              </LoadingButton>
              <LoadingButton
                variant="outline"
                loading={loadingStates.button2}
                onClick={() => handleLoadingDemo('button2')}
                loadingText="Processing..."
              >
                Process Data
              </LoadingButton>
              <LoadingButton
                variant="destructive"
                loading={loadingStates.button3}
                onClick={() => handleLoadingDemo('button3')}
                loadingText="Deleting..."
              >
                Delete Item
              </LoadingButton>
            </div>
          </div>

          {/* Skeleton Loaders */}
          <div className="space-y-3">
            <h4 className="font-medium">Skeleton Loaders</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" variant="wave" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" variant="shimmer" />
                  <Skeleton className="h-3 w-24" variant="shimmer" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" variant="wave" />
            </div>
          </div>

          {/* Loading Spinners */}
          <div className="space-y-3">
            <h4 className="font-medium">Loading Spinners</h4>
            <div className="flex items-center gap-4">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="default" />
              <LoadingSpinner size="lg" />
              <LoadingSpinner size="xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Transitions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="text-primary h-5 w-5" />
            Page Transitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isPlaying ? 'Pause' : 'Play'} Demo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 100);
                }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
            </div>

            {/* Demo transition elements */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {demoItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all duration-500 ease-out',
                    isPlaying
                      ? 'translate-y-0 scale-100 opacity-100'
                      : 'translate-y-4 scale-95 opacity-0'
                  )}
                  style={{
                    transitionDelay: isPlaying ? `${index * 150}ms` : '0ms',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.value}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Animations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-primary animate-bounce-gentle h-5 w-5" />
            Special Animations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div className="space-y-2">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Heart className="animate-pulse-health h-8 w-8 text-red-500" />
              </div>
              <p className="text-sm font-medium">Health Pulse</p>
            </div>

            <div className="space-y-2">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Star className="animate-wiggle h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-sm font-medium">Wiggle</p>
            </div>

            <div className="space-y-2">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Sparkles className="animate-bounce-gentle h-8 w-8 text-purple-500" />
              </div>
              <p className="text-sm font-medium">Gentle Bounce</p>
            </div>

            <div className="space-y-2">
              <div className="bg-primary/10 animate-scale-in mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm font-medium">Scale In</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
