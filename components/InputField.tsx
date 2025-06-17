import React, { useId, useRef } from 'react';

// Core props shared by both input and textarea variants of InputField
interface InputFieldCoreProps {
  label: string;
  id?: string; // Optional: if not provided, will be auto-generated
  error?: string;
  className?: string; // ClassName for the input/textarea element itself
  as?: 'input' | 'textarea'; // Discriminator
  wrapperClassName?: string; // ClassName for the div wrapping label and input
}

// Common onChange type compatible with both input and textarea
type CompatibleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

// Props for the 'input' variant (default)
interface InputVariantProps extends InputFieldCoreProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | 'onChange'> {
  as?: 'input';
  onChange?: CompatibleOnChange;
  list?: string; // For datalist autocomplete
  datalistOptions?: { id: string; value: string }[]; // Options for the datalist
}

// Props for the 'textarea' variant
interface TextareaVariantProps extends InputFieldCoreProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className' | 'onChange'> {
  as: 'textarea';
  onChange?: CompatibleOnChange;
  // rows is already part of TextareaHTMLAttributes
}

// The component's props are a union of the two variants
export type InputFieldProps = InputVariantProps | TextareaVariantProps;

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-theme-text-muted group-hover:text-theme-text-default transition-colors">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 6.75A1.25 1.25 0 015.75 5.5h8.5A1.25 1.25 0 0115.5 6.75v8.5A1.25 1.25 0 0114.25 16.5h-8.5A1.25 1.25 0 014.5 15.25v-8.5zM7 10a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);


const InputField: React.FC<InputFieldProps> = (props) => {
  const { label, id, error, className = '', as = 'input', wrapperClassName = "mb-4", ...rest } = props;

  const htmlElementProps = rest as any; 
  const isDateInput = as === 'input' && htmlElementProps.type === 'date';
  
  // Use specific ref type for input if that's where showPicker will be called
  const inputRef = useRef<HTMLInputElement>(null); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const generatedId = useId();
  const elementId = id || generatedId;
  const datalistId = as === 'input' && (htmlElementProps as InputVariantProps).list ? `${elementId}-datalist` : undefined;

  let baseInputClasses = `block w-full px-3 py-2 bg-theme-bg-default text-theme-text-default border ${error ? 'border-theme-accent-red focus:ring-theme-accent-red focus:border-theme-accent-red' : 'border-theme-border-default focus:ring-theme-accent-blue focus:border-theme-accent-blue'} rounded-md shadow-sm placeholder-theme-text-subtle focus:outline-none focus:ring-1 sm:text-sm`;

  if (isDateInput) {
    // Keep padding for text, icon is absolutely positioned
    baseInputClasses += ' pr-8 appearance-none'; 
  }
  
  const combinedClassName = `${baseInputClasses} ${className}`;


  const commonAttributes = {
    id: elementId,
    className: combinedClassName,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${elementId}-error` : undefined,
  };

  const handleIconClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
        } catch (e) {
          console.error("Erreur lors de l'appel de showPicker(): ", e);
          // Fallback if showPicker exists but throws error (e.g., in some non-fully-interactive states)
          inputRef.current.focus();
        }
      } else {
        inputRef.current.focus(); // Fallback for browsers not supporting showPicker
      }
    }
  };

  return (
    <div className={`${wrapperClassName} relative group`}>
      <label htmlFor={elementId} className="block text-sm font-medium text-theme-text-muted mb-1">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          ref={textareaRef}
          {...commonAttributes}
          {...(htmlElementProps as Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className' | 'onChange' | 'list' | 'datalistOptions'>)}
          rows={(htmlElementProps as TextareaVariantProps).rows || 3}
        />
      ) : (
        <>
          <input
            ref={inputRef}
            {...commonAttributes}
            {...(htmlElementProps as Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | 'onChange' | 'datalistOptions'>)}
            list={datalistId}
          />
          {datalistId && (htmlElementProps as InputVariantProps).datalistOptions && (
            <datalist id={datalistId}>
              {(htmlElementProps as InputVariantProps).datalistOptions?.map(opt => (
                <option key={opt.id} value={opt.value} />
              ))}
            </datalist>
          )}
          {isDateInput && (
            <div 
              className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer" // Removed pointer-events-none
              onClick={handleIconClick}
              role="button"
              aria-label="Ouvrir le sélecteur de date"
            >
              <CalendarIcon />
            </div>
          )}
        </>
      )}
      {error && <p id={`${elementId}-error`} className="mt-1 text-xs text-theme-accent-red">{error}</p>}
    </div>
  );
};

export default InputField;