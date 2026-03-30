import { query, queryOne, escapeLike } from './db';
import type {
  RescueRow,
  DomainDetail,
  ResiduePlddt,
  LiteratureEntry,
  StatsData,
  SequenceData,
  StructurePath,
  Target,
  RescueAnalysis,
  Prediction,
  StrandExchange,
  InterChainHbond,
  DomainCompleteness,
  ProteinDomainComparison,
  ProteinInfo,
} from './types';

export async function getStats(): Promise<StatsData> {
  const [targets, predictions, completed, rescueClasses, dscCount, reciprocalCount, completenessClasses] = await Promise.all([
    queryOne<{ count: string }>('SELECT COUNT(*)::text as count FROM fimbria.targets'),
    queryOne<{ count: string }>('SELECT COUNT(*)::text as count FROM fimbria.predictions'),
    queryOne<{ count: string }>('SELECT COUNT(*)::text as count FROM fimbria.predictions WHERE completed = true'),
    query<{ rescue_class: string; count: string }>(
      'SELECT rescue_class, COUNT(*)::text as count FROM fimbria.rescue_analysis GROUP BY rescue_class'
    ),
    queryOne<{ count: string }>('SELECT COUNT(*)::text as count FROM fimbria.strand_exchange WHERE has_nte_to_body_dsc = true'),
    queryOne<{ count: string }>('SELECT COUNT(*)::text as count FROM fimbria.strand_exchange WHERE has_cterm_reciprocal = true'),
    query<{ completeness: string; count: string }>(
      'SELECT completeness, COUNT(*)::text as count FROM fimbria.domain_completeness GROUP BY completeness'
    ),
  ]);

  return {
    total_targets: parseInt(targets?.count || '0'),
    total_predictions: parseInt(predictions?.count || '0'),
    completed_predictions: parseInt(completed?.count || '0'),
    rescue_classes: rescueClasses.map((r) => ({
      rescue_class: r.rescue_class,
      count: parseInt(r.count),
    })),
    dsc_count: parseInt(dscCount?.count || '0'),
    reciprocal_count: parseInt(reciprocalCount?.count || '0'),
    completeness_classes: completenessClasses.map((c) => ({
      completeness: c.completeness,
      count: parseInt(c.count),
    })),
  };
}

interface RescueFilters {
  rescue_class?: string;
  completeness?: string;
  f_group?: string;
  organism?: string;
  delta_min?: number;
  delta_max?: number;
  dsc?: string;
}

function buildRescueWhere(
  filters: RescueFilters,
  params: (string | number | boolean | null)[]
): string {
  const conditions: string[] = ["r.seq_type = 'domain'"];

  if (filters.rescue_class) {
    params.push(filters.rescue_class);
    conditions.push(`r.rescue_class = $${params.length}`);
  }
  if (filters.f_group) {
    params.push(`%${escapeLike(filters.f_group)}%`);
    conditions.push(`t.f_group ILIKE $${params.length}`);
  }
  if (filters.organism) {
    params.push(`%${escapeLike(filters.organism)}%`);
    conditions.push(`t.organism ILIKE $${params.length}`);
  }
  if (filters.delta_min != null) {
    params.push(filters.delta_min);
    conditions.push(`r.delta_mean_plddt >= $${params.length}`);
  }
  if (filters.delta_max != null) {
    params.push(filters.delta_max);
    conditions.push(`r.delta_mean_plddt <= $${params.length}`);
  }
  if (filters.completeness) {
    params.push(filters.completeness);
    conditions.push(`dc.completeness = $${params.length}`);
  }
  if (filters.dsc === 'yes') {
    conditions.push('se.has_nte_to_body_dsc = true');
  } else if (filters.dsc === 'no') {
    conditions.push('(se.has_nte_to_body_dsc = false OR se.has_nte_to_body_dsc IS NULL)');
  }

  return conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
}

const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  domain_id: 't.domain_id',
  organism: 't.organism',
  f_group: 't.f_group',
  mono_mean_plddt: 'r.mono_mean_plddt',
  dimer_mean_plddt: 'r.dimer_mean_plddt',
  delta_mean_plddt: 'r.delta_mean_plddt',
  rescued_residues: 'r.rescued_residues',
  rescue_class: 'r.rescue_class',
  iptm: 'p.iptm',
  inter_chain_pae: 'p.inter_chain_pae',
  has_nte_to_body_dsc: 'se.has_nte_to_body_dsc',
  nte_to_body_hbonds: 'se.nte_to_body_hbonds',
  total_inter_hbonds: 'se.total_inter_hbonds',
  completeness: 'dc.completeness',
};

