'use client';

import { useState } from 'react';
import type { InterChainHbond } from '@/lib/types';

interface HbondTableProps {
  hbonds: InterChainHbond[];
}

export default function HbondTable({ hbonds }: HbondTableProps) {
  const [expanded, setExpanded] = useState(false);

  if (hbonds.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No inter-chain H-bonds detected.</p>;
  }

  const displayed = expanded ? hbonds : hbonds.slice(0, 10);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400">
              <th className="px-3 py-2 text-left font-medium">Donor</th>
              <th className="px-3 py-2 text-left font-medium">Acceptor</th>
              <th className="px-3 py-2 text-left font-medium">N-O Dist (&Aring;)</th>
              <th className="px-3 py-2 text-left font-medium">C=O...N Angle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayed.map((hb, i) => (
              <tr key={i} className="text-gray-700 dark:text-gray-300">
                <td className="px-3 py-1.5 font-mono text-xs">
                  {hb.donor_chain}:{hb.donor_name} {hb.donor_res}
                </td>
                <td className="px-3 py-1.5 font-mono text-xs">
                  {hb.acceptor_chain}:{hb.acceptor_name} {hb.acceptor_res}
                </td>
                <td className="px-3 py-1.5">{hb.no_distance.toFixed(2)}</td>
                <td className="px-3 py-1.5">{hb.co_n_angle.toFixed(1)}&deg;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hbonds.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {expanded ? 'Show less' : `Show all ${hbonds.length} H-bonds`}
        </button>
      )}
    </div>
  );
}
