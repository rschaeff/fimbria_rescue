import type { PocketSignature } from '@/lib/types';

interface PocketSignatureCardProps {
  pocket: PocketSignature;
}

export default function PocketSignatureCard({ pocket }: PocketSignatureCardProps) {
  const donorSet = new Set(pocket.donor_positions);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Pocket Residues</dt>
          <dd className="mt-1 text-lg font-mono font-semibold text-gray-900 dark:text-white">{pocket.pocket_residues}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Pocket Length</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{pocket.pocket_length}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Spacing</dt>
          <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
            {pocket.spacing_pattern?.join(', ') || '-'}
            {pocket.is_alternating && (
              <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                alternating
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">% Hydrophobic</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {(pocket.pct_hydrophobic * 100).toFixed(0)}%
          </dd>
        </div>
      </div>

      <div>
        <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Nte Sequence ({pocket.nte_start}-{pocket.nte_end})
        </dt>
        <dd className="font-mono text-base leading-relaxed">
          {pocket.nte_sequence.split('').map((aa, i) => {
            const pos = pocket.nte_start + i;
            const isDonor = donorSet.has(pos);
            return (
              <span
                key={i}
                className={isDonor
                  ? 'font-bold text-orange-600 dark:text-orange-400 underline'
                  : 'text-gray-500 dark:text-gray-400'
                }
                title={`Position ${pos}${isDonor ? ' (donor)' : ''}`}
              >
                {aa}
              </span>
            );
          })}
        </dd>
      </div>
    </div>
  );
}
