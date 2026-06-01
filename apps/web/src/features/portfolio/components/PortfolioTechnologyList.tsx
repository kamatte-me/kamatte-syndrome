import { Chip } from '@/components/ui/Chip';
import { cn } from '@/utils/classNames';

type PortfolioTechnologyListProps = {
  className?: string;
  technologies: string[];
};

export function PortfolioTechnologyList({
  className,
  technologies,
}: PortfolioTechnologyListProps) {
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {technologies.map((technology) => (
        <Chip asChild key={technology}>
          <li>{technology}</li>
        </Chip>
      ))}
    </ul>
  );
}
