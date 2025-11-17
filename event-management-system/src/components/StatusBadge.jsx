import React from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

const StatusBadge = ({ status }) => {
  const configs = {
    complete: {
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
      label: "Complete",
    },
    incomplete: {
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-700",
      label: "Incomplete",
    },
    conflict: {
      icon: XCircle,
      color: "bg-red-100 text-red-700",
      label: "Conflict",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
