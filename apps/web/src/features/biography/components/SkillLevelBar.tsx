type SkillLevelBarProps = {
  level: number;
  name: string;
};

export function SkillLevelBar({ level, name }: SkillLevelBarProps) {
  return (
    <div
      aria-label={`${name} skill level`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={level}
      className="h-2.5 overflow-hidden rounded-full bg-transparent"
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-cutout-hole"
        style={{ width: `${level}%` }}
      />
    </div>
  );
}
