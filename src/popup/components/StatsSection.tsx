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
  return (
    <section className="bg-surface-container-low retro-border p-4 flex flex-col gap-3">
      <h2 className="font-label-md text-label-md uppercase text-secondary-container border-b-2 border-outline-variant pb-1 mb-1">
        Today's Sparring Stats
      </h2>

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
