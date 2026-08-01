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
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // checked: bright, clearly ON
      "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:shadow-[0_0_10px_2px_rgba(99,102,241,0.45)]",
      // unchecked: clearly grey track + border so you can SEE it's a control
      "data-[state=unchecked]:bg-zinc-400 data-[state=unchecked]:border-zinc-400 dark:data-[state=unchecked]:bg-zinc-600 dark:data-[state=unchecked]:border-zinc-500",
      className,
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 will-change-transform",
        "data-[state=unchecked]:translate-x-0.5",
        "data-[state=checked]:translate-x-[22px]",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = "Switch";
