"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  description?: string;
}

export function FormField({
  label,
  error,
  required,
  className,
  children,
  description,
}: FormFieldProps) {
  const fieldId = React.useId();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement<any>, {
          id: fieldId,
          "aria-describedby": description ? `${fieldId}-description` : undefined,
          "aria-invalid": !!error,
          className: cn(
            (children as React.ReactElement<any>).props?.className,
            error && "border-destructive focus-visible:ring-destructive"
          ),
        })}
      </div>
      {description && (
        <p id={`${fieldId}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Specialized form field components
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  containerClassName?: string;
}

export function InputField({
  label,
  error,
  description,
  required,
  containerClassName,
  className,
  ...props
}: InputFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
      className={containerClassName}
    >
      <Input className={className} {...props} />
    </FormField>
  );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  containerClassName?: string;
}

export function TextareaField({
  label,
  error,
  description,
  required,
  containerClassName,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
      className={containerClassName}
    >
      <Textarea className={className} {...props} />
    </FormField>
  );
}

interface SelectFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  containerClassName?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function SelectField({
  label,
  error,
  description,
  required,
  containerClassName,
  placeholder,
  value,
  onValueChange,
  children,
}: SelectFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
      className={containerClassName}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </FormField>
  );
}