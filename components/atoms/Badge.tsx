interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info" | "default";
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const variantStyles = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    default: "bg-slate-100 text-slate-800",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "confirmed" | "completed";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusMap = {
    active: { label: "Actif", variant: "success" as const },
    inactive: { label: "Inactif", variant: "error" as const },
    pending: { label: "En attente", variant: "warning" as const },
    confirmed: { label: "Confirmée", variant: "success" as const },
    completed: { label: "Complétée", variant: "info" as const },
  };

  const config = statusMap[status];
  return <Badge label={config.label} variant={config.variant} />;
}
