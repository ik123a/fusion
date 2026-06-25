"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { track: "h-4 w-7", thumb: "h-3 w-3", translate: "translate-x-3" },
  md: { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" },
  lg: { track: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5" },
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, size = "md", disabled, ...props }, ref) => {
    const config = sizeConfig[size];

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-primary shadow-[0_0_12px_hsl(238_83%_67%/0.3)]"
            : "bg-secondary",
          config.track,
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
            checked ? config.translate : "translate-x-0",
            config.thumb
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
