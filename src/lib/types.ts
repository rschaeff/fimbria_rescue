export interface Target {
  id: number;
  domain_id: string;
  uniprot_acc: string;
  organism: string;
  domain_range: string;
  domain_length: number;
  protein_length: number;
  is_discontinuous: boolean;
  is_multidomain: boolean;
  num_domains: number;
  f_group: string;
  pfam_acc: string | null;
  pfam_id: string | null;
  t_group: string;
  ecod_status: string;
  batch: string;
  signal_peptide_pos: number | null;
  has_diglycine_motif: boolean;
  ecod_uid: number | null;
  created_date: string;
}

export interface RescueAnalysis {
  id: number;
  target_id: number;
  monomer_prediction_id: number;
  dimer_prediction_id: number;
  seq_type: string;
  batch: string;
  mono_mean_plddt: number;
  dimer_mean_plddt: number;
  delta_mean_plddt: number;
  mono_terminal_plddt: number;
  dimer_terminal_plddt: number;
  delta_terminal_plddt: number;
  mono_core_plddt: number;
  dimer_core_plddt: number;
  delta_core_plddt: number;
  mono_disordered_res: number;
  dimer_disordered_res: number;
  rescued_residues: number;
  rescue_class: 'strong' | 'moderate' | 'confident_dimer' | 'weak' | 'no_interaction';
}

export interface Prediction {
  id: number;
  target_id: number;
  mode: 'monomer_domain' | 'dimer_domain' | 'monomer_protein' | 'dimer_protein';
  batch: string;
  ptm: number;
  iptm: number | null;
  ranking_score: number;
  fraction_disordered: number;
  has_clash: boolean;
  chain_ptm: number;
  inter_chain_pae: number | null;
  output_dir: string;
  model_cif_path: string;
  completed: boolean;
}

export interface ResiduePlddt {
  residue_index: number;
  plddt: number;
}

export interface LiteratureEntry {
  id: number;
  pmid: string;
  doi: string | null;
  title: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string | null;
  keywords: string | null;
  relevance: 'direct' | 'review' | 'methods' | 'background';
  notes: string;
  created_date: string;
  updated_date: string;
}

export interface RescueRow {
  domain_id: string;
  organism: string;
  f_group: string;
  pfam_acc: string | null;
  pfam_id: string | null;
  domain_length: number;
  mono_mean_plddt: number;
  dimer_mean_plddt: number;
  delta_mean_plddt: number;
  rescued_residues: number;
  rescue_class: string;
  iptm: number;
  inter_chain_pae: number;
  has_nte_to_body_dsc: boolean | null;
  nte_to_body_hbonds: number | null;
  has_cterm_reciprocal: boolean | null;
  total_inter_hbonds: number | null;
  completeness: string | null;
  complete_range: string | null;
  donor_strand_range: string | null;
}

export interface InterChainHbond {
  donor_chain: string;
  donor_res: number;
  donor_name: string;
  acceptor_chain: string;
  acceptor_res: number;
  acceptor_name: string;
  no_distance: number;
  co_n_angle: number;
}

export interface StrandContact {
  direction: 'A->B' | 'B->A';
  donor_range: string;
  acceptor_range: string;
  num_hbonds: number;
}

export interface StrandExchange {
  id: number;
  prediction_id: number;
  target_id: number;
  total_inter_hbonds: number;
  nte_inter_hbonds: number;
  has_nte_to_body_dsc: boolean;
  nte_to_body_hbonds: number;
  nte_donor_range: string | null;
  body_acceptor_range: string | null;
  has_cterm_reciprocal: boolean;
  cterm_donor_range: string | null;
  cterm_acceptor_range: string | null;
  num_strand_contacts: number;
  strand_contact_details: string;
}

