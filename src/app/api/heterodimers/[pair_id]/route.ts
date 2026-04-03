import { NextRequest, NextResponse } from 'next/server';
import { getHeterodimerHbonds } from '@/lib/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pair_id: string }> }
) {
  const { pair_id } = await params;
  const id = parseInt(pair_id);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ID', message: 'Invalid pair ID' } },
      { status: 400 }
    );
  }

  try {
    const data = await getHeterodimerHbonds(id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching heterodimer H-bonds:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch H-bonds' } },
      { status: 500 }
    );
  }
}
