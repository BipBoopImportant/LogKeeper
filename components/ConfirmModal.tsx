import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  message, 
  onConfirm, 
  onCancel, 
  title = "Confirmer l'action",
  confirmButtonText = "Confirmer",
  confirmButtonVariant = "danger"
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-theme-text-default mb-6">{message}</p>
      <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0">
        <Button variant="secondary" onClick={onCancel} fullWidth className="sm:w-auto">Annuler</Button>
        <Button variant={confirmButtonVariant} onClick={onConfirm} fullWidth className="sm:w-auto">{confirmButtonText}</Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;