import { NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getFamilies } from '@/lib/queries';
import type { FamilyRow } from '@/lib/types';

export async function GET() {
  try {
    const data = await cachedQuery<FamilyRow[]>(
      rescueCache,
      'families',
      CACHE_TTL.RESCUE,
      () => getFamilies()
    );

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.RESCUE}, stale-while-revalidate=60` } }
    );
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FAMILIES_ERROR', message: 'Failed to fetch families' } },
      { status: 500 }
    );
  }
}
