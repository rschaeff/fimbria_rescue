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
  PocketSignature,
  ReclassificationProposal,
  FamilyRow,
  HeterodimerRow,
  HeterodimerHbond,
  PfamClanRow,
  PfamClanDisagreement,
} from './types';

export async function getStats(): Promise<StatsData> {
  const [domains, totalHbonds, dscCount, confidentDimers, completenessClasses, hetTotal, hetConfident, bacterial, archaeal, batchBreakdown] = await Promise.all([
    queryOne<{ count: string }>("SELECT COUNT(*)::text as count FROM fimbria.targets WHERE batch != 'controls'"),
    queryOne<{ sum: string }>('SELECT COALESCE(SUM(total_inter_hbonds), 0)::text as sum FROM fimbria.strand_exchange'),
    queryOne<{ count: string }>('SELECT COUNT(*)::text as count FROM fimbria.strand_exchange WHERE has_nte_to_body_dsc = true'),
    queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM fimbria.predictions WHERE mode = 'dimer_domain' AND completed = true AND iptm > 0.3`
    ),
    query<{ completeness: string; count: string }>(
      'SELECT completeness, COUNT(*)::text as count FROM fimbria.domain_completeness GROUP BY completeness'
    ),
    queryOne<{ count: string }>('SELECT COUNT(*)::text as count FROM fimbria.heterodimer_predictions WHERE completed = true'),
    queryOne<{ count: string }>('SELECT COUNT(*)::text as count FROM fimbria.heterodimer_predictions WHERE iptm > 0.3'),
    queryOne<{ count: string }>("SELECT COUNT(*)::text as count FROM fimbria.targets WHERE batch = 'batch2'"),
    queryOne<{ count: string }>("SELECT COUNT(*)::text as count FROM fimbria.targets WHERE batch = 'archaea'"),
    query<{ batch: string; completeness: string; count: string }>(
      `SELECT t.batch, dc.completeness, COUNT(*)::text as count
       FROM fimbria.domain_completeness dc
       JOIN fimbria.targets t ON dc.target_id = t.id
       WHERE t.batch != 'controls'
       GROUP BY t.batch, dc.completeness`
    ),
  ]);

  const bacterialCompleteness = batchBreakdown
    .filter((r) => r.batch === 'batch2')
    .map((r) => ({ completeness: r.completeness, count: parseInt(r.count) }));
  const archaealCompleteness = batchBreakdown
    .filter((r) => r.batch === 'archaea')
    .map((r) => ({ completeness: r.completeness, count: parseInt(r.count) }));

  return {
    total_domains: parseInt(domains?.count || '0'),
    total_hbonds: parseInt(totalHbonds?.sum || '0'),
    confident_dimers: parseInt(confidentDimers?.count || '0'),
    dsc_count: parseInt(dscCount?.count || '0'),
    completeness_classes: completenessClasses.map((c) => ({
      completeness: c.completeness,
      count: parseInt(c.count),
    })),
    heterodimer_total: parseInt(hetTotal?.count || '0'),
    heterodimer_confident: parseInt(hetConfident?.count || '0'),
    bacterial_domains: parseInt(bacterial?.count || '0'),
    archaeal_domains: parseInt(archaeal?.count || '0'),
    bacterial_completeness: bacterialCompleteness,
    archaeal_completeness: archaealCompleteness,
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
  batch?: string;
}

function buildRescueWhere(
  filters: RescueFilters,
  params: (string | number | boolean | null)[]
): string {
  const conditions: string[] = ["r.seq_type = 'domain'", "t.batch != 'controls'"];

  if (filters.batch === 'bacterial') {
    conditions.push("t.batch = 'batch2'");
  } else if (filters.batch === 'archaeal') {
    conditions.push("t.batch = 'archaea'");
  }

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
    `SELECT t.domain_id, t.organism, t.f_group, t.pfam_acc, t.pfam_id,
            pf.description as pfam_description,
            pc.clan_acc, pc.clan_name,
            t.domain_length,
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
     LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = t.pfam_acc
     LEFT JOIN public.pfam_clan pc ON pc.pfam_acc = t.pfam_acc
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
    `SELECT t.domain_id, t.organism, t.f_group, t.pfam_acc, t.pfam_id,
            pf.description as pfam_description,
            pc.clan_acc, pc.clan_name,
            t.domain_length,
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
     LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = t.pfam_acc
     LEFT JOIN public.pfam_clan pc ON pc.pfam_acc = t.pfam_acc
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
     LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = t.pfam_acc
     LEFT JOIN public.pfam_clan pc ON pc.pfam_acc = t.pfam_acc
     ${where}`,
    params
  );

  return parseInt(result?.count || '0');
}

export async function getRescueDetail(domainId: string): Promise<DomainDetail | null> {
  const target = await queryOne<Target>(
    `SELECT t.*, pf.description as pfam_description,
            pc.clan_acc, pc.clan_name
     FROM fimbria.targets t
     LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = t.pfam_acc
     LEFT JOIN public.pfam_clan pc ON pc.pfam_acc = t.pfam_acc
     WHERE t.domain_id = $1`,
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

  // Domain-level structures (linked by target_id)
  const domainStructures = await query<StructurePath>(
    `SELECT s.file_path, s.structure_type, p.mode
     FROM fimbria.structures s
     JOIN fimbria.predictions p ON s.prediction_id = p.id
     WHERE p.target_id = $1`,
    [target.id]
  );

  // Protein-level structures (linked through protein_domain_comparison)
  const proteinStructures = await query<StructurePath>(
    `SELECT DISTINCT s.file_path, s.structure_type, p.mode
     FROM fimbria.protein_domain_comparison pdc
     JOIN fimbria.predictions p ON p.id IN (pdc.monomer_protein_pred_id, pdc.dimer_protein_pred_id)
     JOIN fimbria.structures s ON s.prediction_id = p.id
     WHERE pdc.target_id = $1`,
    [target.id]
  );

  return [...domainStructures, ...proteinStructures];
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

export async function getPocketSignature(domainId: string): Promise<PocketSignature | null> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );
  if (!target) return null;
  return queryOne<PocketSignature>(
    'SELECT target_id, nte_start, nte_end, nte_sequence, donor_positions, pocket_residues, pocket_length, spacing_pattern, is_alternating, pct_hydrophobic FROM fimbria.pocket_signatures WHERE target_id = $1',
    [target.id]
  );
}

export async function getReclassificationProposal(domainId: string): Promise<ReclassificationProposal | null> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );
  if (!target) return null;
  return queryOne<ReclassificationProposal>(
    'SELECT target_id, current_fgroup, proposed_fgroup, pocket_score, matched_domain_id, dali_zscore, dali_rmsd, dali_nalign, confidence, evidence_summary FROM fimbria.reclassification_proposals WHERE target_id = $1',
    [target.id]
  );
}

