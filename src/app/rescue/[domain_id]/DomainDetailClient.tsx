'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import RescueClassBadge from '@/components/rescue/RescueClassBadge';
import MetricsCard from '@/components/rescue/MetricsCard';
import SequenceViewer from '@/components/rescue/SequenceViewer';
import StrandExchangeCard from '@/components/rescue/StrandExchangeCard';
import HbondTable from '@/components/rescue/HbondTable';
import CompletenessCard from '@/components/rescue/CompletenessCard';
import CompletenessBadge from '@/components/rescue/CompletenessBadge';
import ProteinComparisonCard from '@/components/rescue/ProteinComparisonCard';
import type { DomainDetail, ResiduePlddt, SequenceData, StructurePath, StrandExchange, InterChainHbond, DomainCompleteness, ProteinDomainComparison, ProteinInfo } from '@/lib/types';

const PlddtChart = dynamic(() => import('@/components/rescue/PlddtChart'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

const StructureViewer = dynamic(() => import('@/components/rescue/StructureViewer'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

interface Props {
  detail: DomainDetail;
  plddts: { monomer: ResiduePlddt[]; dimer: ResiduePlddt[] };
  sequences: SequenceData[];
  structures: StructurePath[];
  exchange: StrandExchange | null;
  hbonds: InterChainHbond[];
  completeness: DomainCompleteness | null;
  proteinComparison: {
    comparison: ProteinDomainComparison;
    protein: ProteinInfo;
    proteinPlddts: { monomer: ResiduePlddt[]; dimer: ResiduePlddt[] };
  } | null;
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

export default function DomainDetailClient({ detail, plddts, sequences, structures, exchange, hbonds, completeness, proteinComparison }: Props) {
  const { target, rescue, monomer, dimer } = detail;
  const domainSeq = sequences.find((s) => s.seq_type === 'domain');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/rescue" className="hover:text-gray-700 dark:hover:text-gray-200">
          Rescue Browser
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white font-medium">{target.domain_id}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {target.domain_id}
          </h1>
          <RescueClassBadge rescueClass={rescue.rescue_class} />
          {completeness && <CompletenessBadge completeness={completeness.completeness} />}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {target.uniprot_acc} &middot; {target.organism} &middot;
          T-group {target.t_group}, F-group {target.f_group}
          {target.pfam_acc && (
            <>
              {' '}&middot;{' '}
              <a href={`https://www.ebi.ac.uk/interpro/entry/pfam/${target.pfam_acc}/`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{target.pfam_acc}</a>
              {target.pfam_id && <span className="text-gray-400"> ({target.pfam_id})</span>}
            </>
          )}
          {' '}&middot; {target.domain_range} ({target.domain_length} res)
          {target.ecod_uid && (
            <>
              {' '}&middot;{' '}
              <a href={`http://prodata.swmed.edu/ecod/af/domain/${target.ecod_uid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">ECOD</a>
            </>
          )}
          {' '}&middot;{' '}
          <a href={`https://www.uniprot.org/uniprot/${target.uniprot_acc}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">UniProt</a>
          {' '}&middot;{' '}
          <a href={`https://alphafold.ebi.ac.uk/entry/${target.uniprot_acc}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">AlphaFold</a>
        </div>
      </div>

      {/* Structure Viewer + Metrics side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3D Structure</h2>
            {structures.length > 0 && (
              <div className="flex items-center gap-3 text-xs">
                {structures.find((s) => s.mode === 'monomer_domain') && (
                  <a
                    href={`/api/rescue/${target.domain_id}/structure/monomer_domain?download`}
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <DownloadIcon /> Monomer CIF
                  </a>
                )}
                {structures.find((s) => s.mode === 'dimer_domain') && (
                  <a
                    href={`/api/rescue/${target.domain_id}/structure/dimer_domain?download`}
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <DownloadIcon /> Dimer CIF
                  </a>
                )}
              </div>
            )}
          </div>
          <StructureViewer domainId={target.domain_id} structures={structures} />
        </div>

        <div className="space-y-4">
          <MetricsCard
            title="Monomer"
            metrics={[
              { label: 'PTM', value: monomer.ptm.toFixed(3) },
              { label: 'Mean pLDDT', value: Number(rescue.mono_mean_plddt).toFixed(1) },
              { label: 'Frac. Disordered', value: monomer.fraction_disordered.toFixed(3) },
            ]}
          />
          <MetricsCard
            title="Dimer"
            metrics={[
              { label: 'Chain PTM', value: dimer.chain_ptm.toFixed(3) },
              { label: 'iPTM', value: dimer.iptm?.toFixed(3) ?? '-' },
              { label: 'PAE', value: dimer.inter_chain_pae?.toFixed(1) ?? '-' },
              { label: 'Mean pLDDT', value: Number(rescue.dimer_mean_plddt).toFixed(1) },
            ]}
          />
          <MetricsCard
            title="Delta"
            metrics={[
              { label: 'Mean pLDDT', value: Number(rescue.delta_mean_plddt).toFixed(1), highlight: true },
              { label: 'Terminal', value: Number(rescue.delta_terminal_plddt).toFixed(1) },
              { label: 'Core', value: Number(rescue.delta_core_plddt).toFixed(1) },
              { label: 'Rescued Res.', value: rescue.rescued_residues, highlight: true },
            ]}
          />
        </div>
      </div>

      {/* pLDDT Profile Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          pLDDT Profile
        </h2>
        <PlddtChart monomer={plddts.monomer} dimer={plddts.dimer} />
      </div>

      {/* Completeness + Strand Exchange side-by-side */}
      {(completeness || exchange) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {completeness && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Domain Completeness
              </h2>
              <CompletenessCard completeness={completeness} />
            </div>
          )}
          {exchange && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Strand Exchange
              </h2>
              <StrandExchangeCard exchange={exchange} hbonds={hbonds} domainLength={target.domain_length} />
              {hbonds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    H-bond Details ({hbonds.length})
                  </h3>
                  <HbondTable hbonds={hbonds} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sequence */}
      {domainSeq && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Domain Sequence
          </h2>
          <SequenceViewer
            sequence={domainSeq.sequence}
            monomerPlddts={plddts.monomer}
            dimerPlddts={plddts.dimer}
          />
        </div>
      )}

      {/* Domain vs Protein Comparison */}
      {proteinComparison && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Domain vs Protein Comparison
          </h2>
          <ProteinComparisonCard
            comparison={proteinComparison.comparison}
            protein={proteinComparison.protein}
            proteinPlddts={proteinComparison.proteinPlddts}
            domainRange={target.domain_range}
          />
        </div>
      )}
    </div>
  );
}
