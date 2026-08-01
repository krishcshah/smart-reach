import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import * as React from "react";
import { cn } from "./utils";

const alertVariants = cva("relative w-full rounded-xl border px-4 py-3 text-sm flex gap-3", {
  variants: {
    variant: {
      default: "border-border bg-card/80 text-foreground",
      info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
      success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      destructive: "border-red-500/30 bg-red-500/10 text-red-300",
    },
  },
  defaultVariants: { variant: "default" },
});

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: AlertCircle,
};

export function Alert({
  className,
  variant = "default",
  icon = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & { icon?: boolean }) {
  const Icon = icons[variant ?? "default"];
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {icon && <Icon className="size-4 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">{props.children}</div>
    </div>
  );
}
export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("font-medium leading-none mb-1", className)} {...props} />;
}
export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-[13px] opacity-90 leading-relaxed", className)} {...props} />;
}
