import React, { useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { CaseStatus, MedicalCase, STATUS_LIST } from '../../types/api';
import { X, AlertCircle } from 'lucide-react';

interface CaseStatusUpdateModalProps {
  caseItem: MedicalCase;
  onClose: () => void;
  onSuccess: () => void;
}

export const CaseStatusUpdateModal: React.FC<CaseStatusUpdateModalProps> = ({
  caseItem,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>(caseItem.status);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === caseItem.status) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Backend expects exact payload: { "status": "..." }
      const res = await api.updateCaseStatus(caseItem.case_id, {
        status: selectedStatus,
      });

      toast.success(
        res.message || `Status updated to ${selectedStatus}`,
        `Case ${caseItem.case_id}`
      );
      onSuccess();
    } catch (err: any) {
      if (err.status === 403) {
        setErrorMessage('Permission denied: You do not possess the "update" permission required to modify case statuses.');
      } else {
        setErrorMessage(err.message || 'Failed to update case status.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
      >
        <div className="modal-header">
          <h2 id="status-modal-title" className="modal-title">
            Update Workflow Status
          </h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div className="alert alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{errorMessage}</div>
              </div>
            )}

            <div
              style={{
                padding: '0.875rem 1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Case</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Case ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{caseItem.case_id}</span> ({caseItem.patient_refrence})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Current status:{' '}
                <span className={`badge badge-status-${caseItem.status.replace(/\s+/g, '\\ ')}`}>
                  {caseItem.status}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">New Workflow Phase</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CaseStatus)}
              >
                {STATUS_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st} {st === caseItem.status ? '(Current)' : ''}
                  </option>
                ))}
              </select>
              <span className="form-hint">
                Transitions case through surgical planning lifecycle
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedStatus === caseItem.status}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner" style={{ width: 14, height: 14 }} />
                  Saving...
                </>
              ) : (
                'Confirm Status Update'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
