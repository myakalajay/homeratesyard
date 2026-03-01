import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/ui/overlay/Modal';
import { Button } from '@/components/ui/primitives/Button';
import { formatCurrency } from '@/utils/currency';

const ConfirmLoanModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loanDetails, 
  isLoading 
}) => {
  if (!loanDetails) return null;

  const { amount, term, rate, emi, totalRepayment } = loanDetails;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Loan Application"
      description="Please review the final terms before submitting your application."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={isLoading} className="bg-primary hover:bg-primary-hover">
            Accept & Submit
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="p-4 space-y-4 border rounded-lg bg-background-subtle border-border">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2 rounded-full bg-primary-subtle text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-muted">Loan Amount</p>
              <p className="text-xl font-bold text-content">{formatCurrency(amount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-content-muted">Interest Rate</p>
              <p className="font-semibold">{rate}%</p>
            </div>
            <div>
              <p className="text-content-muted">Duration</p>
              <p className="font-semibold">{term} Months</p>
            </div>
            <div>
              <p className="text-content-muted">Monthly EMI</p>
              <p className="font-semibold text-primary">{formatCurrency(emi)}</p>
            </div>
            <div>
              <p className="text-content-muted">Total Repayment</p>
              <p className="font-semibold">{formatCurrency(totalRepayment)}</p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="flex gap-3 p-3 text-sm text-blue-900 border border-blue-100 rounded-md bg-blue-50">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-xs leading-relaxed">
            By clicking <strong>Accept & Submit</strong>, you agree to the Terms of Service and authorize FintechApp to perform a hard credit inquiry. This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmLoanModal;