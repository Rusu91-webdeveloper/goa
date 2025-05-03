import React from "react";

type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
}

export default function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`border-t-transparent border-solid animate-spin rounded-full border-blue-400 border-2 ${sizeClasses[size]}`}></div>
    </div>
  );
}
