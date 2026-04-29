"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Minus } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  "peer relative inline-flex shrink-0 items-center justify-center rounded-md border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-accent data-[state=checked]:to-accent-cyan data-[state=checked]:text-white data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent/20 data-[state=indeterminate]:text-accent-strong",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-[18px] w-[18px]",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface CheckboxProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
      "onChange"
    >,
    VariantProps<typeof checkboxVariants> {
  /** Convenience handler mirroring native checkboxes. */
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(function Checkbox({ className, size, onCheckedChange, ...props }, ref) {
  const iconSize = size === "lg" ? 14 : size === "sm" ? 10 : 12;
  const isIndeterminate = props.checked === "indeterminate";
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      onCheckedChange={(state) => {
        if (onCheckedChange) onCheckedChange(state === true);
      }}
      className={cn(
        checkboxVariants({ size }),
        "border-border-strong bg-surface-2 hover:border-accent/50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {isIndeterminate ? (
          <Minus size={iconSize} strokeWidth={3} />
        ) : (
          <Check size={iconSize} strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = "Checkbox";
