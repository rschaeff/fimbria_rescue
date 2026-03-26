import CompletenessBadge from './CompletenessBadge';
import type { DomainCompleteness } from '@/lib/types';

interface CompletenessCardProps {
  completeness: DomainCompleteness;
}

export default function CompletenessCard({ completeness: dc }: CompletenessCardProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CompletenessBadge completeness={dc.completeness} />
        {dc.curator_reviewed && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Curator reviewed</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">ECOD Range</dt>
          <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-gray-100">{dc.ecod_range}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Proposed Complete Range</dt>
          <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-gray-100">{dc.complete_range || dc.ecod_range}</dd>
        </div>
      </div>

      {dc.has_donor_strand && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Donor Strand</dt>
            <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-gray-100">
              {dc.donor_strand_chain}:{dc.donor_strand_range}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">H-bonds</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{dc.donor_strand_hbonds}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Body Acceptor</dt>
            <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-gray-100">{dc.body_acceptor_range || '-'}</dd>
          </div>
        </div>
      )}

      {dc.evidence_summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {dc.evidence_summary}
        </p>
      )}

      {dc.curator_notes && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <dt className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Curator Notes</dt>
          <dd className="text-sm text-gray-700 dark:text-gray-300">{dc.curator_notes}</dd>
        </div>
      )}
    </div>
  );
}
