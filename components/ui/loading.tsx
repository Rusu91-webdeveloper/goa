"use client";

import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function Loading({ size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 w-full">
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-violet-600 dark:text-violet-400`}
      />
      {text && <p className="mt-2 text-gray-600 dark:text-gray-300">{text}</p>}
    </div>
  );
}
