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

  return (
    <div>
      {/* Filters and sort controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
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
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Sort by
          </label>
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split('-') as ['year' | 'title', 'asc' | 'desc'];
              setSortBy(key);
              setSortDir(dir);
            }}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
          >
            <option value="year-desc">Year (newest first)</option>
            <option value="year-asc">Year (oldest first)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 self-end">
          {filtered.length} paper{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Card list */}
      <div className="space-y-4">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5"
          >
            {/* Title */}
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${entry.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-base leading-snug"
            >
              {entry.title}
            </a>

            {/* Metadata line */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <span>{abbreviateAuthors(entry.authors)}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="italic">{entry.journal}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span>{entry.year}</span>
              <RelevanceBadge relevance={entry.relevance} />
              {entry.doi && (
                <a
                  href={`https://doi.org/${entry.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  DOI
                </a>
              )}
            </div>

            {/* Notes */}
            {entry.notes && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {entry.notes}
              </p>
            )}

            {/* Expandable abstract */}
            {entry.abstract && (
              <div className="mt-2">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === entry.id ? null : entry.id)
                  }
                  className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {expandedId === entry.id ? 'hide abstract' : 'show abstract'}
                </button>
                {expandedId === entry.id && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {entry.abstract}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
