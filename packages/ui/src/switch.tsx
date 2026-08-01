"use client";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "./utils";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // unchecked: clearly grey/dim; checked: clearly filled
      "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:shadow-[0_0_0_3px_hsl(var(--primary)/0.25)]",
      "data-[state=unchecked]:bg-input data-[state=unchecked]:border-border/80",
      className,
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-4 rounded-full bg-background shadow-md ring-0 transition-transform",
        "data-[state=checked]:translate-x-4 data-[state=checked]:bg-primary-foreground",
        "data-[state=unchecked]:translate-x-0.5",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = "Switch";
