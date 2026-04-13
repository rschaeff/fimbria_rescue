import { getRescueList, getRescueCount } from '@/lib/queries';
import RescueTable from '@/components/rescue/RescueTable';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RescuePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt((params.page as string) || '1'));
  const sortBy = (params.sortBy as string) || 'delta_mean_plddt';
  const sortDir = ((params.sortDir as string) || 'desc') as 'asc' | 'desc';

  const filters = {
    rescue_class: (params.rescue_class as string) || undefined,
    f_group: (params.f_group as string) || undefined,
    organism: (params.organism as string) || undefined,
    delta_min: params.delta_min ? parseFloat(params.delta_min as string) : undefined,
    delta_max: params.delta_max ? parseFloat(params.delta_max as string) : undefined,
    completeness: (params.completeness as string) || undefined,
    dsc: (params.dsc as string) || undefined,
    batch: (params.batch as string) || undefined,
  };

  const [rows, total] = await Promise.all([
    getRescueList(page, filters, sortBy, sortDir),
    getRescueCount(filters),
  ]);

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Rescue Browser
      </h1>
      <RescueTable
        initialRows={rows}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
        initialSortBy={sortBy}
        initialSortDir={sortDir}
        initialFilters={filters}
      />
    </div>
  );
}
