import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        {
          "bg-background text-foreground": variant === "default",
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive":
            variant === "destructive",
          "border-blue-500/50 text-blue-500 dark:border-blue-500 [&>svg]:text-blue-500":
            variant === "info",
          "border-yellow-500/50 text-yellow-500 dark:border-yellow-500 [&>svg]:text-yellow-500":
            variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
