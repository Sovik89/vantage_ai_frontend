// components/DownloadReportButton.tsx
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/Button'

interface DownloadReportButtonProps {
  reportUrl?: string;
  filename?: string;
  className?: string;
}

export function DownloadReportButton({ 
  reportUrl, 
  filename = 'report.xlsx',
  className = ''
}: DownloadReportButtonProps) {
  if (!reportUrl) {
    return (
      <Button variant="outline" disabled className={className}>
        <Download className="mr-2 h-4 w-4" />
        Report Not Available
      </Button>
    );
  }

  return (
    <a 
      href={reportUrl} 
      download={filename} 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <Button variant="outline" className={className}>
        <Download className="mr-2 h-4 w-4" />
        Download Excel Report
        <ExternalLink className="ml-2 h-3 w-3" />
      </Button>
    </a>
  );
}