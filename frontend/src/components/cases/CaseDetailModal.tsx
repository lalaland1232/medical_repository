import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { MedicalCase, PRIORITY_MAP } from '../../types/api';
import { X, Calendar, User, Stethoscope, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CaseDetailModalProps {
  caseId: string;
  onClose: () => void;
  onUpdateStatus: (caseItem: MedicalCase) => void;
  onDeleteCase: (caseItem: MedicalCase) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseId,
  onClose,
  onUpdateStatus,
  onDeleteCase,
}) => {
  const { hasPermission } = useAuth();
  const [caseData, setCaseData] = useState<MedicalCase | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');

  useEffect(() => {
    let isMounted = true;
    async function loadCase() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getCaseById(caseId);
        if (isMounted) setCaseData(data);
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to retrieve case details from the server.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCase();
    return () => {
      isMounted = false;
    };
  }, [caseId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog modal-dialog-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-detail-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 id="case-detail-title" className="modal-title">
              Case Details: <span style={{ fontFamily: 'var(--font-mono)' }}>{caseId}</span>
            </h2>
            {caseData && (
              <span className={`badge badge-status-${caseData.status.replace(/\s+/g, '\\ ')}`}>
                {caseData.status}
              </span>
            )}
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading && (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <span className="loading-spinner" />
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Fetching case record from backend...
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Error fetching case:</strong> {error}
              </div>
            </div>
          )}

          {!isLoading && caseData && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Patient Ref */}
                <div
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="form-label">Patient Reference</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {caseData.patient_refrence}
                  </div>
                </div>

                {/* Surgeon */}
                <div
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Stethoscope size={13} />
                    <span>Surgeon In Charge</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {caseData.surgeon_name}
                  </div>
                </div>

                {/* Priority */}
                <div
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="form-label">Priority Level</div>
                  <div>
                    <span className={`badge ${PRIORITY_MAP[caseData.priority]?.badgeClass || 'badge-priority-low'}`}>
                      {PRIORITY_MAP[caseData.priority]?.label || `Priority ${caseData.priority}`}
                    </span>
                  </div>
                </div>

                {/* Implant Type */}
                <div
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={13} />
                    <span>Implant Specification</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {caseData.implant_type || 'Custom Implant Specification'}
                  </div>
                </div>
              </div>

              {/* Meta information row */}
              <div
                style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} />
                  <span>Created by User ID: <strong>{caseData.created_by}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  <span>
                    Created:{' '}
                    {caseData.created_at ? new Date(caseData.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  <span>
                    Last Updated:{' '}
                    {caseData.updated_at ? new Date(caseData.updated_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {caseData && canDelete && (
            <button
              onClick={() => {
                onDeleteCase(caseData);
              }}
              className="btn btn-outline"
              style={{ color: '#dc2626', borderColor: '#fecaca', marginRight: 'auto' }}
            >
              Delete Case
            </button>
          )}

          {caseData && canUpdate && (
            <button
              onClick={() => {
                onUpdateStatus(caseData);
              }}
              className="btn btn-primary"
            >
              <RefreshCw size={14} />
              Update Status
            </button>
          )}

          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
