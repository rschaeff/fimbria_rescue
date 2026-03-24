const RELEVANCE_COLORS: Record<string, string> = {
  direct: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  review: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  methods: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  background: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function RelevanceBadge({ relevance }: { relevance: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        RELEVANCE_COLORS[relevance] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {relevance}
    </span>
  );
}
