import React, { useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { SignUpPayload } from '../../types/api';
import { Layers, AlertCircle, ArrowLeft } from 'lucide-react';

interface SignUpViewProps {
  onBackToLogin: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onBackToLogin }) => {
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
      const res = await api.signUp(formData);
      toast.success(res.message || 'Account created successfully', 'Registration Complete');
      onBackToLogin();
    } catch (err: any) {
      if (err.status === 400) {
        setErrorMessage('This email is already registered in the system.');
      } else if (err.status === 422) {
        setErrorMessage('Validation error: ' + (err.message || 'Check password confirmation.'));
      } else {
        setErrorMessage(err.message || 'Failed to create user account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              marginBottom: '0.75rem',
            }}
          >
            <Layers size={22} />
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Register Clinician Profile
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Creates a standard Reviewer account (Role 6)
          </p>
        </div>

        <div className="auth-card-body">
          {errorMessage && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label form-label-required">Full Legal Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Dr. Jordan Hayes"
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
                placeholder="jordan.hayes@medcenter.org"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner" style={{ width: 14, height: 14 }} />
                  Creating Account...
                </>
              ) : (
                'Submit Registration'
              )}
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '0.6rem' }}
            >
              <ArrowLeft size={16} />
              Return to Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
