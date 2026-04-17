'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CompletenessDonutProps {
  classes: { completeness: string; count: number }[];
}

const COLORS: Record<string, string> = {
  donor_strand_dependent: '#f97316',
  probable_dimer: '#3b82f6',
  probable_monomer: '#22c55e',
  unknown: '#9ca3af',
};

const LABELS: Record<string, string> = {
  donor_strand_dependent: 'DSC',
  probable_dimer: 'Prob. Dimer',
  probable_monomer: 'Prob. Monomer',
  unknown: 'Unknown',
};

export default function CompletenessDonut({ classes }: CompletenessDonutProps) {
  const data = classes.map((c) => ({
    name: LABELS[c.completeness] || c.completeness,
    value: c.count,
    fill: COLORS[c.completeness] || '#9ca3af',
  }));

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value} (${total > 0 ? ((Number(value) / total) * 100).toFixed(0) : 0}%)`,
              String(name),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
            <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{d.value}</span>
            <span className="text-gray-400 text-xs">
              ({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
