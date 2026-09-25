import React from 'react';
import { Database, Server } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface LiveDataBadgeProps {
  isLive: boolean;
  className?: string;
  showIcon?: boolean;
}

/**
 * Universal indicator distinguishing live SAP HANA Cloud operational data from local demo fallback.
 * Live state:     LIVE — SAP HANA (Emerald badge with pulse)
 * Fallback state: DEMO FALLBACK (Amber badge with solid dot)
 */
export const LiveDataBadge: React.FC<LiveDataBadgeProps> = ({
  isLive,
  className = '',
  showIcon = true,
}) => {
  if (isLive) {
    return (
      <Badge
        variant="healthy"
        size="md"
        dot
        pulse
        icon={showIcon ? <Server className="w-3.5 h-3.5 text-emerald-700" /> : undefined}
        className={`font-mono text-xs font-bold tracking-tight ${className}`.trim()}
      >
        LIVE — SAP HANA
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      size="md"
      dot
      icon={showIcon ? <Database className="w-3.5 h-3.5 text-amber-700" /> : undefined}
      className={`font-mono text-xs font-bold tracking-tight ${className}`.trim()}
    >
      DEMO FALLBACK
    </Badge>
  );
};
