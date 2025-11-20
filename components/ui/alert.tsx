import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = (variant?: string) => {
  const baseClasses = "relative w-full rounded-lg border p-4";
  
  const variantClasses: Record<string, string> = {
    default: "bg-white text-gray-950 border-gray-200",
    destructive: "border-red-500/50 text-red-600 bg-red-50",
    success: "border-green-500/50 text-green-600 bg-green-50",
    warning: "border-yellow-500/50 text-yellow-600 bg-yellow-50",
  };
  
  return cn(baseClasses, variantClasses[variant || "default"]);
};

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "success" | "warning";
  }
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants(variant), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

