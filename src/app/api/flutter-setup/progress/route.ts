import { NextRequest, NextResponse } from 'next/server';
import { getGlobalProgress } from './progress-manager';

export async function GET(_request: NextRequest) {
  try {
    const globalProgress = getGlobalProgress();
    return NextResponse.json({
      steps: globalProgress.steps,
      isComplete: globalProgress.isComplete,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
