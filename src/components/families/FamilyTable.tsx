'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FamilyRow } from '@/lib/types';

interface FamilyTableProps {
  families: FamilyRow[];
}

export default function FamilyTable({ families }: FamilyTableProps) {
  const [minCount, setMinCount] = useState(4);
  const [dscOnly, setDscOnly] = useState(false);
  const [sortBy, setSortBy] = useState<keyof FamilyRow>('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = families
    .filter((f) => f.total >= minCount)
    .filter((f) => !dscOnly || f.dsc > 0)
    .sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'desc' ? bv - av : av - bv;
      }
      return sortDir === 'desc'
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });

  const handleSort = (key: keyof FamilyRow) => {
    if (sortBy === key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSortBy(key); setSortDir('desc'); }
  };

  const thClass = 'px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none';
  const indicator = (key: keyof FamilyRow) => sortBy === key ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Min domains:</label>
          <input
            type="range" min={1} max={20} value={minCount}
            onChange={(e) => setMinCount(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6">{minCount}</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input type="checkbox" checked={dscOnly} onChange={(e) => setDscOnly(e.target.checked)} className="rounded" />
          DSC only
        </label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} F-group{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className={thClass} onClick={() => handleSort('f_group')}>F-group{indicator('f_group')}</th>
              <th className={thClass} onClick={() => handleSort('total')}>Total{indicator('total')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Breakdown</th>
              <th className={thClass} onClick={() => handleSort('pct_dsc')}>% DSC{indicator('pct_dsc')}</th>
              <th className={thClass} onClick={() => handleSort('avg_iptm')}>Avg iPTM{indicator('avg_iptm')}</th>
              <th className={thClass} onClick={() => handleSort('avg_delta')}>Avg Delta{indicator('avg_delta')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((f) => (
              <tr key={f.f_group} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-3 py-2 text-sm">
                  <Link href={`/families/${encodeURIComponent(f.f_group)}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    {f.f_group}
                  </Link>
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{f.total}</td>
                <td className="px-3 py-2">
                  <div className="flex h-4 w-32 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {f.dsc > 0 && <div style={{ width: `${f.pct_dsc}%` }} className="bg-orange-400" title={`DSC: ${f.dsc}`} />}
                    {f.probable_dimer > 0 && <div style={{ width: `${f.pct_probable_dimer}%` }} className="bg-blue-400" title={`Probable dimer: ${f.probable_dimer}`} />}
                    {f.probable_monomer > 0 && <div style={{ width: `${f.pct_probable_monomer}%` }} className="bg-green-400" title={`Probable monomer: ${f.probable_monomer}`} />}
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{f.pct_dsc}%</td>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{f.avg_iptm.toFixed(3)}</td>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{f.avg_delta.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