export async function getFamilies(): Promise<FamilyRow[]> {
  const rows = await query<{
    f_group: string; total: string; dsc: string; probable_dimer: string; probable_monomer: string;
    avg_delta: string; avg_iptm: string;
  }>(
    `SELECT t.f_group,
            COUNT(*)::text as total,
            SUM(CASE WHEN dc.completeness = 'donor_strand_dependent' THEN 1 ELSE 0 END)::text as dsc,
            SUM(CASE WHEN dc.completeness = 'probable_dimer' THEN 1 ELSE 0 END)::text as probable_dimer,
            SUM(CASE WHEN dc.completeness = 'probable_monomer' THEN 1 ELSE 0 END)::text as probable_monomer,
            ROUND(AVG(r.delta_mean_plddt)::numeric, 1)::text as avg_delta,
            ROUND(AVG(p.iptm)::numeric, 3)::text as avg_iptm
     FROM fimbria.targets t
     JOIN fimbria.domain_completeness dc ON t.id = dc.target_id
     JOIN fimbria.rescue_analysis r ON t.id = r.target_id AND r.seq_type = 'domain'
     JOIN fimbria.predictions p ON r.dimer_prediction_id = p.id
     GROUP BY t.f_group
     ORDER BY COUNT(*) DESC`
  );

  return rows.map((r) => {
    const total = parseInt(r.total);
    const dsc = parseInt(r.dsc);
    const probable_dimer = parseInt(r.probable_dimer);
    const probable_monomer = parseInt(r.probable_monomer);
    return {
      f_group: r.f_group,
      total,
      dsc,
      probable_dimer,
      probable_monomer,
      pct_dsc: total > 0 ? Math.round((dsc / total) * 100) : 0,
      pct_probable_dimer: total > 0 ? Math.round((probable_dimer / total) * 100) : 0,
      pct_probable_monomer: total > 0 ? Math.round((probable_monomer / total) * 100) : 0,
      avg_iptm: parseFloat(r.avg_iptm) || 0,
      avg_delta: parseFloat(r.avg_delta) || 0,
    };
  });
}

