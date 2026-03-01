import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/overlay/Modal';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Label } from '@/components/ui/forms/Label';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const CONFIRM_PHRASE = 'DELETE';

  const isConfirmed = confirmationText === CONFIRM_PHRASE;

  const handleConfirm = () => {
    if (isConfirmed) onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      description="This action is permanent and cannot be undone."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={!isConfirmed || isLoading}
            isLoading={isLoading}
          >
            Permanently Delete
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3 p-4 text-sm border rounded-lg bg-danger-subtle border-danger/20 text-danger-text">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>
            <strong>Warning:</strong> Deleting your account will remove all your loan applications, transaction history, and saved preferences. This data <strong>cannot be recovered</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-delete">
            Type <strong>{CONFIRM_PHRASE}</strong> to confirm:
          </Label>
          <Input
            id="confirm-delete"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="DELETE"
            className="border-danger focus-visible:ring-danger"
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;