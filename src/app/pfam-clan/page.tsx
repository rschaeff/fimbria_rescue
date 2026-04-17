import { getPfamClan, getPfamClanDisagreements } from '@/lib/queries';
import PfamClanTable from '@/components/pfam-clan/PfamClanTable';
import DisagreementCard from '@/components/pfam-clan/DisagreementCard';

export default async function PfamClanPage() {
  const [rows, disagreements] = await Promise.all([
    getPfamClan('CL0204'),
    getPfamClanDisagreements('CL0204'),
  ]);

  const totalFamilies = rows.length;
  const withFgroup = rows.filter((r) => r.has_fgroup_mapping).length;
  const inFimbria = rows.filter((r) => r.fimbria_domain_count > 0).length;
  const noFgroup = disagreements.filter((d) => d.type === 'no_fgroup').length;
  const outOfTgroup = disagreements.filter((d) => d.type === 'out_of_tgroup').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Pfam Clan CL0204 — Adhesin
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">
        Inverse lookup from the Pfam Adhesin clan to ECOD classification.
        Surfaces boundary disagreements: Pfam families without F-group assignment
        (curation candidates), Pfam families whose ECOD domains sit outside
        T-group 11.1.5, and sparse ECOD representation.
      </p>

      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalFamilies}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Families in CL0204</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{withFgroup}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">With ECOD F-group</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inFimbria}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">In fimbria targets</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{noFgroup}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">No F-group</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfTgroup}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Out of T-group</div>
        </div>
      </div>

      {/* Disagreement callouts */}
      {(noFgroup > 0 || outOfTgroup > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DisagreementCard disagreements={disagreements} type="no_fgroup" />
          <DisagreementCard disagreements={disagreements} type="out_of_tgroup" />
        </div>
      )}

      {/* Main table */}
      <PfamClanTable rows={rows} />
    </div>
  );
}