export async function getFamilyDetail(fgroup: string): Promise<{
  members: RescueRow[];
  pockets: (PocketSignature & { domain_id: string })[];
  proposals: (ReclassificationProposal & { domain_id: string })[];
}> {
  const [members, pockets, proposals] = await Promise.all([
    query<RescueRow>(
      `SELECT t.domain_id, t.organism, t.f_group, t.pfam_acc, t.pfam_id,
              pf.description as pfam_description,
              pc.clan_acc, pc.clan_name,
              t.domain_length,
              r.mono_mean_plddt, r.dimer_mean_plddt, r.delta_mean_plddt,
              r.rescued_residues, r.rescue_class,
              p.iptm, p.inter_chain_pae,
              se.has_nte_to_body_dsc, se.nte_to_body_hbonds,
              se.has_cterm_reciprocal, se.total_inter_hbonds,
              dc.completeness, dc.complete_range, dc.donor_strand_range
       FROM fimbria.targets t
       JOIN fimbria.rescue_analysis r ON t.id = r.target_id AND r.seq_type = 'domain'
       JOIN fimbria.predictions p ON r.dimer_prediction_id = p.id
       LEFT JOIN fimbria.strand_exchange se ON se.prediction_id = p.id
       LEFT JOIN fimbria.domain_completeness dc ON dc.target_id = t.id
       LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = t.pfam_acc
       LEFT JOIN public.pfam_clan pc ON pc.pfam_acc = t.pfam_acc
       WHERE t.f_group = $1
       ORDER BY r.delta_mean_plddt DESC`,
      [fgroup]
    ),
    query<PocketSignature & { domain_id: string }>(
      `SELECT t.domain_id, ps.target_id, ps.nte_start, ps.nte_end, ps.nte_sequence,
              ps.donor_positions, ps.pocket_residues, ps.pocket_length,
              ps.spacing_pattern, ps.is_alternating, ps.pct_hydrophobic
       FROM fimbria.pocket_signatures ps
       JOIN fimbria.targets t ON ps.target_id = t.id
       WHERE t.f_group = $1
       ORDER BY ps.pocket_residues`,
      [fgroup]
    ),
    query<ReclassificationProposal & { domain_id: string }>(
      `SELECT t.domain_id, rp.target_id, rp.current_fgroup, rp.proposed_fgroup,
              rp.pocket_score, rp.matched_domain_id, rp.dali_zscore, rp.dali_rmsd,
              rp.dali_nalign, rp.confidence, rp.evidence_summary
       FROM fimbria.reclassification_proposals rp
       JOIN fimbria.targets t ON rp.target_id = t.id
       WHERE rp.proposed_fgroup = $1`,
      [fgroup]
    ),
  ]);

  return { members, pockets, proposals };
}

