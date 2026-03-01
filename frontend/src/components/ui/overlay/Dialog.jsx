import React from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/primitives/Button';

const Dialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmLabel = "Continue", 
  cancelLabel = "Cancel",
  variant = "default", // default, destructive
  isLoading 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'} 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {/* Dialogs usually don't have extra body content, but if they do: */}
      <div className="sr-only">Confirmation Dialog</div> 
    </Modal>
  );
};

export default Dialog;