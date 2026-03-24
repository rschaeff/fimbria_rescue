import { NextResponse } from 'next/server';
import { statsCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getStats } from '@/lib/queries';
import type { StatsData } from '@/lib/types';

export async function GET() {
  try {
    const data = await cachedQuery<StatsData>(
      statsCache,
      'stats',
      CACHE_TTL.STATS,
      () => getStats()
    );

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.STATS}, stale-while-revalidate=60`,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: { code: 'STATS_ERROR', message: 'Failed to fetch stats' } },
      { status: 500 }
    );
  }
}
