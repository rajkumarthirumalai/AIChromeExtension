import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2 } from 'lucide-react';

interface GoalInputProps {
  value: string;
  onSave: (val: string) => void;
}

export const GoalInput: React.FC<GoalInputProps> = ({ value, onSave }) => {
  const [localGoal, setLocalGoal] = useState(value);
  const [isSaved, setIsSaved] = useState(false);

  // Keep local input in sync if parent value updates (e.g., loaded from storage or changed in Options tab)
  useEffect(() => {
    setLocalGoal(value);
  }, [value]);

  const handleSave = () => {
    onSave(localGoal);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <section className="bg-surface-container-low retro-border p-4 flex flex-col gap-2">
      <label htmlFor="goal" className="font-label-md text-label-md uppercase text-on-surface">
        Set your Training Goal
      </label>
      
      <div className="flex gap-2 w-full">
        <input
          type="text"
          id="goal"
          value={localGoal}
          onChange={(e) => setLocalGoal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Learning React, AWS Cert..."
          className="retro-input p-2 font-body-md text-xs text-on-background flex-1"
        />
        <button
          onClick={handleSave}
          className={`px-3 font-label-md text-xs uppercase font-bold border-[3px] transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1 ${
            isSaved
              ? 'bg-tertiary-container text-background border-outline-variant shadow-none translate-y-0.5'
              : 'bg-inverse-primary text-parchment border-on-primary-fixed retro-shadow-primary hover:translate-y-[1px] active:translate-y-[2px]'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </>
          ) : (
            'Set'
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-error font-label-sm text-[11px] mt-1">
        <Eye className="w-[16px] h-[16px]" />
        <p>Warning: Oji-San is watching.</p>
      </div>
    </section>
  );
};
