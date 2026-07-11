import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  variant?: 'default' | 'pill';
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
  variant = 'default',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const buttonClasses = variant === 'pill'
    ? "w-full flex items-center justify-between pl-4 pr-3.5 py-2.5 text-sm bg-slate-50 border-0 rounded-full hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left text-slate-700 font-medium"
    : "w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-left text-slate-700 font-medium";

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`${buttonClasses} ${disabled ? 'opacity-65 cursor-not-allowed bg-slate-100/30' : ''}`}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-185' : ''}`} />
      </button>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-slate-100 rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${
                  isSelected 
                    ? 'bg-primary/5 text-primary font-semibold' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
