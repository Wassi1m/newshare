import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const Spinner: React.FC<SpinnerProps> = ({ size = "md", className, ...props }) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-blue-600 border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
};

export { Spinner };

