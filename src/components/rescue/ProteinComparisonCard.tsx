'use client';

import dynamic from 'next/dynamic';
import type { ProteinDomainComparison, ProteinInfo, ResiduePlddt } from '@/lib/types';

const ProteinPlddtChart = dynamic(() => import('./ProteinPlddtChart'), {
  ssr: false,
  loading: () => <div className="h-[350px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

interface ProteinComparisonCardProps {
  comparison: ProteinDomainComparison;
  protein: ProteinInfo;
  proteinPlddts: { monomer: ResiduePlddt[]; dimer: ResiduePlddt[] };
  domainRange: string;
}

function fmt(v: number | null, decimals: number = 1): string {
  if (v == null) return '-';
  return v.toFixed(decimals);
}

function deltaColor(v: number | null): string {
  if (v == null) return '';
  if (v > 2) return 'text-green-600 dark:text-green-400';
  if (v < -2) return 'text-red-600 dark:text-red-400';
  return '';
}

export default function ProteinComparisonCard({
  comparison: c,
  protein,
  proteinPlddts,
  domainRange,
}: ProteinComparisonCardProps) {
  return (
    <div>
      {/* Protein info */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span className="font-medium">Protein:</span> {protein.uniprot_acc}
        {' | '}
        <span className="font-medium">Length:</span> {protein.protein_length} residues
        {protein.is_multidomain && (
          <> | <span className="font-medium">Domains:</span> {protein.num_domains}</>
        )}
        {protein.signal_peptide_pos && (
          <> | <span className="font-medium">Signal peptide:</span> 1-{protein.signal_peptide_pos}</>
        )}
      </div>

      {/* Side-by-side metrics */}
      <div className="overflow-x-auto mb-6">
        <table className="text-sm divide-y divide-gray-200 dark:divide-gray-700 w-full">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400">
              <th className="px-3 py-2 text-left font-medium">Metric</th>
              <th className="px-3 py-2 text-right font-medium">Domain</th>
              <th className="px-3 py-2 text-right font-medium">Protein (domain region)</th>
              <th className="px-3 py-2 text-right font-medium">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <tr>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Monomer mean pLDDT</td>
              <td className="px-3 py-2 text-right font-mono">{fmt(c.domain_mono_plddt)}</td>
              <td className="px-3 py-2 text-right font-mono">{fmt(c.protein_mono_domain_plddt)}</td>
              <td className={`px-3 py-2 text-right font-mono font-medium ${deltaColor(c.protein_vs_domain_mono_delta)}`}>
                {fmt(c.protein_vs_domain_mono_delta)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Dimer mean pLDDT</td>
              <td className="px-3 py-2 text-right font-mono">{fmt(c.domain_dimer_plddt)}</td>
              <td className="px-3 py-2 text-right font-mono">{c.has_protein_dimer ? fmt(c.protein_dimer_domain_plddt) : 'N/A'}</td>
              <td className={`px-3 py-2 text-right font-mono font-medium ${deltaColor(c.protein_vs_domain_dimer_delta)}`}>
                {c.has_protein_dimer ? fmt(c.protein_vs_domain_dimer_delta) : '-'}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Delta pLDDT (dimer - mono)</td>
              <td className="px-3 py-2 text-right font-mono">{fmt(c.domain_delta_plddt)}</td>
              <td className="px-3 py-2 text-right font-mono">{c.has_protein_dimer ? fmt(c.protein_delta_domain_plddt) : 'N/A'}</td>
              <td className="px-3 py-2 text-right font-mono">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Protein-level pLDDT chart */}
      {(proteinPlddts.monomer.length > 0 || proteinPlddts.dimer.length > 0) && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Protein-level pLDDT (domain region highlighted)
          </h4>
          <ProteinPlddtChart
            monomer={proteinPlddts.monomer}
            dimer={proteinPlddts.dimer}
            domainRange={domainRange}
          />
        </div>
      )}
    </div>
  );
}
