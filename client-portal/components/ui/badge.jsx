import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80":
              variant === "default",
            "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80":
              variant === "secondary",
            "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80":
              variant === "destructive",
            "border-transparent bg-outline text-foreground shadow hover:bg-accent hover:text-accent-foreground":
              variant === "outline",
            "border-transparent bg-success text-success-foreground shadow hover:bg-success/80":
              variant === "success",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
