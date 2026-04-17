'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { FamilyRow } from '@/lib/types';

interface FamilyBarChartProps {
  families: FamilyRow[];
}

export default function FamilyBarChart({ families }: FamilyBarChartProps) {
  const data = families
    .sort((a, b) => b.pct_dsc - a.pct_dsc)
    .map((f) => ({
      name: f.f_group.length > 12 ? f.f_group.slice(0, 12) + '...' : f.f_group,
      fullName: f.f_group,
      DSC: f.dsc,
      'Prob. Dimer': f.probable_dimer,
      'Prob. Monomer': f.probable_monomer,
    }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 60, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          interval={0}
          height={80}
        />
        <YAxis tick={{ fontSize: 11 }} label={{ value: 'Domains', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
        />
        <Legend verticalAlign="top" />
        <Bar dataKey="DSC" stackId="a" fill="#f97316" />
        <Bar dataKey="Prob. Dimer" stackId="a" fill="#3b82f6" />
        <Bar dataKey="Prob. Monomer" stackId="a" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
