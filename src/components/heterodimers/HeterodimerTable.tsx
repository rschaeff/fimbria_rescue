'use client';

import { useState } from 'react';
import Link from 'next/link';
import AssemblyModeBadge from '@/components/rescue/AssemblyModeBadge';
import CompletenessBadge from '@/components/rescue/CompletenessBadge';
import type { HeterodimerRow } from '@/lib/types';

interface HeterodimerTableProps {
  rows: HeterodimerRow[];
  showFilters?: boolean;
}

function iptmColor(v: number): string {
  if (v >= 0.5) return 'text-green-600 dark:text-green-400 font-semibold';
  if (v >= 0.3) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

export default function HeterodimerTable({ rows, showFilters = true }: HeterodimerTableProps) {
  const [modeFilter, setModeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState<string>('iptm');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = rows
    .filter((r) => !modeFilter || r.assembly_mode === modeFilter)
    .filter((r) => !priorityFilter || String(r.priority) === priorityFilter)
    .sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortBy];
      const bv = (b as unknown as Record<string, unknown>)[sortBy];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'desc' ? bv - av : av - bv;
      return sortDir === 'desc' ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });

  const handleSort = (key: string) => {
    if (sortBy === key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSortBy(key); setSortDir('desc'); }
  };

  const thClass = 'px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none';
  const ind = (k: string) => sortBy === k ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Assembly Mode</label>
            <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm">
              <option value="">All</option>
              <option value="DSC">DSC</option>
              <option value="Lateral">Lateral</option>
              <option value="None">None</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm">
              <option value="">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 self-end">
            {filtered.length} pair{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className={thClass} onClick={() => handleSort('pair_name')}>Pair{ind('pair_name')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Domain A</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Domain B</th>
              <th className={thClass} onClick={() => handleSort('iptm')}>iPTM{ind('iptm')}</th>
              <th className={thClass} onClick={() => handleSort('inter_chain_pae')}>PAE{ind('inter_chain_pae')}</th>
              <th className={thClass} onClick={() => handleSort('assembly_mode')}>Mode{ind('assembly_mode')}</th>
              <th className={thClass} onClick={() => handleSort('exchange_type')}>Exchange{ind('exchange_type')}</th>
              <th className={thClass} onClick={() => handleSort('total_inter_hbonds')}>H-bonds{ind('total_inter_hbonds')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CIF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{r.pair_name}</td>
                <td className="px-3 py-2 text-sm">
                  <Link href={`/rescue/${r.domain_a}`} className="text-blue-600 dark:text-blue-400 hover:underline">{r.domain_a}</Link>
                  {r.comp_a && <span className="ml-1"><CompletenessBadge completeness={r.comp_a} /></span>}
                </td>
                <td className="px-3 py-2 text-sm">
                  <Link href={`/rescue/${r.domain_b}`} className="text-blue-600 dark:text-blue-400 hover:underline">{r.domain_b}</Link>
                  {r.comp_b && <span className="ml-1"><CompletenessBadge completeness={r.comp_b} /></span>}
                </td>
                <td className={`px-3 py-2 text-sm ${iptmColor(r.iptm)}`}>{Number(r.iptm).toFixed(3)}</td>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{Number(r.inter_chain_pae).toFixed(1)}</td>
                <td className="px-3 py-2 text-sm"><AssemblyModeBadge mode={r.assembly_mode} /></td>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{r.exchange_type.replace(/_/g, ' ')}</td>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{r.total_inter_hbonds}</td>
                <td className="px-3 py-2 text-sm">
                  {r.model_cif_path && (
                    <a href={`/api/heterodimers/${r.id}/structure`} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
                      Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
