import type { StrandExchange, StrandContact, InterChainHbond } from '@/lib/types';

interface StrandExchangeCardProps {
  exchange: StrandExchange;
  hbonds: InterChainHbond[];
  domainLength: number;
}

function parseCont(details: string | null): StrandContact[] {
  if (!details) return [];
  try {
    const parsed = JSON.parse(details);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function DscBadge({ detected }: { detected: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        detected
          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {detected ? 'Yes' : 'No'}
    </span>
  );
}

export default function StrandExchangeCard({ exchange, hbonds, domainLength }: StrandExchangeCardProps) {
  const contacts = parseCont(exchange.strand_contact_details);

  // Build residue participation map for the schematic
  const donorResidues = new Set<number>();
  const acceptorResidues = new Set<number>();
  for (const hb of hbonds) {
    if (hb.donor_chain === 'A') {
      donorResidues.add(hb.donor_res);
    }
    if (hb.acceptor_chain === 'A') {
      acceptorResidues.add(hb.acceptor_res);
    }
  }

  return (
    <div>
      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">DSC Detected</dt>
          <dd className="mt-1"><DscBadge detected={exchange.has_nte_to_body_dsc} /></dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Total Inter-chain H-bonds</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{exchange.total_inter_hbonds}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Nte-to-body H-bonds</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{exchange.nte_to_body_hbonds}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">C-terminal Reciprocal</dt>
          <dd className="mt-1"><DscBadge detected={exchange.has_cterm_reciprocal} /></dd>
        </div>
      </div>

      {/* Ranges */}
      {exchange.has_nte_to_body_dsc && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Nte donor:</span> {exchange.nte_donor_range || '-'}
          {' | '}
          <span className="font-medium">Body acceptor:</span> {exchange.body_acceptor_range || '-'}
          {exchange.has_cterm_reciprocal && (
            <>
              {' | '}
              <span className="font-medium">C-term donor:</span> {exchange.cterm_donor_range || '-'}
              {' | '}
              <span className="font-medium">C-term acceptor:</span> {exchange.cterm_acceptor_range || '-'}
            </>
          )}
        </div>
      )}

      {/* Strand contacts */}
      {contacts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Strand Contacts</h4>
          <div className="overflow-x-auto">
            <table className="text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400">
                  <th className="pr-4 py-1 text-left font-medium">Direction</th>
                  <th className="pr-4 py-1 text-left font-medium">Donor Range</th>
                  <th className="pr-4 py-1 text-left font-medium">Acceptor Range</th>
                  <th className="pr-4 py-1 text-left font-medium">H-bonds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {contacts.map((c, i) => (
                  <tr key={i} className="text-gray-700 dark:text-gray-300">
                    <td className="pr-4 py-1 font-mono text-xs">{c.direction}</td>
                    <td className="pr-4 py-1">{c.donor_range}</td>
                    <td className="pr-4 py-1">{c.acceptor_range}</td>
                    <td className="pr-4 py-1">{c.num_hbonds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Residue schematic */}
      {(donorResidues.size > 0 || acceptorResidues.size > 0) && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chain A H-bond Residue Map
          </h4>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-orange-400 rounded-sm" /> Donor (Nte)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-teal-400 rounded-sm" /> Acceptor (body)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-purple-400 rounded-sm" /> Both
            </span>
          </div>
          <div className="flex flex-wrap gap-[1px] font-mono text-[10px] leading-none">
            {Array.from({ length: domainLength }, (_, i) => {
              const isDonor = donorResidues.has(i);
              const isAcceptor = acceptorResidues.has(i);
              let bg = 'bg-gray-100 dark:bg-gray-800';
              if (isDonor && isAcceptor) bg = 'bg-purple-400';
              else if (isDonor) bg = 'bg-orange-400';
              else if (isAcceptor) bg = 'bg-teal-400';
              return (
                <span
                  key={i}
                  className={`w-[4px] h-3 ${bg} rounded-[1px]`}
                  title={`Residue ${i}${isDonor ? ' (donor)' : ''}${isAcceptor ? ' (acceptor)' : ''}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>1</span>
            <span>{domainLength}</span>
          </div>
        </div>
      )}
    </div>
  );
}
