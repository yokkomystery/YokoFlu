import { NextResponse } from 'next/server';
import { getServerPlatformInfo } from '@/lib/platform-utils';

export async function GET() {
  try {
    const platformInfo = getServerPlatformInfo();

    return NextResponse.json(platformInfo);
  } catch (error) {
    console.error('[platform-info] ERROR:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
