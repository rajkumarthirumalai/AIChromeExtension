import React from 'react';

interface ShieldToggleProps {
  title: string;
  description?: string;
  isActive: boolean;
  activeClass: string;
  knobActiveClass: string;
  onToggle: () => void;
  statusLabel: string;
  statusClass: string;
}

export const ShieldToggle: React.FC<ShieldToggleProps> = ({
  title,
  description,
  isActive,
  activeClass,
  knobActiveClass,
  onToggle,
  statusLabel,
  statusClass,
}) => {
  return (
    <section className="bg-surface-container-low retro-border p-4 flex justify-between items-center">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-label-md text-label-md uppercase text-on-surface leading-none">
          {title}
        </h2>
        {description && (
          <span className="text-[9px] text-muted font-label-sm uppercase tracking-tight">
            {description}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className={`w-16 h-8 rounded-full border-2 border-outline-variant relative transition-colors duration-200 focus:outline-none ${
            isActive ? activeClass : 'bg-surface-variant'
          }`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 rounded-full border-[3px] transition-all duration-200 cursor-pointer ${
              isActive
                ? `right-0.5 bg-background ${knobActiveClass}`
                : 'left-0.5 bg-background border-outline'
            }`}
          />
        </button>
      </div>
      <div className={`font-label-md text-label-md uppercase font-bold ${statusClass}`}>
        {statusLabel}
      </div>
    </section>
  );
};
