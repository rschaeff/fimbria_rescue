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
  domain_length: number;
  mono_mean_plddt: number;
  dimer_mean_plddt: number;
  delta_mean_plddt: number;
  rescued_residues: number;
  rescue_class: string;
  iptm: number;
  inter_chain_pae: number;
}

export interface DomainDetail {
  target: Target;
  rescue: RescueAnalysis;
  monomer: Prediction;
  dimer: Prediction;
}

export interface StatsData {
  total_targets: number;
  total_predictions: number;
  completed_predictions: number;
  rescue_classes: { rescue_class: string; count: number }[];
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
