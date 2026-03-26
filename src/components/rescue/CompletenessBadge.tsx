const COMPLETENESS_COLORS: Record<string, string> = {
  donor_strand_dependent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  self_complemented: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
  complete: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const COMPLETENESS_LABELS: Record<string, string> = {
  donor_strand_dependent: 'donor strand dependent',
  self_complemented: 'self complemented',
  complete: 'complete',
  unknown: 'unknown',
};

export default function CompletenessBadge({ completeness }: { completeness: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        COMPLETENESS_COLORS[completeness] || COMPLETENESS_COLORS.unknown
      }`}
    >
      {COMPLETENESS_LABELS[completeness] || completeness}
    </span>
  );
}
