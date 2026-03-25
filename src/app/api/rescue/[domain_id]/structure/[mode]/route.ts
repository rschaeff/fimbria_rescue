import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { getStructurePaths } from '@/lib/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domain_id: string; mode: string }> }
) {
  const { domain_id, mode } = await params;

  try {
    const structures = await getStructurePaths(domain_id);
    const structure = structures.find((s) => s.mode === mode);

    if (!structure) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Structure not found' } },
        { status: 404 }
      );
    }

    const data = await readFile(structure.file_path, 'utf-8');
    const download = _request.nextUrl.searchParams.has('download');

    const headers: Record<string, string> = {
      'Content-Type': 'chemical/x-cif',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    };

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${domain_id}_${mode}.cif"`;
    }

    return new NextResponse(data, { headers });
  } catch (error) {
    console.error('Error serving structure:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to serve structure file' } },
      { status: 500 }
    );
  }
}
