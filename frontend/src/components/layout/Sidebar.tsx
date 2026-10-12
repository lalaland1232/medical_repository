import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FolderKanban,
  LayoutDashboard,
  ShieldAlert,
  Layers,
  FileCheck2,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  caseCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  caseCount = 0,
}) => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <Layers size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="sidebar-brand-title">OsseoPlan</span>
            <span className="sidebar-brand-badge">B2B</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Implant Case System
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          onClick={() => onSelectView('dashboard')}
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
        >
          <span className="nav-item-icon">
            <LayoutDashboard size={17} />
          </span>
          <span>Overview</span>
        </button>

        <button
          onClick={() => onSelectView('cases')}
          className={`nav-item ${currentView === 'cases' ? 'active' : ''}`}
        >
          <span className="nav-item-icon">
            <FolderKanban size={17} />
          </span>
          <span style={{ flex: 1 }}>Implant Cases</span>
          {caseCount > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: '999px',
                background: currentView === 'cases' ? 'var(--primary)' : 'var(--bg-muted)',
                color: currentView === 'cases' ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
              }}
            >
              {caseCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectView('system')}
          className={`nav-item ${currentView === 'system' ? 'active' : ''}`}
        >
          <span className="nav-item-icon">
            <ShieldAlert size={17} />
          </span>
          <span>Security & RBAC</span>
        </button>
      </nav>

      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-light)' }}>
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginBottom: '0.35rem',
          }}
        >
          <FileCheck2 size={13} color="var(--primary)" />
          <span>PostgreSQL med_schema active</span>
        </div>
      </div>

      <div className="sidebar-footer">
        {user && (
          <div className="user-badge-container">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <div className="user-name">{user.name}</div>
              <div className="user-role-label">{user.roleLabel}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
