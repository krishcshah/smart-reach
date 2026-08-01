import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary: "border-border/60 bg-secondary/70 text-secondary-foreground",
        success: "border-emerald-500/25 bg-emerald-500/12 text-emerald-400",
        warning: "border-amber-500/25 bg-amber-500/12 text-amber-400",
        destructive: "border-red-500/25 bg-red-500/12 text-red-400",
        info: "border-sky-500/25 bg-sky-500/12 text-sky-400",
        outline: "border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </div>
  );
}

/** Map domain statuses → badge variants, used across the whole app. */
export function statusVariant(status: string): BadgeProps["variant"] {
  switch (status) {
    case "active":
    case "running":
    case "sent":
    case "completed":
    case "ok":
      return "success";
    case "scheduled":
    case "queued":
    case "pending":
    case "processing":
      return "info";
    case "paused":
    case "draft":
    case "untested":
      return "secondary";
    case "replied":
      return "default";
    case "failed":
    case "bounced":
      return "destructive";
    case "archived":
    case "cancelled":
      return "outline";
    default:
      return "secondary";
  }
}
