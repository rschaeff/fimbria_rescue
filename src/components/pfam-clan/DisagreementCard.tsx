import type { PfamClanDisagreement } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  no_fgroup: 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800',
  out_of_tgroup: 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
  sparse_coverage: 'border-gray-300 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-700',
};

const TYPE_LABELS: Record<string, string> = {
  no_fgroup: 'No ECOD F-group',
  out_of_tgroup: 'Out of T-group 11.1.5',
  sparse_coverage: 'Sparse coverage',
};

interface DisagreementCardProps {
  disagreements: PfamClanDisagreement[];
  type: PfamClanDisagreement['type'];
}

export default function DisagreementCard({ disagreements, type }: DisagreementCardProps) {
  const items = disagreements.filter((d) => d.type === type);
  if (items.length === 0) return null;

  return (
    <div className={`border rounded-lg p-4 ${TYPE_COLORS[type]}`}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        {TYPE_LABELS[type]} ({items.length})
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        {items[0].proposed_action}
      </p>
      <ul className="space-y-1.5">
        {items.map((d) => (
          <li key={d.pfam_acc + (d.out_of_tgroup_fgroup || '')} className="text-sm">
            <a href={`https://www.ebi.ac.uk/interpro/entry/pfam/${d.pfam_acc}/`}
              target="_blank" rel="noopener noreferrer"
              className="font-mono text-blue-600 dark:text-blue-400 hover:underline">
              {d.pfam_acc}
            </a>
            <span className="text-gray-700 dark:text-gray-300 ml-2">{d.pfam_short_name}</span>
            {d.out_of_tgroup_fgroup && (
              <span className="text-red-600 dark:text-red-400 ml-2 text-xs font-mono">
                → {d.out_of_tgroup_fgroup}
              </span>
            )}
            {d.pfam_description && (
              <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                {d.pfam_description}
              </span>
            )}
            {d.fimbria_count > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                · {d.fimbria_count} fimbria domain{d.fimbria_count !== 1 ? 's' : ''}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
