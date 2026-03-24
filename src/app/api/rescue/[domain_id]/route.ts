import { NextRequest, NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getRescueDetail } from '@/lib/queries';
import type { DomainDetail } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domain_id: string }> }
) {
  const { domain_id } = await params;

  try {
    const data = await cachedQuery<DomainDetail | null>(
      rescueCache,
      `detail-${domain_id}`,
      CACHE_TTL.DOMAIN,
      () => getRescueDetail(domain_id)
    );

    if (!data) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Domain ${domain_id} not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.DOMAIN}, stale-while-revalidate=3600`,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching domain detail:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch domain detail' } },
      { status: 500 }
    );
  }
}
