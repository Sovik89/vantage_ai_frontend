// components/JobStatusBadge.tsx
import { Badge } from '@/components/Badge';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface JobStatusBadgeProps {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  showIcon?: boolean;
}

export function JobStatusBadge({ status, showIcon = true }: JobStatusBadgeProps) {
  const configs = {
    PROCESSING: {
      variant: 'secondary' as const,
      icon: Loader2,
      iconClass: 'animate-spin',
    },
    COMPLETED: {
      variant: 'default' as const,
      icon: CheckCircle2,
      iconClass: '',
    },
    FAILED: {
      variant: 'destructive' as const,
      icon: XCircle,
      iconClass: '',
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5">
      {showIcon && <Icon className={`h-3.5 w-3.5 ${config.iconClass}`} />}
      <span>{status}</span>
    </Badge>
  );
}