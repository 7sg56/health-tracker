"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { AriaAttributes, KeyboardKeys, isKeyPressed } from "@/lib/utils/accessibility"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-pressed'?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  disabled,
  children,
  onClick,
  onKeyDown,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-pressed': ariaPressed,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Handle space key for button activation (Enter is handled by default)
    if (isKeyPressed(event.nativeEvent, KeyboardKeys.SPACE) && !isDisabled) {
      event.preventDefault();
      (event.target as HTMLButtonElement).click();
    }
    onKeyDown?.(event);
  };

  const ariaAttributes = {
    ...AriaAttributes.disabled(isDisabled),
    ...(ariaLabel && AriaAttributes.label(ariaLabel)),
    ...(ariaDescribedBy && AriaAttributes.describedBy(ariaDescribedBy)),
    ...(ariaExpanded !== undefined && AriaAttributes.expanded(ariaExpanded)),
    ...(ariaControls && AriaAttributes.controls(ariaControls)),
    ...(ariaPressed !== undefined && { 'aria-pressed': ariaPressed }),
    ...(loading && AriaAttributes.busy(true)),
  };

  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2" aria-hidden="true">{icon}</span>
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2" aria-hidden="true">{icon}</span>
      )}
    </>
  );

  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        {...(onClick && { onClick: handleClick })}
        {...(onKeyDown && { onKeyDown: handleKeyDown })}
        {...ariaAttributes}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...ariaAttributes}
      {...props}
    >
      {content}
    </button>
  )
}

export { Button, buttonVariants }
