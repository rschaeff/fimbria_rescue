import { getLiterature } from '@/lib/queries';
import LiteratureTable from '@/components/literature/LiteratureTable';

export default async function LiteraturePage() {
  const literature = await getLiterature();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Literature
      </h1>
      <LiteratureTable data={literature} />
    </div>
  );
}
