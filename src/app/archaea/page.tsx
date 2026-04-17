import Link from 'next/link';
import { getArchaeaDomains, getArchaeaHeterodimers, getStats } from '@/lib/queries';
import RescueClassBadge from '@/components/rescue/RescueClassBadge';
import CompletenessBadge from '@/components/rescue/CompletenessBadge';
import HeterodimerTable from '@/components/heterodimers/HeterodimerTable';
import CompletenessDonut from '@/components/landing/CompletenessDonut';

export default async function ArchaeaPage() {
  const [domains, heterodimers, stats] = await Promise.all([
    getArchaeaDomains(),
    getArchaeaHeterodimers(),
    getStats(),
  ]);

  // Organism breakdown
  const organismCounts = new Map<string, number>();
  for (const d of domains) {
    organismCounts.set(d.organism, (organismCounts.get(d.organism) || 0) + 1);
  }

  const dsc = domains.filter((d) => d.completeness === 'donor_strand_dependent').length;
  const probableDimer = domains.filter((d) => d.completeness === 'probable_dimer').length;
  const probableMonomer = domains.filter((d) => d.completeness === 'probable_monomer').length;

  const pctDsc = domains.length > 0 ? Math.round((dsc / domains.length) * 100) : 0;
  const bacterialDsc = stats.bacterial_completeness.find((c) => c.completeness === 'donor_strand_dependent')?.count || 0;
  const bacterialPctDsc = stats.bacterial_domains > 0 ? Math.round((bacterialDsc / stats.bacterial_domains) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Archaeal Domains
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">
        These {domains.length} domains come from 4 archaeal species (4 hyperthermophiles).
        Archaea have no chaperone-usher pathway, so any donor strand complementation here
        represents convergent evolution.
      </p>

      {/* Summary row: donut + organism breakdown + bacterial comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Completeness</h2>
          <CompletenessDonut classes={stats.archaeal_completeness} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Organisms</h2>
          <div className="space-y-2">
            {Array.from(organismCounts.entries())
              .sort(([, a], [, b]) => b - a)
              .map(([org, count]) => (
                <div key={org} className="flex justify-between items-center text-sm">
                  <span className="italic text-gray-700 dark:text-gray-300">{org}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cross-Kingdom</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">% DSC (Archaea)</dt>
              <dd className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pctDsc}%</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">% DSC (Bacteria)</dt>
              <dd className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bacterialPctDsc}%</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Key findings callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-1">Convergent DSC</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {dsc}/{domains.length} ({pctDsc}%) archaeal domains show DSC, comparable to {bacterialPctDsc}% in bacteria.
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">M. jannaschii operon</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Q58788 adjacent domains show CU-pilus-like directional strand exchange between genes in a single operon.
          </p>
        </div>
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-1">A. fulgidus strand swapping</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            O28251 adjacent domains show mutual inter-domain strand exchange.
          </p>
        </div>
      </div>

      {/* Domain table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Archaeal Domains ({domains.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-xs text-gray-500 dark:text-gray-400">
                <th className="px-3 py-2 text-left font-medium">Domain ID</th>
                <th className="px-3 py-2 text-left font-medium">Organism</th>
                <th className="px-3 py-2 text-left font-medium">F-group</th>
                <th className="px-3 py-2 text-left font-medium">Mono pLDDT</th>
                <th className="px-3 py-2 text-left font-medium">Dimer pLDDT</th>
                <th className="px-3 py-2 text-left font-medium">Delta</th>
                <th className="px-3 py-2 text-left font-medium">iPTM</th>
                <th className="px-3 py-2 text-left font-medium">Class</th>
                <th className="px-3 py-2 text-left font-medium">Completeness</th>
                <th className="px-3 py-2 text-left font-medium">DSC</th>
                <th className="px-3 py-2 text-left font-medium">Nte H-bonds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {domains.map((d) => (
                <tr key={d.domain_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-2">
                    <Link href={`/rescue/${d.domain_id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {d.domain_id}
                    </Link>
                  </td>
                  <td className="px-3 py-2 italic text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{d.organism}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{d.f_group}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{Number(d.mono_mean_plddt).toFixed(1)}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{Number(d.dimer_mean_plddt).toFixed(1)}</td>
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{Number(d.delta_mean_plddt).toFixed(1)}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{d.iptm != null ? Number(d.iptm).toFixed(3) : '-'}</td>
                  <td className="px-3 py-2"><RescueClassBadge rescueClass={d.rescue_class} /></td>
                  <td className="px-3 py-2">{d.completeness && <CompletenessBadge completeness={d.completeness} />}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{d.has_nte_to_body_dsc ? '\u2713' : ''}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{d.nte_to_body_hbonds ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heterodimers */}
      {heterodimers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Archaeal Heterodimer Pairs ({heterodimers.length})
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Inter-domain strand exchange between archaeal domain pairs.
          </p>
          <HeterodimerTable rows={heterodimers} showFilters={false} />
        </div>
      )}
    </div>
  );
}
