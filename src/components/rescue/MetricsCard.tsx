interface Metric {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface MetricsCardProps {
  title: string;
  metrics: Metric[];
}

export default function MetricsCard({ title, metrics }: MetricsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <dl className="space-y-1.5">
        {metrics.map((m) => (
          <div key={m.label} className="flex justify-between items-center">
            <dt className="text-xs text-gray-500 dark:text-gray-400">{m.label}</dt>
            <dd
              className={`font-medium ${
                m.highlight
                  ? 'text-blue-600 dark:text-blue-400 text-base'
                  : 'text-sm text-gray-900 dark:text-gray-100'
              }`}
            >
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
