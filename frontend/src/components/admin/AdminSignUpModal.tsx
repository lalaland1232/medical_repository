import React, { useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { SignUpPayload } from '../../types/api';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminSignUpModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminSignUpModal: React.FC<AdminSignUpModalProps> = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState<SignUpPayload>({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.adminSignUp(formData);
      toast.success(res.message || 'Admin user created successfully', 'Provisioning Complete');
      onSuccess();
    } catch (err: any) {
      if (err.status === 403) {
        setErrorMessage('Permission denied: Only Superusers (permission: create_admin) can provision new Clinical Administrators.');
      } else if (err.status === 400) {
        setErrorMessage('Email is already registered in the medical system.');
      } else {
        setErrorMessage(err.message || 'Failed to create admin user.');
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
        aria-labelledby="admin-signup-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h2 id="admin-signup-title" className="modal-title">
              Provision Clinical Administrator
            </h2>
          </div>
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
                padding: '0.75rem 1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-light)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              This endpoint creates a User with <strong>Role 5 (admin)</strong> granting permissions:
              <code> read</code>, <code>create</code>, <code>update</code>, and <code>delete</code>.
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Dr. Eleanor Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Institutional Email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="e.vance@hospital.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Confirm Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••••••"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              />
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
                  Provisioning...
                </>
              ) : (
                'Create Administrator'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
