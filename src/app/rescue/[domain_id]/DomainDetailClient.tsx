'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import RescueClassBadge from '@/components/rescue/RescueClassBadge';
import MetricsCard from '@/components/rescue/MetricsCard';
import SequenceViewer from '@/components/rescue/SequenceViewer';
import StrandExchangeCard from '@/components/rescue/StrandExchangeCard';
import HbondTable from '@/components/rescue/HbondTable';
import type { DomainDetail, ResiduePlddt, SequenceData, StructurePath, StrandExchange, InterChainHbond } from '@/lib/types';

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
}

export default function DomainDetailClient({ detail, plddts, sequences, structures, exchange, hbonds }: Props) {
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
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {target.domain_id}
          </h1>
          <RescueClassBadge rescueClass={rescue.rescue_class} />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>
            <span className="font-medium">UniProt:</span> {target.uniprot_acc}
            {' | '}
            <span className="font-medium">Organism:</span> {target.organism}
          </p>
          <p>
            <span className="font-medium">ECOD:</span> T-group {target.t_group}, F-group {target.f_group}
            {' | '}
            <span className="font-medium">Range:</span> {target.domain_range}
            {' | '}
            <span className="font-medium">Length:</span> {target.domain_length} residues
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <MetricsCard
          title="Monomer"
          metrics={[
            { label: 'PTM', value: monomer.ptm.toFixed(3) },
            { label: 'Mean pLDDT', value: Number(rescue.mono_mean_plddt).toFixed(1) },
            { label: 'Fraction Disordered', value: monomer.fraction_disordered.toFixed(3) },
            { label: 'Disordered Residues', value: rescue.mono_disordered_res },
          ]}
        />
        <MetricsCard
          title="Dimer"
          metrics={[
            { label: 'Chain PTM', value: dimer.chain_ptm.toFixed(3) },
            { label: 'iPTM', value: dimer.iptm?.toFixed(3) ?? '-' },
            { label: 'Inter-chain PAE', value: dimer.inter_chain_pae?.toFixed(1) ?? '-' },
            { label: 'Mean pLDDT', value: Number(rescue.dimer_mean_plddt).toFixed(1) },
            { label: 'Fraction Disordered', value: dimer.fraction_disordered.toFixed(3) },
            { label: 'Disordered Residues', value: rescue.dimer_disordered_res },
          ]}
        />
        <MetricsCard
          title="Delta (Dimer - Monomer)"
          metrics={[
            { label: 'Mean pLDDT', value: Number(rescue.delta_mean_plddt).toFixed(1), highlight: true },
            { label: 'Terminal pLDDT', value: Number(rescue.delta_terminal_plddt).toFixed(1) },
            { label: 'Core pLDDT', value: Number(rescue.delta_core_plddt).toFixed(1) },
            { label: 'Rescued Residues', value: rescue.rescued_residues, highlight: true },
          ]}
        />
      </div>

      {/* Strand Exchange Evidence */}
      {exchange && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Strand Exchange Evidence
          </h2>
          <StrandExchangeCard exchange={exchange} hbonds={hbonds} domainLength={target.domain_length} />
        </div>
      )}

      {/* H-bond Details */}
      {hbonds.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Inter-chain H-bonds ({hbonds.length})
          </h2>
          <HbondTable hbonds={hbonds} />
        </div>
      )}

      {/* Structure Viewer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          3D Structure
        </h2>
        <StructureViewer domainId={target.domain_id} structures={structures} />
      </div>

      {/* pLDDT Profile Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          pLDDT Profile
        </h2>
        <PlddtChart monomer={plddts.monomer} dimer={plddts.dimer} />
      </div>

      {/* Download Structures */}
      {structures.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Download Structures
          </h2>
          <div className="flex flex-wrap gap-3">
            {structures.find((s) => s.mode === 'monomer_domain') && (
              <a
                href={`/api/rescue/${target.domain_id}/structure/monomer_domain?download`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Monomer CIF
              </a>
            )}
            {structures.find((s) => s.mode === 'dimer_domain') && (
              <a
                href={`/api/rescue/${target.domain_id}/structure/dimer_domain?download`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Dimer CIF
              </a>
            )}
          </div>
        </div>
      )}

      {/* Sequence */}
      {domainSeq && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Domain Sequence
          </h2>
          <SequenceViewer
            sequence={domainSeq.sequence}
            monomerPlddts={plddts.monomer}
            dimerPlddts={plddts.dimer}
          />
        </div>
      )}

      {/* Cross-references */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Cross-references
        </h2>
        <div className="flex flex-wrap gap-4">
          {target.ecod_uid && (
            <a
              href={`http://prodata.swmed.edu/ecod/af/domain/${target.ecod_uid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ECOD Domain
            </a>
          )}
          <a
            href={`https://www.uniprot.org/uniprot/${target.uniprot_acc}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            UniProt: {target.uniprot_acc}
          </a>
          <a
            href={`https://alphafold.ebi.ac.uk/entry/${target.uniprot_acc}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            AlphaFold DB
          </a>
        </div>
      </div>
    </div>
  );
}
