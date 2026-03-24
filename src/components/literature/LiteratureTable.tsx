'use client';

import { useState } from 'react';
import RelevanceBadge from './RelevanceBadge';
import type { LiteratureEntry } from '@/lib/types';

interface LiteratureTableProps {
  data: LiteratureEntry[];
}

const RELEVANCE_OPTIONS = ['', 'direct', 'review', 'methods', 'background'];

function abbreviateAuthors(authors: string): string {
  const parts = authors.split(',');
  if (parts.length <= 2) return authors;
  return `${parts[0].trim()} et al.`;
}

export default function LiteratureTable({ data }: LiteratureTableProps) {
  const [relevanceFilter, setRelevanceFilter] = useState('');
  const [sortBy, setSortBy] = useState<'year' | 'title'>('year');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = data
    .filter((entry) => !relevanceFilter || entry.relevance === relevanceFilter)
    .sort((a, b) => {
      const cmp =
        sortBy === 'year'
          ? a.year - b.year
          : a.title.localeCompare(b.title);
      return sortDir === 'desc' ? -cmp : cmp;
    });

  const handleSort = (key: 'year' | 'title') => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir(key === 'year' ? 'desc' : 'asc');
    }
  };

  const sortIndicator = (key: string) => {
    if (sortBy !== key) return null;
    return <span className="ml-1">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Relevance
          </label>
          <select
            value={relevanceFilter}
            onChange={(e) => setRelevanceFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {RELEVANCE_OPTIONS.filter(Boolean).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 self-end">
          {filtered.length} paper{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                onClick={() => handleSort('title')}
              >
                Title{sortIndicator('title')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Authors
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Journal
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                onClick={() => handleSort('year')}
              >
                Year{sortIndicator('year')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Relevance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((entry) => (
              <tr
                key={entry.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 text-sm min-w-[300px]">
                  <div>
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${entry.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {entry.title}
                    </a>
                    {entry.doi && (
                      <a
                        href={`https://doi.org/${entry.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-gray-400 hover:text-gray-600"
                      >
                        DOI
                      </a>
                    )}
                    {entry.abstract && (
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === entry.id ? null : entry.id)
                        }
                        className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                      >
                        {expandedId === entry.id ? 'hide abstract' : 'show abstract'}
                      </button>
                    )}
                    {expandedId === entry.id && entry.abstract && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {entry.abstract}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {abbreviateAuthors(entry.authors)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 italic whitespace-nowrap">
                  {entry.journal}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {entry.year}
                </td>
                <td className="px-4 py-3 text-sm">
                  <RelevanceBadge relevance={entry.relevance} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                  {entry.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
