import { NextRequest, NextResponse } from 'next/server';
import { rescueCache, CACHE_TTL, HTTP_CACHE_MAX_AGE, cachedQuery } from '@/lib/cache';
import { getRescueList, getRescueCount } from '@/lib/queries';
import type { RescueRow } from '@/lib/types';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get('page') || '1'));
  const sortBy = params.get('sortBy') || 'delta_mean_plddt';
  const sortDir = (params.get('sortDir') || 'desc') as 'asc' | 'desc';

  const filters = {
    rescue_class: params.get('rescue_class') || undefined,
    f_group: params.get('f_group') || undefined,
    organism: params.get('organism') || undefined,
    delta_min: params.get('delta_min') ? parseFloat(params.get('delta_min')!) : undefined,
    delta_max: params.get('delta_max') ? parseFloat(params.get('delta_max')!) : undefined,
    dsc: params.get('dsc') || undefined,
  };

  const cacheKey = `rescue-${JSON.stringify({ page, sortBy, sortDir, filters })}`;

  try {
    const [data, total] = await cachedQuery<[RescueRow[], number]>(
      rescueCache,
      cacheKey,
      CACHE_TTL.RESCUE,
      async () => {
        const [rows, count] = await Promise.all([
          getRescueList(page, filters, sortBy, sortDir),
          getRescueCount(filters),
        ]);
        return [rows, count];
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          rows: data,
          total,
          page,
          totalPages: Math.ceil(total / 25),
        },
      },
      {
        headers: {
          'Cache-Control': `public, max-age=${HTTP_CACHE_MAX_AGE.RESCUE}, stale-while-revalidate=60`,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching rescue list:', error);
    return NextResponse.json(
      { success: false, error: { code: 'RESCUE_LIST_ERROR', message: 'Failed to fetch rescue data' } },
      { status: 500 }
    );
  }
}