export interface DomainCompleteness {
  id: number;
  target_id: number;
  ecod_range: string;
  has_donor_strand: boolean;
  donor_strand_chain: string | null;
  donor_strand_range: string | null;
  donor_strand_hbonds: number;
  body_acceptor_range: string | null;
  has_cterm_exchange: boolean;
  cterm_donor_range: string | null;
  cterm_acceptor_range: string | null;
  complete_range: string | null;
  completeness: 'complete' | 'self_complemented' | 'donor_strand_dependent' | 'unknown';
  evidence_summary: string;
  curator_reviewed: boolean;
  curator_notes: string | null;
}

export interface ProteinDomainComparison {
  id: number;
  target_id: number;
  protein_id: number;
  monomer_protein_pred_id: number | null;
  dimer_protein_pred_id: number | null;
  monomer_domain_pred_id: number | null;
  dimer_domain_pred_id: number | null;
  protein_mono_domain_plddt: number | null;
  protein_dimer_domain_plddt: number | null;
  protein_delta_domain_plddt: number | null;
  domain_mono_plddt: number | null;
  domain_dimer_plddt: number | null;
  domain_delta_plddt: number | null;
  protein_vs_domain_mono_delta: number | null;
  protein_vs_domain_dimer_delta: number | null;
  protein_dimer_rescued_in_domain: number | null;
  has_protein_monomer: boolean;
  has_protein_dimer: boolean;
}

export interface ProteinInfo {
  id: number;
  uniprot_acc: string;
  organism: string | null;
  protein_length: number | null;
  signal_peptide_pos: number | null;
  num_domains: number;
  is_multidomain: boolean;
}

export interface DomainDetail {
  target: Target;
  rescue: RescueAnalysis;
  monomer: Prediction;
  dimer: Prediction;
}

export interface PocketSignature {
  target_id: number;
  nte_start: number;
  nte_end: number;
  nte_sequence: string;
  donor_positions: number[];
  pocket_residues: string;
  pocket_length: number;
  spacing_pattern: number[];
  is_alternating: boolean;
  pct_hydrophobic: number;
}

export interface ReclassificationProposal {
  target_id: number;
  current_fgroup: string | null;
  proposed_fgroup: string;
  pocket_score: number | null;
  matched_domain_id: string | null;
  dali_zscore: number | null;
  dali_rmsd: number | null;
  dali_nalign: number | null;
  confidence: 'strong' | 'moderate' | 'weak';
  evidence_summary: string | null;
}

export interface FamilyRow {
  f_group: string;
  total: number;
  dsc: number;
  self_comp: number;
  complete: number;
  pct_dsc: number;
  pct_self: number;
  pct_complete: number;
  avg_iptm: number;
  avg_delta: number;
}

export interface HeterodimerRow {
  id: number;
  pair_name: string;
  domain_a: string;
  domain_b: string;
  organism: string;
  fg_a: string;
  fg_b: string;
  comp_a: string;
  comp_b: string;
  priority: number;
  iptm: number;
  inter_chain_pae: number;
  pae_a_to_b: number;
  pae_b_to_a: number;
  chain_a_ptm: number;
  chain_b_ptm: number;
  ranking_score: number;
  exchange_type: string;
  assembly_mode: string;
  a_to_b_hbonds: number;
  b_to_a_hbonds: number;
  total_inter_hbonds: number;
  evidence_summary: string | null;
  model_cif_path: string | null;
}

export interface HeterodimerHbond {
  donor_chain: string;
  donor_res: number;
  donor_name: string;
  acceptor_chain: string;
  acceptor_res: number;
  acceptor_name: string;
  no_distance: number;
  interaction_type: string | null;
}

export interface StatsData {
  total_domains: number;
  total_hbonds: number;
  confident_dimers: number;
  dsc_count: number;
  completeness_classes: { completeness: string; count: number }[];
  heterodimer_total: number;
  heterodimer_confident: number;
  bacterial_domains: number;
  archaeal_domains: number;
  archaeal_completeness: { completeness: string; count: number }[];
  bacterial_completeness: { completeness: string; count: number }[];
}

export interface SequenceData {
  seq_type: string;
  sequence: string;
  sequence_length: number;
}

export interface StructurePath {
  file_path: string;
  structure_type: string;
  mode: string;
}
