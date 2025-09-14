import * as React from "react";
import { cn } from "./utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label
        className={cn(
          "peer inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-all outline-none focus-within:ring-[3px] focus-within:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          "has-[:checked]:bg-primary has-[:not(:checked)]:bg-input",
          className,
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <div
          data-slot="switch-thumb"
          className={cn(
            "pointer-events-none block size-4 rounded-full bg-card ring-0 transition-transform",
            "peer-checked:translate-x-[calc(100%-2px)] peer-not-checked:translate-x-0"
          )}
        />
      </label>
    );
  }
)
Switch.displayName = "Switch"

export { Switch }