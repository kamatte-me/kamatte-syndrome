import type { PortfolioYearGroup } from '../types';
import { PortfolioYearSection } from './PortfolioYearSection';

type PortfolioYearGroupsProps = {
  groups: PortfolioYearGroup[];
};

export function PortfolioYearGroups({ groups }: PortfolioYearGroupsProps) {
  return (
    <div className="grid gap-10 md:gap-12">
      {groups.map((group) => (
        <PortfolioYearSection group={group} key={group.year} />
      ))}
    </div>
  );
}
