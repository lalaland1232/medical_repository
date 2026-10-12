import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserPlus, Shield, Activity } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onOpenAdminSignUp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onOpenAdminSignUp }) => {
  const { user, logout, hasPermission } = useAuth();
  const canCreateAdmin = hasPermission('create_admin');

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Cases & Planning Overview',
      subtitle: 'Patient-specific medical implant planning pipeline',
    },
    cases: {
      title: 'Medical Implant Cases',
      subtitle: 'Surgical planning records and clinical lifecycle management',
    },
    system: {
      title: 'System & RBAC Audit',
      subtitle: 'Active session state, role hierarchy and endpoint mapping',
    },
  };

  const currentMeta = viewTitles[currentView] || {
    title: 'Medical Case Management',
    subtitle: 'Clinical workflow platform',
  };

  return (
    <header className="top-navbar">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentMeta.title}
          </h1>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontWeight: 500,
            }}
          >
            <Activity size={12} />
            FastAPI Live
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {currentMeta.subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {canCreateAdmin && onOpenAdminSignUp && (
          <button
            onClick={onOpenAdminSignUp}
            className="btn btn-secondary btn-sm"
            title="Provision a new Clinical Administrator (Superuser permission: create_admin)"
          >
            <UserPlus size={15} />
            Provision Admin
          </button>
        )}

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.65rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
            }}
          >
            <Shield size={14} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{user.name}</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'white',
                border: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              {user.roleLabel}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          title="Sign out of OsseoPlan"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </header>
  );
};
