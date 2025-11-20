import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = (variant?: string) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses: Record<string, string> = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-200 text-gray-900 hover:bg-gray-300",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-gray-900 border-gray-300",
    success: "border-transparent bg-green-600 text-white hover:bg-green-700",
    warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
  };
  
  return cn(baseClasses, variantClasses[variant || "default"]);
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants(variant), className)} {...props} />
  );
}

export { Badge, badgeVariants };

