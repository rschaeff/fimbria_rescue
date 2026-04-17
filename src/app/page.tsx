import Link from 'next/link';
import { getStats } from '@/lib/queries';
import CompletenessDonut from '@/components/landing/CompletenessDonut';

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Fimbrial Domain Rescue Browser
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Exploring structural rescue of fimbrial protein domains through homodimer
          AlphaFold predictions. Domains that are disordered as monomers may fold
          correctly when predicted as homodimers, reflecting their biological
          assembly in the chaperone/usher pathway.
        </p>
      </div>

      {/* Headline stats + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total_domains}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Domains Analyzed</div>
            <div className="text-xs text-gray-400 mt-0.5">{stats.bacterial_domains} bacterial &middot; {stats.archaeal_domains} archaeal</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total_hbonds.toLocaleString()}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Inter-chain H-bonds</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.dsc_count}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">DSC Detected</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{stats.confident_dimers}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Confident Dimers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.heterodimer_total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Heterodimer Pairs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.heterodimer_confident}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Confident Interactions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Domain Completeness</h2>
          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">Bacterial ({stats.bacterial_domains})</div>
          <CompletenessDonut classes={stats.bacterial_completeness} />
          {stats.archaeal_domains > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">Archaeal ({stats.archaeal_domains})</div>
              <CompletenessDonut classes={stats.archaeal_completeness} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <Link
          href="/rescue"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
            Browse Domains
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sortable, filterable table of all rescue analysis results with completeness and H-bond data.
          </p>
        </Link>
        <Link
          href="/families"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
            Family Classification
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Completeness breakdown by ECOD F-group with pocket signatures and reclassification proposals.
          </p>
        </Link>
        <Link
          href="/pfam-clan"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
            Pfam Clan Lookup
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inverse perspective: CL0204 Adhesin clan → ECOD mapping with boundary disagreement analysis.
          </p>
        </Link>
        <Link
          href="/heterodimers"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
            Heterodimer Interactions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cross-domain dimer predictions testing DSC vs lateral packing assembly modes.
          </p>
        </Link>
        <Link
          href="/archaea"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
            Archaeal Domains
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cross-kingdom comparison: 16 archaeal Ig-like domains showing convergent donor strand complementation.
          </p>
        </Link>
        <Link
          href="/literature"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
            Literature
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Related papers on chaperone/usher pathway fimbriae and donor strand complementation.
          </p>
        </Link>
      </div>
    </div>
  );
}