export async function getHeterodimers(): Promise<HeterodimerRow[]> {
  return query<HeterodimerRow>(
    `SELECT hp.id, hp.pair_name, hp.iptm, hp.inter_chain_pae,
            hp.pae_a_to_b, hp.pae_b_to_a, hp.chain_a_ptm, hp.chain_b_ptm,
            hp.ranking_score, hp.priority, hp.model_cif_path,
            he.exchange_type, he.a_to_b_hbonds, he.b_to_a_hbonds,
            he.total_inter_hbonds, he.evidence_summary,
            ta.domain_id as domain_a, ta.organism, ta.f_group as fg_a,
            dca.completeness as comp_a,
            tb.domain_id as domain_b, tb.f_group as fg_b,
            dcb.completeness as comp_b,
            CASE
              WHEN he.exchange_type != 'none' THEN 'DSC'
              WHEN hp.iptm > 0.3 AND he.exchange_type = 'none' THEN 'Lateral'
              ELSE 'None'
            END as assembly_mode
     FROM fimbria.heterodimer_predictions hp
     JOIN fimbria.heterodimer_exchange he ON hp.id = he.prediction_id
     JOIN fimbria.targets ta ON hp.target_a_id = ta.id
     JOIN fimbria.targets tb ON hp.target_b_id = tb.id
     LEFT JOIN fimbria.domain_completeness dca ON ta.id = dca.target_id
     LEFT JOIN fimbria.domain_completeness dcb ON tb.id = dcb.target_id
     WHERE hp.completed = true
     ORDER BY hp.iptm DESC`
  );
}

export async function getHeterodimerHbonds(pairId: number): Promise<HeterodimerHbond[]> {
  return query<HeterodimerHbond>(
    `SELECT hh.donor_chain, hh.donor_res, hh.donor_name,
            hh.acceptor_chain, hh.acceptor_res, hh.acceptor_name,
            hh.no_distance, hh.interaction_type
     FROM fimbria.heterodimer_hbonds hh
     WHERE hh.prediction_id = $1
     ORDER BY hh.donor_chain, hh.donor_res`,
    [pairId]
  );
}

export async function getHeterodimersForDomain(domainId: string): Promise<HeterodimerRow[]> {
  const target = await queryOne<{ id: number }>(
    'SELECT id FROM fimbria.targets WHERE domain_id = $1',
    [domainId]
  );
  if (!target) return [];

  return query<HeterodimerRow>(
    `SELECT hp.id, hp.pair_name, hp.iptm, hp.inter_chain_pae,
            hp.pae_a_to_b, hp.pae_b_to_a, hp.chain_a_ptm, hp.chain_b_ptm,
            hp.ranking_score, hp.priority, hp.model_cif_path,
            he.exchange_type, he.a_to_b_hbonds, he.b_to_a_hbonds,
            he.total_inter_hbonds, he.evidence_summary,
            ta.domain_id as domain_a, ta.organism, ta.f_group as fg_a,
            dca.completeness as comp_a,
            tb.domain_id as domain_b, tb.f_group as fg_b,
            dcb.completeness as comp_b,
            CASE
              WHEN he.exchange_type != 'none' THEN 'DSC'
              WHEN hp.iptm > 0.3 AND he.exchange_type = 'none' THEN 'Lateral'
              ELSE 'None'
            END as assembly_mode
     FROM fimbria.heterodimer_predictions hp
     JOIN fimbria.heterodimer_exchange he ON hp.id = he.prediction_id
     JOIN fimbria.targets ta ON hp.target_a_id = ta.id
     JOIN fimbria.targets tb ON hp.target_b_id = tb.id
     LEFT JOIN fimbria.domain_completeness dca ON ta.id = dca.target_id
     LEFT JOIN fimbria.domain_completeness dcb ON tb.id = dcb.target_id
     WHERE (hp.target_a_id = $1 OR hp.target_b_id = $1) AND hp.completed = true
     ORDER BY hp.iptm DESC`,
    [target.id]
  );
}

