import { NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getPfamClanDisagreements } from '@/lib/queries';
import type { PfamClanDisagreement } from '@/lib/types';

export async function GET() {
  try {
    const data = await cachedQuery<PfamClanDisagreement[]>(
      rescueCache, 'pfam-clan-disagreements-CL0204', CACHE_TTL.RESCUE,
      () => getPfamClanDisagreements('CL0204')
    );
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.RESCUE}, stale-while-revalidate=60` } }
    );
  } catch (error) {
    console.error('Error fetching pfam-clan disagreements:', error);
    return NextResponse.json(
      { success: false, error: { code: 'PFAM_CLAN_DISAGREEMENT_ERROR', message: 'Failed to fetch disagreements' } },
      { status: 500 }
    );
  }
}
