'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import type { ResiduePlddt } from '@/lib/types';

interface PlddtChartProps {
  monomer: ResiduePlddt[];
  dimer: ResiduePlddt[];
}

export default function PlddtChart({ monomer, dimer }: PlddtChartProps) {
  const monoMap = new Map(monomer.map((r) => [r.residue_index, r.plddt]));
  const dimerMap = new Map(dimer.map((r) => [r.residue_index, r.plddt]));

  // Collect all residue indices from both datasets (0-based from DB)
  const allIndices = new Set([...monoMap.keys(), ...dimerMap.keys()]);
  const data = Array.from(allIndices)
    .sort((a, b) => a - b)
    .map((idx) => ({
      residue: idx + 1, // display as 1-based
      monomer: monoMap.get(idx) ?? null,
      dimer: dimerMap.get(idx) ?? null,
    }));

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No pLDDT data available.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="residue"
          label={{ value: 'Residue Index', position: 'insideBottom', offset: -10 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          domain={[0, 100]}
          label={{ value: 'pLDDT', angle: -90, position: 'insideLeft' }}
          tick={{ fontSize: 12 }}
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
            name === 'monomer' ? 'Monomer' : 'Dimer (chain A)',
          ]}
        />
        <Legend />
        <ReferenceLine
          y={50}
          stroke="#ef4444"
          strokeDasharray="5 5"
          label={{ value: 'Disorder threshold', position: 'right', fontSize: 11 }}
        />
        <Line
          type="monotone"
          dataKey="monomer"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="Monomer"
        />
        <Line
          type="monotone"
          dataKey="dimer"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          name="Dimer (chain A)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
