import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CaseStatus, CreateCasePayload, PriorityLevel, STATUS_LIST } from '../../types/api';
import { X, AlertCircle } from 'lucide-react';

interface CaseCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CaseCreateModal: React.FC<CaseCreateModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<CreateCasePayload>({
    case_id: '',
    patient_refrence: '',
    surgeon_name: '',
    priority: 'medium',
    status: 'Draft',
    created_by: user?.id || 1,
    implant_type: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Frontend validation
    if (!formData.case_id.trim()) {
      setFormError('Case Identifier is required (e.g. "CASE-104" or "3").');
      return;
    }
    if (!formData.patient_refrence.trim()) {
      setFormError('Patient Reference is required (e.g. "PAT-0049").');
      return;
    }
    if (!formData.surgeon_name.trim()) {
      setFormError('Surgeon name is required.');
      return;
    }
    if (!formData.implant_type.trim()) {
      setFormError('Implant Specification is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateCasePayload = {
        ...formData,
        case_id: formData.case_id.trim(),
        patient_refrence: formData.patient_refrence.trim(),
        surgeon_name: formData.surgeon_name.trim(),
        implant_type: formData.implant_type.trim(),
        created_by: user?.id || formData.created_by,
      };

      const res = await api.createCase(payload);
      toast.success(res.message || 'Case created successfully', 'Case Registered');
      onSuccess();
    } catch (err: any) {
      if (err.status === 403) {
        setFormError('Permission denied: Your role does not have authorization to create new surgical cases.');
      } else {
        setFormError(err.message || 'Failed to create case. Please verify the entered details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog modal-dialog-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-case-title"
      >
        <div className="modal-header">
          <h2 id="create-case-title" className="modal-title">
            Register New Implant Case
          </h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && (
              <div className="alert alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{formError}</div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
              }}
            >
              <div className="form-group">
                <label className="form-label form-label-required">Case Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101 or CASE-2026-09"
                  className="form-input"
                  value={formData.case_id}
                  onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
                />
                <span className="form-hint">Unique clinical case identifier</span>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Patient Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PAT-9042-CRAN"
                  className="form-input"
                  value={formData.patient_refrence}
                  onChange={(e) => setFormData({ ...formData, patient_refrence: e.target.value })}
                />
                <span className="form-hint">De-identified patient chart code</span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
              }}
            >
              <div className="form-group">
                <label className="form-label form-label-required">Surgeon Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="form-input"
                  value={formData.surgeon_name}
                  onChange={(e) => setFormData({ ...formData, surgeon_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Implant Specification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Titanium Craniofacial Reconstruction Mesh"
                  className="form-input"
                  value={formData.implant_type}
                  onChange={(e) => setFormData({ ...formData, implant_type: e.target.value })}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
              }}
            >
              <div className="form-group">
                <label className="form-label">Clinical Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CaseStatus })}
                >
                  {STATUS_LIST.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Authorizing User ID</label>
              <input
                type="number"
                disabled
                className="form-input"
                style={{ background: 'var(--bg-subtle)' }}
                value={formData.created_by}
              />
              <span className="form-hint">Logged-in account user_id attached to audit log</span>
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
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner" style={{ width: 14, height: 14 }} />
                  Saving Case...
                </>
              ) : (
                'Create Case'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
