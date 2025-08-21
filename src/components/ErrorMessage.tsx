import React, { useState } from "react";

interface ErrorMessageProps {
  message: string;
  type?: "network" | "audio" | "general";
  severity?: "warning" | "error" | "critical";
  onRetry?: () => void;
  onClose?: () => void;
  autoDismiss?: number; // ms
}

const iconMap = {
  network: "🌐",
  audio: "🔊",
  general: "⚠️",
};
const colorMap = {
  warning: "bg-yellow-100 border-yellow-400 text-yellow-800",
  error: "bg-red-100 border-red-400 text-red-800",
  critical: "bg-red-200 border-red-600 text-red-900",
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = "general",
  severity = "error",
  onRetry,
  onClose,
  autoDismiss,
}) => {
  const [visible, setVisible] = useState(true);
  React.useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose]);
  if (!visible) return null;
  return (
    <div
      className={`flex items-center gap-3 p-3 border rounded-lg shadow-md animate-slide-in ${colorMap[severity]}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="text-2xl">{iconMap[type]}</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onRetry && (
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
      {onClose && (
        <button
          className="ml-2 px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          onClick={() => {
            setVisible(false);
            onClose();
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
