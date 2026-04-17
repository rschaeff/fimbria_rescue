'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PfamClanRow } from '@/lib/types';

interface PfamClanTableProps {
  rows: PfamClanRow[];
}

export default function PfamClanTable({ rows }: PfamClanTableProps) {
  const [hasFgroupFilter, setHasFgroupFilter] = useState('');
  const [inFimbriaFilter, setInFimbriaFilter] = useState('');
  const [sortBy, setSortBy] = useState<'pfam_acc' | 'fimbria_domain_count' | 'pfam_short_name'>('pfam_acc');

  const filtered = rows
    .filter((r) => !hasFgroupFilter || (hasFgroupFilter === 'yes' ? r.has_fgroup_mapping : !r.has_fgroup_mapping))
    .filter((r) => !inFimbriaFilter || (inFimbriaFilter === 'yes' ? r.fimbria_domain_count > 0 : r.fimbria_domain_count === 0))
    .sort((a, b) => {
      if (sortBy === 'fimbria_domain_count') return b.fimbria_domain_count - a.fimbria_domain_count;
      if (sortBy === 'pfam_short_name') return a.pfam_short_name.localeCompare(b.pfam_short_name);
      return a.pfam_acc.localeCompare(b.pfam_acc);
    });

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Has ECOD F-group</label>
          <select value={hasFgroupFilter} onChange={(e) => setHasFgroupFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">In fimbria set</label>
          <select value={inFimbriaFilter} onChange={(e) => setInFimbriaFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm">
            <option value="pfam_acc">Accession</option>
            <option value="fimbria_domain_count">Domain count</option>
            <option value="pfam_short_name">Name</option>
          </select>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 self-end">
          {filtered.length} famil{filtered.length === 1 ? 'y' : 'ies'}
        </span>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-xs text-gray-500 dark:text-gray-400">
              <th className="px-3 py-2 text-left font-medium uppercase tracking-wider">Pfam</th>
              <th className="px-3 py-2 text-left font-medium uppercase tracking-wider">Short Name</th>
              <th className="px-3 py-2 text-left font-medium uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left font-medium uppercase tracking-wider">ECOD F-group(s)</th>
              <th className="px-3 py-2 text-left font-medium uppercase tracking-wider">Fimbria</th>
              <th className="px-3 py-2 text-left font-medium uppercase tracking-wider">Breakdown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((r) => {
              const total = r.dsc + r.probable_dimer + r.probable_monomer;
              const pctDsc = total > 0 ? (r.dsc / total) * 100 : 0;
              const pctPD = total > 0 ? (r.probable_dimer / total) * 100 : 0;
              const pctPM = total > 0 ? (r.probable_monomer / total) * 100 : 0;
              return (
                <tr key={r.pfam_acc} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${r.out_of_tgroup ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                  <td className="px-3 py-2">
                    <a href={`https://www.ebi.ac.uk/interpro/entry/pfam/${r.pfam_acc}/`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-mono">
                      {r.pfam_acc}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{r.pfam_short_name}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[300px] truncate" title={r.pfam_description || undefined}>
                    {r.pfam_description || '-'}
                  </td>
                  <td className="px-3 py-2">
                    {r.ecod_fgroups ? (
                      <div className="flex flex-wrap gap-1">
                        {r.ecod_fgroups.split(', ').map((fg) => (
                          <Link key={fg} href={`/families/${encodeURIComponent(fg)}`}
                            className={`text-xs px-1.5 py-0.5 rounded font-mono ${fg.startsWith('11.1.5.') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:underline' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                            {fg}
                          </Link>
                        ))}
                      </div>
                    ) : <span className="text-gray-400 italic">none</span>}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{r.fimbria_domain_count}</td>
                  <td className="px-3 py-2">
                    {total > 0 ? (
                      <div className="flex h-4 w-32 rounded overflow-hidden bg-gray-200 dark:bg-gray-700" title={`DSC ${r.dsc} / PD ${r.probable_dimer} / PM ${r.probable_monomer}`}>
                        {r.dsc > 0 && <div style={{ width: `${pctDsc}%` }} className="bg-orange-400" />}
                        {r.probable_dimer > 0 && <div style={{ width: `${pctPD}%` }} className="bg-blue-400" />}
                        {r.probable_monomer > 0 && <div style={{ width: `${pctPM}%` }} className="bg-green-400" />}
                      </div>
                    ) : <span className="text-gray-400 text-xs">-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
