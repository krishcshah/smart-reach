"use client";
import * as React from "react";
import { cn } from "./utils";

/**
 * Native, theme-independent switch. Its visual track/knob is plain CSS in
 * globals.css (.sr-switch), so it never depends on Tailwind utility generation.
 * Controlled or uncontrolled; preserves switch semantics (role, aria-checked).
 */
export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked: controlled, defaultChecked, onCheckedChange, disabled, id, name, className, ...rest },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked ?? false);
  const isControlled = controlled !== undefined;
  const checked = isControlled ? controlled : uncontrolled;

  const toggle = () => {
    if (disabled) return;
    const next = !checked;
   if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={rest["aria-label"] ?? "toggle"}
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      id={id}
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      className={cn("sr-switch", className)}
    >
      <span className="sr-switch-thumb" data-state={checked ? "checked" : "unchecked"} />
      {name != null && <input type="hidden" name={name} value={checked ? "on" : ""} />}
    </button>
  );
});
Switch.displayName = "Switch";
