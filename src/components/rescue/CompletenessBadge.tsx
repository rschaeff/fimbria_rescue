const COMPLETENESS_COLORS: Record<string, string> = {
  donor_strand_dependent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  probable_dimer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  probable_monomer: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const COMPLETENESS_LABELS: Record<string, string> = {
  donor_strand_dependent: 'donor strand dependent',
  probable_dimer: 'probable dimer',
  probable_monomer: 'probable monomer',
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
