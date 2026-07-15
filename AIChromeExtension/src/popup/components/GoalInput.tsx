import React from 'react';
import { Eye } from 'lucide-react';

interface GoalInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GoalInput: React.FC<GoalInputProps> = ({ value, onChange }) => {
  return (
    <section className="bg-surface-container-low retro-border p-4 flex flex-col gap-2">
      <label htmlFor="goal" className="font-label-md text-label-md uppercase text-on-surface">
        Set your Training Goal
      </label>
      <input
        type="text"
        id="goal"
        value={value}
        onChange={onChange}
        placeholder="e.g. Learning React, AWS Cert..."
        className="retro-input p-2 font-body-md text-body-md text-on-background w-full"
      />
      <div className="flex items-center gap-2 text-error font-label-sm text-[11px] mt-1">
        <Eye className="w-[16px] h-[16px]" />
        <p>Warning: Oji-San is watching.</p>
      </div>
    </section>
  );
};
