import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  label?: string;
}

const sizeMap = {
  small: "w-4 h-4 border-2",
  medium: "w-8 h-8 border-4",
  large: "w-12 h-12 border-8",
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  color = "border-blue-500",
  label,
}) => (
  <div
    className="flex flex-col items-center justify-center"
    role="status"
    aria-label={label || "Loading"}
  >
    <span
      className={`animate-spin rounded-full border-t-transparent ${sizeMap[size]} ${color}`}
      style={{ borderStyle: "solid", borderRadius: "50%" }}
    />
    {label && <span className="mt-2 text-xs text-gray-500">{label}</span>}
  </div>
);

export default LoadingSpinner;
