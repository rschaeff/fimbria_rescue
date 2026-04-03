import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { queryOne } from '@/lib/db';

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
    const pred = await queryOne<{ model_cif_path: string; pair_name: string }>(
      'SELECT model_cif_path, pair_name FROM fimbria.heterodimer_predictions WHERE id = $1',
      [id]
    );

    if (!pred || !pred.model_cif_path) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Structure not found' } },
        { status: 404 }
      );
    }

    const data = await readFile(pred.model_cif_path, 'utf-8');

    return new NextResponse(data, {
      headers: {
        'Content-Type': 'chemical/x-cif',
        'Content-Disposition': `attachment; filename="${pred.pair_name}.cif"`,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error serving heterodimer structure:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to serve structure file' } },
      { status: 500 }
    );
  }
}
