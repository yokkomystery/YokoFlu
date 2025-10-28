'use client';

import { useEffect } from 'react';

interface ProgressApiData {
  steps?: Record<
    string,
    {
      status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
      message: string;
      details?: Record<string, unknown>;
    }
  >;
  isComplete?: boolean;
}

interface UseSetupProgressOptions {
  onUpdate: (data: ProgressApiData) => void;
  onComplete: () => void;
  intervalMs?: number;
}

export default function useSetupProgress(
  isSubmitting: boolean,
  { onUpdate, onComplete, intervalMs = 1000 }: UseSetupProgressOptions
) {
  useEffect(() => {
    if (!isSubmitting) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/flutter-setup/progress');
        if (!response.ok) return;
        const progressData: ProgressApiData = await response.json();
        onUpdate(progressData);
        if (progressData.isComplete) {
          clearInterval(interval);
          onComplete();
        }
      } catch (_) {
        // swallow polling errors; next tick will retry
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSubmitting, onUpdate, onComplete, intervalMs]);
}
