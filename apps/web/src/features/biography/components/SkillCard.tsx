import type { Skills } from 'content-collections';
import { SkillLevelBar } from './SkillLevelBar';

type Skill = Skills['skills'][number];

type SkillCardProps = {
  skill: Skill;
};

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <li className="border border-cutout-hole p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-bold text-lg">{skill.name}</h3>
        <span className="font-bold text-cutout-hole text-sm">
          {skill.level}
        </span>
      </div>
      <SkillLevelBar level={skill.level} name={skill.name} />
    </li>
  );
}
