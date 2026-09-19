import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X as XIcon, Loader2 } from 'lucide-react';

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
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
  variant = 'default',
  disabled = false,
  placeholder,
  error,
  searchable = false,
  onSearch,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Sync search term with selected option when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption ? selectedOption.label : '');
    }
  }, [isOpen, selectedOption]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(selectedOption ? selectedOption.label : '');
        if (onSearch) {
          onSearch('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption, onSearch]);

  const filteredOptions = useMemo(() => {
    // If onSearch is provided, the filtering is performed server-side via API
    if (onSearch) {
      return options;
    }
    if (!searchable || !isOpen || !searchTerm.trim()) {
      return options;
    }
    const term = searchTerm.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchable, isOpen, searchTerm, onSearch]);

  const containerClasses = variant === 'pill'
    ? "w-full flex items-center justify-between pl-4 pr-3.5 py-2.5 text-sm bg-slate-50 border-0 rounded-full hover:bg-slate-100/70 focus-within:ring-2 focus-within:ring-primary/20 transition-all text-left text-slate-700 font-medium"
    : `w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg hover:bg-slate-100/50 focus-within:ring-2 focus-within:bg-white transition-all text-left text-slate-700 font-medium ${
        error
          ? 'border-red-500 focus-within:ring-red-200 focus-within:border-red-500'
          : 'border-slate-200 focus-within:ring-primary/20 focus-within:border-primary'
      }`;

  const handleSelectOption = (optValue: string, optLabel: string) => {
    onChange(optValue);
    setSearchTerm(optLabel);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchTerm(text);
    if (!isOpen) setIsOpen(true);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
    inputRef.current?.focus();
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      
      {/* Trigger: Input for Searchable, Button for Standard */}
      {searchable ? (
        <div
          className={`${containerClasses} ${disabled ? 'opacity-65 cursor-not-allowed bg-slate-100/30' : 'cursor-text'}`}
          onClick={() => {
            if (!disabled && !isOpen) {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
        >
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={isOpen ? searchTerm : (selectedOption ? selectedOption.label : '')}
            placeholder={placeholder || 'Select option'}
            autoComplete="off"
            onChange={handleInputChange}
            onFocus={() => {
              if (!disabled) {
                setIsOpen(true);
                setSearchTerm(selectedOption ? selectedOption.label : '');
              }
            }}
            className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400 text-sm cursor-text p-0"
          />
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            )}
            {searchTerm && isOpen && !isLoading && (
              <button
                type="button"
                tabIndex={-1}
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  if (isOpen) {
                    setIsOpen(false);
                    setSearchTerm(selectedOption ? selectedOption.label : '');
                    if (onSearch) onSearch('');
                  } else {
                    setIsOpen(true);
                    inputRef.current?.focus();
                  }
                }
              }}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`${containerClasses} ${disabled ? 'opacity-65 cursor-not-allowed bg-slate-100/30' : ''}`}
        >
          <span className={!selectedOption ? 'text-slate-400' : ''}>
            {selectedOption ? selectedOption.label : (placeholder || 'Select option')}
          </span>
          <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Floating Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-slate-100 rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {isLoading && filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 flex items-center justify-center gap-2 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Searching members...</span>
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevents input blur before selection
                    handleSelectOption(option.value, option.label);
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
            })
          ) : (
            <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
              No matching members found
            </div>
          )}
        </div>
      )}
      {error && (
        <span className="text-[10px] text-red-500 font-medium mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
};


