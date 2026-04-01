import { NextRequest, NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getFamilyDetail } from '@/lib/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fgroup: string }> }
) {
  const { fgroup } = await params;
  const decoded = decodeURIComponent(fgroup);

  try {
    const data = await cachedQuery(
      rescueCache,
      `family-${decoded}`,
      CACHE_TTL.RESCUE,
      () => getFamilyDetail(decoded)
    );

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.RESCUE}, stale-while-revalidate=60` } }
    );
  } catch (error) {
    console.error('Error fetching family detail:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FAMILY_ERROR', message: 'Failed to fetch family detail' } },
      { status: 500 }
    );
  }
}
