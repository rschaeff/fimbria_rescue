'use client';

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  ComposedChart,
} from 'recharts';
import type { ResiduePlddt } from '@/lib/types';

interface ProteinPlddtChartProps {
  monomer: ResiduePlddt[];
  dimer: ResiduePlddt[];
  domainRange: string; // e.g. "21-210"
}

function parseDomainRange(range: string): { start: number; end: number } | null {
  const match = range.match(/(\d+)-(\d+)/);
  if (!match) return null;
  return { start: parseInt(match[1]), end: parseInt(match[2]) };
}

export default function ProteinPlddtChart({ monomer, dimer, domainRange }: ProteinPlddtChartProps) {
  const monoMap = new Map(monomer.map((r) => [r.residue_index, r.plddt]));
  const dimerMap = new Map(dimer.map((r) => [r.residue_index, r.plddt]));

  const allIndices = new Set([...monoMap.keys(), ...dimerMap.keys()]);
  const data = Array.from(allIndices)
    .sort((a, b) => a - b)
    .map((idx) => ({
      residue: idx + 1,
      monomer: monoMap.get(idx) ?? null,
      dimer: dimerMap.get(idx) ?? null,
    }));

  const domain = parseDomainRange(domainRange);

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No protein-level pLDDT data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="residue"
          label={{ value: 'Protein Residue', position: 'insideBottomRight', offset: 0 }}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          domain={[0, 100]}
          label={{ value: 'pLDDT', angle: -90, position: 'insideLeft' }}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#f3f4f6',
          }}
          formatter={(value, name) => [
            typeof value === 'number' ? value.toFixed(1) : '-',
            String(name),
          ]}
        />
        <Legend verticalAlign="top" />
        <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" />
        {domain && (
          <ReferenceArea
            x1={domain.start}
            x2={domain.end}
            fill="#3b82f6"
            fillOpacity={0.1}
            label={{ value: 'Domain', position: 'insideTop', fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="monomer"
          stroke="#93c5fd"
          strokeWidth={1.5}
          dot={false}
          name="Protein Monomer"
        />
        {dimer.length > 0 && (
          <Line
            type="monotone"
            dataKey="dimer"
            stroke="#fca5a5"
            strokeWidth={1.5}
            dot={false}
            name="Protein Dimer (chain A)"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
