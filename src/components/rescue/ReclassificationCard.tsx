import Link from 'next/link';
import type { ReclassificationProposal } from '@/lib/types';

interface ReclassificationCardProps {
  proposal: ReclassificationProposal;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  strong: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  weak: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function ReclassificationCard({ proposal: rp }: ReclassificationCardProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">Proposed F-group:</span>
        <Link
          href={`/families/${encodeURIComponent(rp.proposed_fgroup)}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {rp.proposed_fgroup}
        </Link>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CONFIDENCE_COLORS[rp.confidence] || CONFIDENCE_COLORS.weak}`}>
          {rp.confidence}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {rp.pocket_score != null && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Pocket Score</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{rp.pocket_score.toFixed(2)}</dd>
          </div>
        )}
        {rp.matched_domain_id && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Matched Domain</dt>
            <dd className="mt-1 text-sm">
              <Link href={`/rescue/${rp.matched_domain_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {rp.matched_domain_id}
              </Link>
            </dd>
          </div>
        )}
        {rp.dali_zscore != null && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">DALI Z-score</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{rp.dali_zscore.toFixed(1)}</dd>
          </div>
        )}
        {rp.dali_rmsd != null && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">RMSD / Nalign</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{rp.dali_rmsd.toFixed(1)} &Aring; / {rp.dali_nalign}</dd>
          </div>
        )}
      </div>

      {rp.evidence_summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{rp.evidence_summary}</p>
      )}
    </div>
  );
}
