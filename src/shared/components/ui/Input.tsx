import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  required = false,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ${
            icon ? 'pl-9' : 'px-3.5'
          } py-2.5 ${
            error 
              ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
              : 'border-slate-200 focus:border-primary'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[10px] text-red-500 font-medium mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  required = false,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <textarea
          id={inputId}
          className={`w-full text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ${
            icon ? 'pl-9' : 'px-3.5'
          } py-2.5 ${
            error 
              ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
              : 'border-slate-200 focus:border-primary'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[10px] text-red-500 font-medium mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
};
