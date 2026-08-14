import type { Skills } from 'content-collections';
import { cn } from '@/utils/classNames';
import { SkillCard } from './SkillCard';

type BiographySkillsProps = {
  className?: string;
  skills: Skills['skills'];
};

export function BiographySkills({ className, skills }: BiographySkillsProps) {
  return (
    <section className={cn('border border-cutout-hole p-6 sm:p-8', className)}>
      <h2 className="mb-6 font-display font-normal text-4xl text-cutout-hole sm:mb-8 sm:text-5xl">
        Skills
      </h2>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </ul>
    </section>
  );
}