export async function getArchaeaDomains(): Promise<RescueRow[]> {
  return query<RescueRow>(
    `SELECT t.domain_id, t.organism, t.f_group, t.pfam_acc, t.pfam_id,
            pf.description as pfam_description,
            pc.clan_acc, pc.clan_name,
            t.domain_length,
            r.mono_mean_plddt, r.dimer_mean_plddt, r.delta_mean_plddt,
            r.rescued_residues, r.rescue_class,
            p.iptm, p.inter_chain_pae,
            se.has_nte_to_body_dsc, se.nte_to_body_hbonds,
            se.has_cterm_reciprocal, se.total_inter_hbonds,
            dc.completeness, dc.complete_range, dc.donor_strand_range
     FROM fimbria.targets t
     JOIN fimbria.rescue_analysis r ON t.id = r.target_id AND r.seq_type = 'domain'
     JOIN fimbria.predictions p ON r.dimer_prediction_id = p.id
     LEFT JOIN fimbria.strand_exchange se ON se.prediction_id = p.id
     LEFT JOIN fimbria.domain_completeness dc ON dc.target_id = t.id
     LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = t.pfam_acc
     LEFT JOIN public.pfam_clan pc ON pc.pfam_acc = t.pfam_acc
     WHERE t.batch = 'archaea'
     ORDER BY r.delta_mean_plddt DESC`
  );
}

export async function getArchaeaHeterodimers(): Promise<HeterodimerRow[]> {
  return query<HeterodimerRow>(
    `SELECT hp.id, hp.pair_name, hp.iptm, hp.inter_chain_pae,
            hp.pae_a_to_b, hp.pae_b_to_a, hp.chain_a_ptm, hp.chain_b_ptm,
            hp.ranking_score, hp.priority, hp.model_cif_path,
            he.exchange_type, he.a_to_b_hbonds, he.b_to_a_hbonds,
            he.total_inter_hbonds, he.evidence_summary,
            ta.domain_id as domain_a, ta.organism, ta.f_group as fg_a,
            dca.completeness as comp_a,
            tb.domain_id as domain_b, tb.f_group as fg_b,
            dcb.completeness as comp_b,
            CASE
              WHEN he.exchange_type != 'none' THEN 'DSC'
              WHEN hp.iptm > 0.3 AND he.exchange_type = 'none' THEN 'Lateral'
              ELSE 'None'
            END as assembly_mode
     FROM fimbria.heterodimer_predictions hp
     JOIN fimbria.heterodimer_exchange he ON hp.id = he.prediction_id
     JOIN fimbria.targets ta ON hp.target_a_id = ta.id
     JOIN fimbria.targets tb ON hp.target_b_id = tb.id
     LEFT JOIN fimbria.domain_completeness dca ON ta.id = dca.target_id
     LEFT JOIN fimbria.domain_completeness dcb ON tb.id = dcb.target_id
     WHERE hp.batch = 'archaea' AND hp.completed = true
     ORDER BY hp.iptm DESC`
  );
}

export async function getPfamClan(clanAcc: string = 'CL0204'): Promise<PfamClanRow[]> {
  const rows = await query<{
    pfam_acc: string; pfam_short_name: string; pfam_description: string | null;
    clan_acc: string; clan_name: string; ecod_fgroups: string | null;
    fimbria_domain_count: string; dsc: string;
    probable_dimer: string; probable_monomer: string;
    out_of_tgroup_hit: boolean;
  }>(
    `SELECT pc.pfam_acc,
            pc.pfam_short_name,
            pf.description as pfam_description,
            pc.clan_acc,
            pc.clan_name,
            (SELECT string_agg(DISTINCT f.f_id, ', ' ORDER BY f.f_id)
             FROM public.f_id_pfam_acc f
             WHERE f.pfam_acc = pc.pfam_acc) as ecod_fgroups,
            COUNT(DISTINCT t.id)::text as fimbria_domain_count,
            SUM(CASE WHEN dc.completeness = 'donor_strand_dependent' THEN 1 ELSE 0 END)::text as dsc,
            SUM(CASE WHEN dc.completeness = 'probable_dimer' THEN 1 ELSE 0 END)::text as probable_dimer,
            SUM(CASE WHEN dc.completeness = 'probable_monomer' THEN 1 ELSE 0 END)::text as probable_monomer,
            EXISTS (SELECT 1 FROM public.f_id_pfam_acc f
                    WHERE f.pfam_acc = pc.pfam_acc
                      AND f.f_id NOT LIKE '11.1.5.%') as out_of_tgroup_hit
     FROM public.pfam_clan pc
     LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = pc.pfam_acc
     LEFT JOIN fimbria.targets t ON t.pfam_acc = pc.pfam_acc
     LEFT JOIN fimbria.domain_completeness dc ON dc.target_id = t.id
     WHERE pc.clan_acc = $1
     GROUP BY pc.pfam_acc, pc.pfam_short_name, pf.description, pc.clan_acc, pc.clan_name
     ORDER BY pc.pfam_acc`,
    [clanAcc]
  );

  return rows.map((r) => ({
    pfam_acc: r.pfam_acc,
    pfam_short_name: r.pfam_short_name,
    pfam_description: r.pfam_description,
    clan_acc: r.clan_acc,
    clan_name: r.clan_name,
    ecod_fgroups: r.ecod_fgroups,
    fimbria_domain_count: parseInt(r.fimbria_domain_count),
    dsc: parseInt(r.dsc),
    probable_dimer: parseInt(r.probable_dimer),
    probable_monomer: parseInt(r.probable_monomer),
    has_fgroup_mapping: r.ecod_fgroups != null,
    out_of_tgroup: r.out_of_tgroup_hit,
  }));
}

