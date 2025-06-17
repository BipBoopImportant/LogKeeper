import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto print:hidden" // Darker overlay for better contrast
      onClick={onClose} // Close on overlay click
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-theme-bg-default rounded-lg shadow-xl w-full max-w-lg transform transition-all my-auto border border-theme-border-default" // Softer shadow, border
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="px-4 pt-4 sm:px-6 sm:pt-6 md:px-6 md:pt-5 flex justify-between items-start"> {/* Adjusted padding slightly */}
          <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-theme-text-default">{title}</h2>
          <button
            onClick={onClose}
            className="text-theme-text-muted hover:text-theme-text-default text-3xl leading-none p-1 -m-1 rounded-full focus:outline-none focus:ring-2 focus:ring-theme-accent-blue focus:ring-offset-2 focus:ring-offset-theme-bg-default"
            aria-label="Fermer la modale"
          >
            &times;
          </button>
        </div>
        <div className="p-4 sm:p-6 md:p-6 text-theme-text-default"> {/* Content padding */}
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;