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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <dl className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex justify-between items-center">
            <dt className="text-sm text-gray-500 dark:text-gray-400">{m.label}</dt>
            <dd
              className={`text-sm font-medium ${
                m.highlight
                  ? 'text-blue-600 dark:text-blue-400 text-lg'
                  : 'text-gray-900 dark:text-gray-100'
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
