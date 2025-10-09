import { cn } from '@/lib/utils';

interface SkeletonProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'shimmer' | 'wave';
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variantClasses = {
    default: 'bg-muted animate-pulse',
    shimmer:
      'bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-skeleton-wave',
    wave: 'bg-muted relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-skeleton-wave before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
  };

  return (
    <div
      data-slot="skeleton"
      className={cn('rounded-md', variantClasses[variant], className)}
      {...props}
    />
  );
}

export { Skeleton };
