import { NextRequest, NextResponse } from 'next/server';
import { getRescueAll } from '@/lib/queries';

const CSV_COLUMNS = [
  'domain_id', 'organism', 'f_group', 'pfam_acc', 'pfam_id', 'domain_length',
  'mono_mean_plddt', 'dimer_mean_plddt', 'delta_mean_plddt',
  'rescued_residues', 'rescue_class',
  'iptm', 'inter_chain_pae',
  'has_nte_to_body_dsc', 'nte_to_body_hbonds',
  'has_cterm_reciprocal', 'total_inter_hbonds',
  'completeness', 'complete_range', 'donor_strand_range',
];

function escapeCSV(val: unknown): string {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sortBy = params.get('sortBy') || 'delta_mean_plddt';
  const sortDir = (params.get('sortDir') || 'desc') as 'asc' | 'desc';

  const filters = {
    rescue_class: params.get('rescue_class') || undefined,
    completeness: params.get('completeness') || undefined,
    f_group: params.get('f_group') || undefined,
    organism: params.get('organism') || undefined,
    delta_min: params.get('delta_min') ? parseFloat(params.get('delta_min')!) : undefined,
    delta_max: params.get('delta_max') ? parseFloat(params.get('delta_max')!) : undefined,
    dsc: params.get('dsc') || undefined,
  };

  try {
    const rows = await getRescueAll(filters, sortBy, sortDir);

    const header = CSV_COLUMNS.join(',');
    const body = rows.map((row) =>
      CSV_COLUMNS.map((col) => escapeCSV((row as unknown as Record<string, unknown>)[col])).join(',')
    ).join('\n');

    const csv = header + '\n' + body;
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="fimbria_rescue_${date}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting rescue data:', error);
    return NextResponse.json(
      { success: false, error: { code: 'EXPORT_ERROR', message: 'Failed to export data' } },
      { status: 500 }
    );
  }
}
