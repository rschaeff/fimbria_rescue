import { getFamilies } from '@/lib/queries';
import dynamic from 'next/dynamic';
import FamilyTable from '@/components/families/FamilyTable';

const FamilyBarChart = dynamic(() => import('@/components/families/FamilyBarChart'), {
  ssr: false,
  loading: () => <div className="h-[350px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

export default async function FamiliesPage() {
  const families = await getFamilies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Family Classification
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Completeness by F-group
        </h2>
        <FamilyBarChart families={families} />
      </div>

      <FamilyTable families={families} />
    </div>
  );
}
