// components/QueryExpiryBanner.tsx
import { AlertTriangle, Clock, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';

interface QueryExpiryBannerProps {
  createdAt: string;
  className?: string;
}

export function QueryExpiryBanner({ createdAt, className = '' }: QueryExpiryBannerProps) {
  const created = new Date(createdAt);
  const expiry = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const hasExpired = daysLeft < 0;

  if (hasExpired) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <div>
          <AlertTitle>Query Window Expired</AlertTitle>
          <AlertDescription>
            Download the Excel report for detailed results.
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  if (daysLeft <= 2) {
    return (
      <Alert variant="destructive" className={className}>
        <Clock className="h-4 w-4" />
        <div>
          <AlertTitle>Only {daysLeft} days remaining!</AlertTitle>
          <AlertDescription>
            Query access expires {expiry.toLocaleDateString()}
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <Alert className={className}>
      <Info className="h-4 w-4" />
      <AlertDescription>
        {daysLeft} days remaining to query (expires {expiry.toLocaleDateString()})
      </AlertDescription>
    </Alert>
  );
}