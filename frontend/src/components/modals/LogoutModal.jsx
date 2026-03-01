import React from 'react';
import Dialog from '@/components/ui/overlay/Dialog';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Sign Out"
      description="Are you sure you want to sign out of your account? Any unsaved changes will be lost."
      confirmLabel="Sign Out"
      cancelLabel="Stay Logged In"
      variant="destructive" // Visual cue that this ends the session
    />
  );
};

export default LogoutModal;