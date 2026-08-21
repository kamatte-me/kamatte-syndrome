import type { Biography } from 'content-collections';

type HistoryListProps = {
  history: Biography['history'];
};

export function HistoryList({ history }: HistoryListProps) {
  const chronologicalHistory = [...history].sort((a, b) => a.year - b.year);

  return (
    <dl className="mx-auto grid w-fit max-w-full gap-0.5 text-left text-sm leading-6 sm:text-base md:mx-0 md:max-w-md">
      {chronologicalHistory.map((item) => (
        <div
          key={`${item.year}-${item.description}`}
          className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-1 sm:gap-4"
        >
          <dt className="text-cutout-hole tabular-nums">{item.year}年</dt>
          <dd className="text-cutout-readable">{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}
