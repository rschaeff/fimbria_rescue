import { NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getArchaeaHeterodimers } from '@/lib/queries';
import type { HeterodimerRow } from '@/lib/types';

export async function GET() {
  try {
    const data = await cachedQuery<HeterodimerRow[]>(
      rescueCache, 'archaea-heterodimers', CACHE_TTL.RESCUE,
      () => getArchaeaHeterodimers()
    );
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.RESCUE}, stale-while-revalidate=60` } }
    );
  } catch (error) {
    console.error('Error fetching archaea heterodimers:', error);
    return NextResponse.json(
      { success: false, error: { code: 'ARCHAEA_HETERO_ERROR', message: 'Failed to fetch archaeal heterodimers' } },
      { status: 500 }
    );
  }
}
