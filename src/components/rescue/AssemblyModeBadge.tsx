const MODE_COLORS: Record<string, string> = {
  DSC: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  Lateral: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  None: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function AssemblyModeBadge({ mode }: { mode: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${MODE_COLORS[mode] || MODE_COLORS.None}`}>
      {mode}
    </span>
  );
}
