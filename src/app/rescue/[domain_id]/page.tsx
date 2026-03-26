import { notFound } from 'next/navigation';
import { getRescueDetail, getResiduePlddts, getSequences, getStructurePaths, getStrandExchange, getHbonds, getDomainCompleteness } from '@/lib/queries';
import DomainDetailClient from './DomainDetailClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ domain_id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain_id } = await params;
  return {
    title: `${domain_id} — Rescue Detail`,
  };
}

export default async function DomainDetailPage({ params }: PageProps) {
  const { domain_id } = await params;

  const [detail, plddts, sequences, structures, exchange, hbonds, completeness] = await Promise.all([
    getRescueDetail(domain_id),
    getResiduePlddts(domain_id),
    getSequences(domain_id),
    getStructurePaths(domain_id),
    getStrandExchange(domain_id),
    getHbonds(domain_id),
    getDomainCompleteness(domain_id),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <DomainDetailClient
      detail={detail}
      plddts={plddts}
      sequences={sequences}
      structures={structures}
      exchange={exchange}
      hbonds={hbonds}
      completeness={completeness}
    />
  );
}
