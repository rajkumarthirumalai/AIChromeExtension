import React from 'react';
import { FileText, Swords } from 'lucide-react';

interface StatsSectionProps {
  pagesEvaluated: number;
  distractionsSlashed: number;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  pagesEvaluated,
  distractionsSlashed,
}) => {
  const total = pagesEvaluated;
  const slashed = distractionsSlashed;
  const stamina = total > 0 ? Math.max(10, Math.round(((total - slashed) / total) * 100)) : 100;
  const activeSegments = Math.round(stamina / 10);

  return (
    <section className="bg-surface-container-low retro-border p-4 flex flex-col gap-3">
      <h2 className="font-label-md text-label-md uppercase text-secondary-container border-b-2 border-outline-variant pb-1 mb-1">
        Today's Sparring Stats
      </h2>

      {/* Health Bar (Focus Stamina) */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Focus Stamina</span>
          <span className="font-label-sm text-label-sm text-secondary-container font-bold">{stamina}%</span>
        </div>
        <div className="health-bar-container">
          <div className="health-bar-fill" style={{ width: `${stamina}%` }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`health-segment ${i < activeSegments ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Text Stats */}
      <div className="flex justify-between items-center bg-surface p-2 border-[2px] border-outline-variant mt-1">
        <div className="flex items-center gap-2">
          <FileText className="w-[18px] h-[18px] text-tertiary" />
          <span className="font-label-md text-label-md text-on-surface">Pages Evaluated</span>
        </div>
        <span className="font-headline-md text-[20px] text-secondary-container">{pagesEvaluated}</span>
      </div>

      <div className="flex justify-between items-center bg-surface p-2 border-[2px] border-outline-variant">
        <div className="flex items-center gap-2">
          <Swords className="w-[18px] h-[18px] text-error" />
          <span className="font-label-md text-label-md text-on-surface">Distractions Slashed</span>
        </div>
        <span className="font-headline-md text-[20px] text-primary-container">{distractionsSlashed}</span>
      </div>
    </section>
  );
};
