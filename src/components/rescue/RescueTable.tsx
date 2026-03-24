'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import RescueClassBadge from './RescueClassBadge';
import Pagination from '@/components/ui/Pagination';
import type { RescueRow } from '@/lib/types';

interface RescueFilters {
  rescue_class?: string;
  f_group?: string;
  organism?: string;
  delta_min?: number;
  delta_max?: number;
}

interface RescueTableProps {
  initialRows: RescueRow[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialSortBy: string;
  initialSortDir: 'asc' | 'desc';
  initialFilters: RescueFilters;
}

const RESCUE_CLASSES = ['', 'strong', 'moderate', 'confident_dimer', 'weak', 'no_interaction'];

export default function RescueTable({
  initialRows,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialSortBy,
  initialSortDir,
  initialFilters,
}: RescueTableProps) {
  const router = useRouter();
  const [rescueClass, setRescueClass] = useState(initialFilters.rescue_class || '');
  const [fGroup, setFGroup] = useState(initialFilters.f_group || '');
  const [organism, setOrganism] = useState(initialFilters.organism || '');
  const [deltaMin, setDeltaMin] = useState(initialFilters.delta_min?.toString() || '');
  const [deltaMax, setDeltaMax] = useState(initialFilters.delta_max?.toString() || '');

  const buildUrl = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const values: Record<string, string | number | undefined> = {
      page: initialPage,
      sortBy: initialSortBy,
      sortDir: initialSortDir,
      rescue_class: rescueClass || undefined,
      f_group: fGroup || undefined,
      organism: organism || undefined,
      delta_min: deltaMin || undefined,
      delta_max: deltaMax || undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(values)) {
      if (v !== undefined && v !== '') params.set(k, String(v));
    }
    return `/rescue?${params.toString()}`;
  };

  const handleSort = (key: string) => {
    const newDir = initialSortBy === key && initialSortDir === 'desc' ? 'asc' : 'desc';
    router.push(buildUrl({ page: 1, sortBy: key, sortDir: newDir }));
  };

  const handleFilter = () => {
    router.push(buildUrl({ page: 1 }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page }));
  };

  const sortIndicator = (key: string) => {
    if (initialSortBy !== key) return null;
    return <span className="ml-1">{initialSortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  const thClass =
    'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none';

  return (
    <div>
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Rescue Class
            </label>
            <select
              value={rescueClass}
              onChange={(e) => setRescueClass(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {RESCUE_CLASSES.filter(Boolean).map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              F-group
            </label>
            <input
              type="text"
              value={fGroup}
              onChange={(e) => setFGroup(e.target.value)}
              placeholder="Filter by F-group"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Organism
            </label>
            <input
              type="text"
              value={organism}
              onChange={(e) => setOrganism(e.target.value)}
              placeholder="Filter by organism"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Delta pLDDT range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={deltaMin}
                onChange={(e) => setDeltaMin(e.target.value)}
                placeholder="Min"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={deltaMax}
                onChange={(e) => setDeltaMax(e.target.value)}
                placeholder="Max"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {initialTotal} result{initialTotal !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className={thClass} onClick={() => handleSort('domain_id')}>
                Domain ID{sortIndicator('domain_id')}
              </th>
              <th className={thClass} onClick={() => handleSort('organism')}>
                Organism{sortIndicator('organism')}
              </th>
              <th className={thClass} onClick={() => handleSort('f_group')}>
                F-group{sortIndicator('f_group')}
              </th>
              <th className={thClass} onClick={() => handleSort('mono_mean_plddt')}>
                Mono pLDDT{sortIndicator('mono_mean_plddt')}
              </th>
              <th className={thClass} onClick={() => handleSort('dimer_mean_plddt')}>
                Dimer pLDDT{sortIndicator('dimer_mean_plddt')}
              </th>
              <th className={thClass} onClick={() => handleSort('delta_mean_plddt')}>
                Delta pLDDT{sortIndicator('delta_mean_plddt')}
              </th>
              <th className={thClass} onClick={() => handleSort('iptm')}>
                iPTM{sortIndicator('iptm')}
              </th>
              <th className={thClass} onClick={() => handleSort('inter_chain_pae')}>
                Inter-chain PAE{sortIndicator('inter_chain_pae')}
              </th>
              <th className={thClass} onClick={() => handleSort('rescued_residues')}>
                Rescued Res{sortIndicator('rescued_residues')}
              </th>
              <th className={thClass} onClick={() => handleSort('rescue_class')}>
                Class{sortIndicator('rescue_class')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {initialRows.map((row) => (
              <tr
                key={row.domain_id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/rescue/${row.domain_id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {row.domain_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-[200px] truncate">
                  {row.organism}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.f_group}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {Number(row.mono_mean_plddt).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {Number(row.dimer_mean_plddt).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {Number(row.delta_mean_plddt).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.iptm != null ? Number(row.iptm).toFixed(3) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.inter_chain_pae != null ? Number(row.inter_chain_pae).toFixed(1) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.rescued_residues}
                </td>
                <td className="px-4 py-3 text-sm">
                  <RescueClassBadge rescueClass={row.rescue_class} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={initialPage}
        totalPages={initialTotalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
