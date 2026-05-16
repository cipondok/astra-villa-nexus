import React from 'react';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { STATUS_CONFIG, type LegalRequestStatus } from './types';

interface LegalTimelineTrackerProps {
  currentStatus: LegalRequestStatus;
}

const STEPS: { status: LegalRequestStatus; label: string }[] = [
  { status: 'request_received', label: 'Diterima' },
  { status: 'document_review', label: 'Review Dokumen' },
  { status: 'fee_quotation', label: 'Penawaran Biaya' },
  { status: 'awaiting_payment', label: 'Pembayaran' },
  { status: 'processing', label: 'Diproses' },
  { status: 'completed', label: 'Selesai' },
];

export const LegalTimelineTracker: React.FC<LegalTimelineTrackerProps> = ({ currentStatus }) => {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
        <Circle className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">Permintaan Dibatalkan</span>
      </div>
    );
  }

  const currentStep = STATUS_CONFIG[currentStatus]?.step ?? 0;

  return (
    <div className="space-y-1">
      {STEPS.map((step, idx) => {
        const stepNum = STATUS_CONFIG[step.status]?.step ?? idx;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isPending = stepNum > currentStep;

        return (
          <div key={step.status} className="flex items-start gap-3">
            {/* Line + Icon */}
            <div className="flex flex-col items-center">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-chart-2 flex-shrink-0" />
              ) : isCurrent ? (
                <Clock className="h-5 w-5 text-primary animate-pulse flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
              )}
              {idx < STEPS.length - 1 && (
                <div className={`w-0.5 h-6 mt-0.5 ${isCompleted ? 'bg-chart-2/50' : 'bg-border'}`} />
              )}
            </div>
            {/* Label */}
            <div className="-mt-0.5">
              <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
