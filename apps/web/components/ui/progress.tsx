"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "gradient" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const variantStyles = {
  default: "bg-primary",
  gradient: "bg-gradient-to-r from-[hsl(238,83%,67%)] via-[hsl(270,76%,60%)] to-[hsl(190,90%,50%)]",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "default", size = "md", showLabel = false, animated = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className={cn("flex items-center gap-3", className)} {...props}>
        <div
          ref={ref}
          className={cn("relative w-full overflow-hidden rounded-full bg-secondary", sizeStyles[size])}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              variantStyles[variant],
              animated && "animate-shimmer"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums min-w-[3ch]">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
