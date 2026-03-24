import Link from 'next/link';
import { getStats } from '@/lib/queries';

const RESCUE_CLASS_COLORS: Record<string, string> = {
  strong: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  confident_dimer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  weak: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  no_interaction: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

export default async function HomePage() {
  const stats = await getStats();

  const rescueTotal = stats.rescue_classes.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.total_targets}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Targets</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.completed_predictions}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed Predictions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {rescueTotal}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rescue Analyses</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Rescue Classification
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {stats.rescue_classes
            .sort((a, b) => b.count - a.count)
            .map((rc) => (
              <div key={rc.rescue_class} className="text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    RESCUE_CLASS_COLORS[rc.rescue_class] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {rc.rescue_class.replace('_', ' ')}
                </span>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {rc.count}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/rescue"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Browse Rescue Results
        </Link>
        <Link
          href="/literature"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          View Literature
        </Link>
      </div>
    </div>
  );
}
