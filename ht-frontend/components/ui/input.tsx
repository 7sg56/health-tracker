import * as React from 'react';

import { cn } from '@/lib/utils';
import { AriaAttributes } from '@/lib/utils/accessibility';

interface InputProps extends React.ComponentProps<'input'> {
  error?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      helperText,
      label,
      required = false,
      id,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const reactId = React.useId();
    const inputId = id || reactId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    const describedByIds = [ariaDescribedBy, errorId, helperTextId].filter(
      Boolean
    );

    const ariaAttributes = {
      ...AriaAttributes.invalid(!!error || !!ariaInvalid),
      ...AriaAttributes.required(required),
      ...(describedByIds.length > 0 &&
        AriaAttributes.describedBy(describedByIds.join(' '))),
      ...(ariaLabel && AriaAttributes.label(ariaLabel)),
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required &&
                "after:text-destructive after:ml-0.5 after:content-['*']"
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          data-slot="input"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            error && 'border-destructive ring-destructive/20',
            className
          )}
          {...ariaAttributes}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="text-destructive text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperTextId} className="text-muted-foreground text-sm">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
