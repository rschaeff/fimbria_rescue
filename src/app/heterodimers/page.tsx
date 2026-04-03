import { getHeterodimers } from '@/lib/queries';
import HeterodimerTable from '@/components/heterodimers/HeterodimerTable';

export default async function HeterodimersPage() {
  const rows = await getHeterodimers();

  const dsc = rows.filter((r) => r.assembly_mode === 'DSC').length;
  const lateral = rows.filter((r) => r.assembly_mode === 'Lateral').length;
  const none = rows.filter((r) => r.assembly_mode === 'None').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Heterodimer Interactions
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {rows.length} pairs tested &middot;
        <span className="text-orange-600 dark:text-orange-400"> {dsc} DSC</span> &middot;
        <span className="text-blue-600 dark:text-blue-400"> {lateral} Lateral</span> &middot;
        <span className="text-gray-500"> {none} None</span>
      </p>
      <HeterodimerTable rows={rows} />
    </div>
  );
}
