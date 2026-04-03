import { NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getHeterodimers } from '@/lib/queries';
import type { HeterodimerRow } from '@/lib/types';

export async function GET() {
  try {
    const data = await cachedQuery<HeterodimerRow[]>(
      rescueCache, 'heterodimers', CACHE_TTL.RESCUE,
      () => getHeterodimers()
    );
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.RESCUE}, stale-while-revalidate=60` } }
    );
  } catch (error) {
    console.error('Error fetching heterodimers:', error);
    return NextResponse.json(
      { success: false, error: { code: 'HETERODIMER_ERROR', message: 'Failed to fetch heterodimers' } },
      { status: 500 }
    );
  }
}
