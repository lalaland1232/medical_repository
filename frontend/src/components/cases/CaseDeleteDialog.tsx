import React, { useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { MedicalCase } from '../../types/api';
import { AlertTriangle, X } from 'lucide-react';

interface CaseDeleteDialogProps {
  caseItem: MedicalCase;
  onClose: () => void;
  onSuccess: () => void;
}

export const CaseDeleteDialog: React.FC<CaseDeleteDialogProps> = ({
  caseItem,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await api.deleteCase(caseItem.case_id);
      toast.success(res.message || 'Case record deleted successfully', 'Case Removed');
      onSuccess();
    } catch (err: any) {
      if (err.status === 403) {
        setErrorMessage('Permission denied: You do not possess the "delete" permission required to remove cases.');
      } else {
        setErrorMessage(err.message || 'Failed to delete case.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="modal-header" style={{ borderBottomColor: '#fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
            <AlertTriangle size={20} />
            <h2 id="delete-dialog-title" className="modal-title" style={{ color: '#b91c1c' }}>
              Confirm Case Deletion
            </h2>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMessage && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <div>{errorMessage}</div>
            </div>
          )}

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Are you sure you want to permanently delete implant case{' '}
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {caseItem.case_id}
            </strong>{' '}
            (Patient: <strong>{caseItem.patient_refrence}</strong>)?
          </p>

          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fecaca',
              fontSize: '0.8rem',
              color: '#991b1b',
            }}
          >
            This action immediately purges the clinical planning entry from the PostgreSQL database and cannot be undone.
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-danger"
          >
            {isDeleting ? (
              <>
                <span className="loading-spinner" style={{ width: 14, height: 14, borderColor: 'white' }} />
                Deleting...
              </>
            ) : (
              'Delete Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
