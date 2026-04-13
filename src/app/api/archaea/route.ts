import { NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getArchaeaDomains } from '@/lib/queries';
import type { RescueRow } from '@/lib/types';

export async function GET() {
  try {
    const data = await cachedQuery<RescueRow[]>(
      rescueCache, 'archaea', CACHE_TTL.RESCUE,
      () => getArchaeaDomains()
    );
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.RESCUE}, stale-while-revalidate=60` } }
    );
  } catch (error) {
    console.error('Error fetching archaea:', error);
    return NextResponse.json(
      { success: false, error: { code: 'ARCHAEA_ERROR', message: 'Failed to fetch archaeal domains' } },
      { status: 500 }
    );
  }
}
