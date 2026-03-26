import { NextRequest, NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getHbonds } from '@/lib/queries';
import type { InterChainHbond } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domain_id: string }> }
) {
  const { domain_id } = await params;

  try {
    const data = await cachedQuery<InterChainHbond[]>(
      rescueCache,
      `hbonds-${domain_id}`,
      CACHE_TTL.DOMAIN,
      () => getHbonds(domain_id)
    );

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.DOMAIN}, stale-while-revalidate=3600`,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching H-bonds:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch H-bond data' } },
      { status: 500 }
    );
  }
}