export async function getRescueList(
  page: number = 1,
  filters: RescueFilters = {},
  sortBy: string = 'delta_mean_plddt',
  sortDir: 'asc' | 'desc' = 'desc'
): Promise<RescueRow[]> {
  const limit = 25;
  const offset = (page - 1) * limit;
  const params: (string | number | boolean | null)[] = [];
  const where = buildRescueWhere(filters, params);

  const sortColumn = ALLOWED_SORT_COLUMNS[sortBy] || 'r.delta_mean_plddt';
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  return query<RescueRow>(
    `SELECT t.domain_id, t.organism, t.f_group, t.pfam_acc, t.pfam_id, t.domain_length,
            r.mono_mean_plddt, r.dimer_mean_plddt, r.delta_mean_plddt,
            r.rescued_residues, r.rescue_class,
            p.iptm, p.inter_chain_pae,
            se.has_nte_to_body_dsc, se.nte_to_body_hbonds,
            se.has_cterm_reciprocal, se.total_inter_hbonds,
            dc.completeness, dc.complete_range, dc.donor_strand_range
     FROM fimbria.targets t
     JOIN fimbria.rescue_analysis r ON t.id = r.target_id
     JOIN fimbria.predictions p ON r.dimer_prediction_id = p.id
     LEFT JOIN fimbria.strand_exchange se ON se.prediction_id = p.id
     LEFT JOIN fimbria.domain_completeness dc ON dc.target_id = t.id
     ${where}
     ORDER BY ${sortColumn} ${dir}
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );
}

export async function getRescueAll(
  filters: RescueFilters = {},
  sortBy: string = 'delta_mean_plddt',
  sortDir: 'asc' | 'desc' = 'desc'
): Promise<RescueRow[]> {
  const params: (string | number | boolean | null)[] = [];
  const where = buildRescueWhere(filters, params);
  const sortColumn = ALLOWED_SORT_COLUMNS[sortBy] || 'r.delta_mean_plddt';
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';

  return query<RescueRow>(
    `SELECT t.domain_id, t.organism, t.f_group, t.pfam_acc, t.pfam_id, t.domain_length,
            r.mono_mean_plddt, r.dimer_mean_plddt, r.delta_mean_plddt,
            r.rescued_residues, r.rescue_class,
            p.iptm, p.inter_chain_pae,
            se.has_nte_to_body_dsc, se.nte_to_body_hbonds,
            se.has_cterm_reciprocal, se.total_inter_hbonds,
            dc.completeness, dc.complete_range, dc.donor_strand_range
     FROM fimbria.targets t
     JOIN fimbria.rescue_analysis r ON t.id = r.target_id
     JOIN fimbria.predictions p ON r.dimer_prediction_id = p.id
     LEFT JOIN fimbria.strand_exchange se ON se.prediction_id = p.id
     LEFT JOIN fimbria.domain_completeness dc ON dc.target_id = t.id
     ${where}
     ORDER BY ${sortColumn} ${dir}`,
    params
  );
}

export async function getRescueCount(filters: RescueFilters = {}): Promise<number> {
  const params: (string | number | boolean | null)[] = [];
  const where = buildRescueWhere(filters, params);

  const result = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count
     FROM fimbria.targets t
     JOIN fimbria.rescue_analysis r ON t.id = r.target_id
     JOIN fimbria.predictions p ON r.dimer_prediction_id = p.id
     LEFT JOIN fimbria.strand_exchange se ON se.prediction_id = p.id
     LEFT JOIN fimbria.domain_completeness dc ON dc.target_id = t.id
     ${where}`,
    params
  );

  return parseInt(result?.count || '0');
}

export async function getRescueDetail(domainId: string): Promise<DomainDetail | null> {
  const target = await queryOne<Target>(
    'SELECT * FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );

  if (!target) return null;

  const rescue = await queryOne<RescueAnalysis>(
    "SELECT * FROM fimbria.rescue_analysis WHERE target_id = $1 AND seq_type = 'domain'",
    [target.id]
  );

  if (!rescue) return null;

  const [monomer, dimer] = await Promise.all([
    queryOne<Prediction>(
      'SELECT * FROM fimbria.predictions WHERE id = $1',
      [rescue.monomer_prediction_id]
    ),
    queryOne<Prediction>(
      'SELECT * FROM fimbria.predictions WHERE id = $1',
      [rescue.dimer_prediction_id]
    ),
  ]);

  if (!monomer || !dimer) return null;

  return { target, rescue, monomer, dimer };
}

export async function getResiduePlddts(
  domainId: string
): Promise<{ monomer: ResiduePlddt[]; dimer: ResiduePlddt[] }> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );

  if (!target) return { monomer: [], dimer: [] };

  const rows = await query<{ residue_index: number; plddt: number; mode: string }>(
    `SELECT rp.residue_index, rp.plddt, p.mode
     FROM fimbria.residue_plddts rp
     JOIN fimbria.predictions p ON rp.prediction_id = p.id
     WHERE p.target_id = $1 AND rp.chain = 'A'
     ORDER BY p.mode, rp.residue_index`,
    [target.id]
  );

  const monomer: ResiduePlddt[] = [];
  const dimer: ResiduePlddt[] = [];

  for (const row of rows) {
    const entry = { residue_index: row.residue_index, plddt: row.plddt };
    if (row.mode === 'monomer_domain') {
      monomer.push(entry);
    } else if (row.mode === 'dimer_domain') {
      dimer.push(entry);
    }
  }

  return { monomer, dimer };
}

