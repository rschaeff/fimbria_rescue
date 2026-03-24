const RESCUE_CLASS_COLORS: Record<string, string> = {
  strong: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  confident_dimer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  weak: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  no_interaction: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

export default function RescueClassBadge({ rescueClass }: { rescueClass: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        RESCUE_CLASS_COLORS[rescueClass] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {rescueClass.replace('_', ' ')}
    </span>
  );
}
