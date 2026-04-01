import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getFamilyDetail } from '@/lib/queries';
import RescueClassBadge from '@/components/rescue/RescueClassBadge';
import CompletenessBadge from '@/components/rescue/CompletenessBadge';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ fgroup: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { fgroup } = await params;
  return { title: `${decodeURIComponent(fgroup)} — Families` };
}

export default async function FgroupDetailPage({ params }: PageProps) {
  const { fgroup } = await params;
  const decoded = decodeURIComponent(fgroup);
  const { members, pockets, proposals } = await getFamilyDetail(decoded);

  if (members.length === 0) notFound();

  const dsc = members.filter((m) => m.completeness === 'donor_strand_dependent').length;
  const self = members.filter((m) => m.completeness === 'self_complemented').length;
  const complete = members.filter((m) => m.completeness === 'complete').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/families" className="hover:text-gray-700 dark:hover:text-gray-200">Families</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white font-medium">{decoded}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{decoded}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{members.length} domains</span>
          <span className="text-orange-600 dark:text-orange-400">{dsc} DSC</span>
          <span className="text-teal-600 dark:text-teal-400">{self} self</span>
          <span className="text-green-600 dark:text-green-400">{complete} complete</span>
        </div>
      </div>

      {/* Pocket signatures */}
      {pockets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Pocket Signatures ({pockets.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2 text-left font-medium">Domain</th>
                  <th className="px-3 py-2 text-left font-medium">Pocket</th>
                  <th className="px-3 py-2 text-left font-medium">Nte Sequence</th>
                  <th className="px-3 py-2 text-left font-medium">Alternating</th>
                  <th className="px-3 py-2 text-left font-medium">% Hydrophobic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {pockets.map((p) => (
                  <tr key={p.domain_id} className="text-gray-700 dark:text-gray-300">
                    <td className="px-3 py-1.5">
                      <Link href={`/rescue/${p.domain_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {p.domain_id}
                      </Link>
                    </td>
                    <td className="px-3 py-1.5 font-mono font-semibold">{p.pocket_residues}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{p.nte_sequence}</td>
                    <td className="px-3 py-1.5">{p.is_alternating ? '\u2713' : ''}</td>
                    <td className="px-3 py-1.5">{(p.pct_hydrophobic * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reclassification proposals */}
      {proposals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Reclassification Candidates ({proposals.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2 text-left font-medium">Domain</th>
                  <th className="px-3 py-2 text-left font-medium">Pocket Score</th>
                  <th className="px-3 py-2 text-left font-medium">Matched</th>
                  <th className="px-3 py-2 text-left font-medium">Confidence</th>
                  <th className="px-3 py-2 text-left font-medium">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {proposals.map((rp) => (
                  <tr key={rp.domain_id} className="text-gray-700 dark:text-gray-300">
                    <td className="px-3 py-1.5">
                      <Link href={`/rescue/${rp.domain_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {rp.domain_id}
                      </Link>
                    </td>
                    <td className="px-3 py-1.5">{rp.pocket_score?.toFixed(2) ?? '-'}</td>
                    <td className="px-3 py-1.5">
                      {rp.matched_domain_id && (
                        <Link href={`/rescue/${rp.matched_domain_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {rp.matched_domain_id}
                        </Link>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        rp.confidence === 'strong' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : rp.confidence === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {rp.confidence}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 max-w-[300px] truncate">{rp.evidence_summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Members ({members.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-xs text-gray-500 dark:text-gray-400">
                <th className="px-3 py-2 text-left font-medium">Domain ID</th>
                <th className="px-3 py-2 text-left font-medium">Organism</th>
                <th className="px-3 py-2 text-left font-medium">Mono pLDDT</th>
                <th className="px-3 py-2 text-left font-medium">Dimer pLDDT</th>
                <th className="px-3 py-2 text-left font-medium">Delta</th>
                <th className="px-3 py-2 text-left font-medium">iPTM</th>
                <th className="px-3 py-2 text-left font-medium">Class</th>
                <th className="px-3 py-2 text-left font-medium">Completeness</th>
                <th className="px-3 py-2 text-left font-medium">DSC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {members.map((m) => (
                <tr key={m.domain_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-2">
                    <Link href={`/rescue/${m.domain_id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {m.domain_id}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 max-w-[150px] truncate">{m.organism}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{Number(m.mono_mean_plddt).toFixed(1)}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{Number(m.dimer_mean_plddt).toFixed(1)}</td>
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{Number(m.delta_mean_plddt).toFixed(1)}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{m.iptm != null ? Number(m.iptm).toFixed(3) : '-'}</td>
                  <td className="px-3 py-2"><RescueClassBadge rescueClass={m.rescue_class} /></td>
                  <td className="px-3 py-2">{m.completeness && <CompletenessBadge completeness={m.completeness} />}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{m.has_nte_to_body_dsc ? '\u2713' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
