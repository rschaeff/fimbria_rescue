'use client';

import { useState } from 'react';
import type { ResiduePlddt } from '@/lib/types';

interface SequenceViewerProps {
  sequence: string;
  monomerPlddts: ResiduePlddt[];
  dimerPlddts: ResiduePlddt[];
}

function plddtColor(plddt: number | undefined): string {
  if (plddt == null) return '#9ca3af';
  if (plddt < 50) return '#ef4444';
  if (plddt < 70) return '#f5f5f5';
  return '#3b82f6';
}

function plddtBgClass(plddt: number | undefined): string {
  if (plddt == null) return 'bg-gray-400';
  if (plddt < 50) return 'bg-red-400';
  if (plddt < 70) return 'bg-gray-200 dark:bg-gray-600';
  return 'bg-blue-400';
}

export default function SequenceViewer({
  sequence,
  monomerPlddts,
  dimerPlddts,
}: SequenceViewerProps) {
  const [colorBy, setColorBy] = useState<'monomer' | 'dimer'>('dimer');
  const plddtMap = new Map(
    (colorBy === 'monomer' ? monomerPlddts : dimerPlddts).map((r) => [
      r.residue_index,
      r.plddt,
    ])
  );

  const residues = sequence.split('');
  const chunkSize = 60;
  const chunks: string[][] = [];
  for (let i = 0; i < residues.length; i += chunkSize) {
    chunks.push(residues.slice(i, i + chunkSize));
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm text-gray-600 dark:text-gray-400">Color by:</label>
        <select
          value={colorBy}
          onChange={(e) => setColorBy(e.target.value as 'monomer' | 'dimer')}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 text-sm"
        >
          <option value="monomer">Monomer pLDDT</option>
          <option value="dimer">Dimer pLDDT</option>
        </select>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-block w-3 h-3 bg-red-400 rounded" /> &lt;50
          <span className="inline-block w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded" /> 50-70
          <span className="inline-block w-3 h-3 bg-blue-400 rounded" /> &gt;70
        </div>
      </div>
      <div className="font-mono text-xs leading-6 overflow-x-auto">
        {chunks.map((chunk, ci) => (
          <div key={ci} className="flex items-center">
            <span className="text-gray-400 w-8 text-right mr-2 select-none">
              {ci * chunkSize + 1}
            </span>
            <span>
              {chunk.map((aa, ri) => {
                const idx = ci * chunkSize + ri; // 0-based to match DB
                const plddt = plddtMap.get(idx);
                return (
                  <span
                    key={ri}
                    className={`${plddtBgClass(plddt)} px-[1px] rounded-sm`}
                    title={`${idx}: ${aa} (pLDDT: ${plddt?.toFixed(1) ?? 'N/A'})`}
                  >
                    {aa}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