export async function getPfamClanDisagreements(clanAcc: string = 'CL0204'): Promise<PfamClanDisagreement[]> {
  const [noFgroup, outOfTgroup] = await Promise.all([
    query<{
      pfam_acc: string; pfam_short_name: string; pfam_description: string | null;
      fimbria_count: string;
    }>(
      `SELECT pc.pfam_acc, pc.pfam_short_name, pf.description as pfam_description,
              (SELECT COUNT(*) FROM fimbria.targets t WHERE t.pfam_acc = pc.pfam_acc)::text as fimbria_count
       FROM public.pfam_clan pc
       LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = pc.pfam_acc
       WHERE pc.clan_acc = $1
         AND NOT EXISTS (
           SELECT 1 FROM public.f_id_pfam_acc f WHERE f.pfam_acc = pc.pfam_acc
         )`,
      [clanAcc]
    ),
    query<{
      pfam_acc: string; pfam_short_name: string; pfam_description: string | null;
      f_id: string; fimbria_count: string;
    }>(
      `SELECT pc.pfam_acc, pc.pfam_short_name, pf.description as pfam_description, f.f_id,
              (SELECT COUNT(*) FROM fimbria.targets t WHERE t.pfam_acc = pc.pfam_acc)::text as fimbria_count
       FROM public.pfam_clan pc
       LEFT JOIN ecod_commons.pfam_families pf ON pf.pfam_acc = pc.pfam_acc
       JOIN public.f_id_pfam_acc f ON f.pfam_acc = pc.pfam_acc
       WHERE pc.clan_acc = $1 AND f.f_id NOT LIKE '11.1.5.%'`,
      [clanAcc]
    ),
  ]);

  const disagreements: PfamClanDisagreement[] = [];
  for (const r of noFgroup) {
    disagreements.push({
      type: 'no_fgroup',
      pfam_acc: r.pfam_acc,
      pfam_short_name: r.pfam_short_name,
      pfam_description: r.pfam_description,
      out_of_tgroup_fgroup: null,
      fimbria_count: parseInt(r.fimbria_count),
      proposed_action: 'Curate a new ECOD F-group or verify Pfam representation',
    });
  }
  for (const r of outOfTgroup) {
    disagreements.push({
      type: 'out_of_tgroup',
      pfam_acc: r.pfam_acc,
      pfam_short_name: r.pfam_short_name,
      pfam_description: r.pfam_description,
      out_of_tgroup_fgroup: r.f_id,
      fimbria_count: parseInt(r.fimbria_count),
      proposed_action: 'Reconcile ECOD T-group boundary with Pfam clan boundary',
    });
  }

  return disagreements;
}

export async function getLiterature(): Promise<LiteratureEntry[]> {
  return query<LiteratureEntry>(
    'SELECT * FROM fimbria.literature ORDER BY year DESC, title'
  );
}
