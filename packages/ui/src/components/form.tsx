import * as React from "react";
import { cn } from "../lib/utils";
import { Label } from "./label";

const FormFieldContext = React.createContext<{ id: string }>({ id: "" });

export function FormField({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  return (
    <FormFieldContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </FormFieldContext.Provider>
  );
}

export function FormLabel({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Label>) {
  const { id } = React.useContext(FormFieldContext);
  return (
    <Label htmlFor={id} className={className} {...props}>
      {children}
    </Label>
  );
}

export function FormControl({
  children,
  className,
}: {
  children: React.ReactElement<{ id?: string; className?: string }>;
  className?: string;
}) {
  const { id } = React.useContext(FormFieldContext);
  return React.cloneElement(children, {
    id,
    className: cn(children.props.className, className),
  });
}

export function FormMessage({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p className={cn("text-sm font-medium text-destructive", className)}>
      {children}
    </p>
  );
}

export function FormDescription({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}
