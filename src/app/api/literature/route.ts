import { NextResponse } from 'next/server';
import { literatureCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getLiterature } from '@/lib/queries';
import type { LiteratureEntry } from '@/lib/types';

export async function GET() {
  try {
    const data = await cachedQuery<LiteratureEntry[]>(
      literatureCache,
      'literature',
      CACHE_TTL.LITERATURE,
      () => getLiterature()
    );

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.LITERATURE}, stale-while-revalidate=60`,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching literature:', error);
    return NextResponse.json(
      { success: false, error: { code: 'LITERATURE_ERROR', message: 'Failed to fetch literature' } },
      { status: 500 }
    );
  }
}
