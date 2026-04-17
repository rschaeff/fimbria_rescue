import Link from 'next/link';

interface ClanBadgeProps {
  clanAcc: string | null;
  clanName: string | null;
  linked?: boolean;
}

export default function ClanBadge({ clanAcc, clanName, linked = true }: ClanBadgeProps) {
  if (!clanAcc) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        no clan
      </span>
    );
  }

  const content = (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
      {clanAcc}{clanName ? ` ${clanName}` : ''}
    </span>
  );

  if (linked && clanAcc === 'CL0204') {
    return <Link href="/pfam-clan" className="hover:underline">{content}</Link>;
  }
  return content;
}