export async function getSequences(domainId: string): Promise<SequenceData[]> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );

  if (!target) return [];

  return query<SequenceData>(
    'SELECT seq_type, sequence, sequence_length FROM fimbria.sequences WHERE target_id = $1',
    [target.id]
  );
}

export async function getStructurePaths(domainId: string): Promise<StructurePath[]> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );

  if (!target) return [];

  return query<StructurePath>(
    `SELECT s.file_path, s.structure_type, p.mode
     FROM fimbria.structures s
     JOIN fimbria.predictions p ON s.prediction_id = p.id
     WHERE p.target_id = $1`,
    [target.id]
  );
}

export async function getStrandExchange(domainId: string): Promise<StrandExchange | null> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );

  if (!target) return null;

  return queryOne<StrandExchange>(
    `SELECT se.*
     FROM fimbria.strand_exchange se
     JOIN fimbria.predictions p ON se.prediction_id = p.id
     WHERE p.target_id = $1 AND p.mode = 'dimer_domain'`,
    [target.id]
  );
}

export async function getHbonds(domainId: string): Promise<InterChainHbond[]> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );

  if (!target) return [];

  return query<InterChainHbond>(
    `SELECT h.donor_chain, h.donor_res, h.donor_name,
            h.acceptor_chain, h.acceptor_res, h.acceptor_name,
            h.no_distance, h.co_n_angle
     FROM fimbria.inter_chain_hbonds h
     JOIN fimbria.predictions p ON h.prediction_id = p.id
     WHERE p.target_id = $1 AND p.mode = 'dimer_domain'
     ORDER BY h.donor_chain, h.donor_res`,
    [target.id]
  );
}

export async function getProteinComparison(domainId: string): Promise<{
  comparison: ProteinDomainComparison;
  protein: ProteinInfo;
  proteinPlddts: { monomer: ResiduePlddt[]; dimer: ResiduePlddt[] };
} | null> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );

  if (!target) return null;

  const comparison = await queryOne<ProteinDomainComparison>(
    'SELECT * FROM fimbria.protein_domain_comparison WHERE target_id = $1',
    [target.id]
  );

  if (!comparison) return null;

  const protein = await queryOne<ProteinInfo>(
    'SELECT * FROM fimbria.proteins WHERE id = $1',
    [comparison.protein_id]
  );

  if (!protein) return null;

  // Get protein-level pLDDTs using prediction IDs from comparison
  let proteinPlddts: { monomer: ResiduePlddt[]; dimer: ResiduePlddt[] } = { monomer: [], dimer: [] };

  const fetchPlddt = async (predId: number | null, mode: string) => {
    if (!predId) return [];
    return query<ResiduePlddt>(
      `SELECT rp.residue_index, rp.plddt
       FROM fimbria.residue_plddts rp
       WHERE rp.prediction_id = $1 AND rp.chain = 'A'
       ORDER BY rp.residue_index`,
      [predId]
    );
  };

  const [monoPlddts, dimerPlddts] = await Promise.all([
    fetchPlddt(comparison.monomer_protein_pred_id, 'monomer_protein'),
    fetchPlddt(comparison.dimer_protein_pred_id, 'dimer_protein'),
  ]);
  proteinPlddts = { monomer: monoPlddts, dimer: dimerPlddts };

  return { comparison, protein, proteinPlddts };
}

export async function getDomainCompleteness(domainId: string): Promise<DomainCompleteness | null> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );

  if (!target) return null;

  return queryOne<DomainCompleteness>(
    'SELECT * FROM fimbria.domain_completeness WHERE target_id = $1',
    [target.id]
  );
}

export async function getLiterature(): Promise<LiteratureEntry[]> {
  return query<LiteratureEntry>(
    'SELECT * FROM fimbria.literature ORDER BY year DESC, title'
  );
}
