import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layers, AlertCircle, ArrowRight, Shield } from 'lucide-react';

interface LoginViewProps {
  onToggleSignUp: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onToggleSignUp }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('shiv@gmail.com');
  const [password, setPassword] = useState<string>('password123');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      if (err.status === 404) {
        setErrorMessage('User record not found in system.');
      } else if (err.status === 401) {
        setErrorMessage('Invalid credentials. Please re-check your password.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectRolePreset = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
    setErrorMessage(null);
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
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Layers size={26} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            OsseoPlan Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Medical Implant Surgical Planning & Case Management
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
              <label className="form-label form-label-required">Institutional Email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="clinician@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label form-label-required">Password</label>
              </div>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  <span className="loading-spinner" style={{ width: 15, height: 15 }} />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick role test switcher for hiring evaluation */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Shield size={12} />
              Evaluation Seed Accounts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleSelectRolePreset('john.doe@example.com', 'password123')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.3rem' }}
                title="Superuser: full permissions + provision admins"
              >
                Superuser
              </button>
              <button
                type="button"
                onClick={() => handleSelectRolePreset('shiv@gmail.com', 'password123')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.3rem' }}
                title="Admin: read, create, update, delete cases"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleSelectRolePreset('user@example.com', 'string')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.3rem' }}
                title="Reviewer: read-only access"
              >
                Reviewer
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            Need a clinician account?{' '}
            <button
              type="button"
              onClick={onToggleSignUp}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Register Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
