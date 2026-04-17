import { NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getPfamClan } from '@/lib/queries';
import type { PfamClanRow } from '@/lib/types';

export async function GET() {
  try {
    const data = await cachedQuery<PfamClanRow[]>(
      rescueCache, 'pfam-clan-CL0204', CACHE_TTL.RESCUE,
      () => getPfamClan('CL0204')
    );
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.RESCUE}, stale-while-revalidate=60` } }
    );
  } catch (error) {
    console.error('Error fetching pfam-clan:', error);
    return NextResponse.json(
      { success: false, error: { code: 'PFAM_CLAN_ERROR', message: 'Failed to fetch Pfam clan data' } },
      { status: 500 }
    );
  }
}
