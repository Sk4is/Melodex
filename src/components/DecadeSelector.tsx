import React from 'react';
import { motion } from 'motion/react';
import { DecadeFilter, DECADE_OPTIONS } from '../types/game';

interface DecadeSelectorProps {
  selectedDecade: DecadeFilter;
  onSelectDecade: (decade: DecadeFilter) => void;
  disabled?: boolean;
}

export const DecadeSelector: React.FC<DecadeSelectorProps> = ({
  selectedDecade,
  onSelectDecade,
  disabled = false,
}) => {
  return (
    <div id="decade-selector-container" className="w-full flex items-center justify-center mb-6">
      <div className="bg-neutral-900/60 p-1 rounded-full flex items-center gap-1 border border-neutral-800/50 backdrop-blur-md">
        {DECADE_OPTIONS.map((option) => {
          const isSelected = selectedDecade === option.id;

          return (
            <button
              key={option.id}
              id={`decade-option-${option.id}`}
              type="button"
              onClick={() => onSelectDecade(option.id)}
              disabled={disabled}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors duration-200 outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeDecadeIndicator"
                  className="absolute inset-0 rounded-full bg-neutral-800 border border-neutral-700/60 shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full theme-transition"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
