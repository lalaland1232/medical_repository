import React from 'react';
import { MedicalCase, PRIORITY_MAP } from '../types/api';
import {
  FolderKanban,
  FileCheck,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardOverviewProps {
  cases: MedicalCase[];
  isLoading: boolean;
  onNavigateToCases: () => void;
  onOpenCreateCase: () => void;
  onSelectCase: (caseId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  cases,
  isLoading,
  onNavigateToCases,
  onOpenCreateCase,
  onSelectCase,
}) => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('create');

  // Derive genuine counts directly from backend records without fabricating APIs
  const totalCases = cases.length;
  const inPlanning = cases.filter((c) => c.status === 'Planning').length;
  const inReview = cases.filter((c) => c.status === 'In Review').length;
  const highPriority = cases.filter((c) => c.priority === 1).length;

  return (
    <div>
      {/* Action banner */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 1.75rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Surgical Implant Workflow Pipeline
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Tracking patient-specific reconstructive implants across design and approval stages.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {canCreate && (
            <button onClick={onOpenCreateCase} className="btn btn-primary">
              <Plus size={16} />
              Register New Case
            </button>
          )}
          <button onClick={onNavigateToCases} className="btn btn-secondary">
            View All Cases <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Actual Data Metrics Grid */}
      <div className="stats-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <FolderKanban size={22} />
          </div>
          <div>
            <div className="metric-val">{isLoading ? '-' : totalCases}</div>
            <div className="metric-label">Active Records</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0369a1' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-val">{isLoading ? '-' : inPlanning}</div>
            <div className="metric-label">In Surgical Planning</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#b45309' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div className="metric-val">{isLoading ? '-' : inReview}</div>
            <div className="metric-label">Under Clinical Review</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="metric-val">{isLoading ? '-' : highPriority}</div>
            <div className="metric-label">High Priority</div>
          </div>
        </div>
      </div>

      {/* Lifecycle Workflow Diagram */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
          }}
        >
          Clinical Status Lifecycle
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {['Draft', 'Planning', 'In Review', 'Approved', 'Completed'].map((stage, idx, arr) => (
            <React.Fragment key={stage}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </span>
                <span>{stage}</span>
              </div>
              {idx < arr.length - 1 && (
                <div style={{ color: 'var(--border-strong)', fontSize: '0.85rem' }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Recent Cases Section */}
      <div className="table-card">
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Active Cases
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing real medical cases populated in PostgreSQL
            </p>
          </div>
          <button onClick={onNavigateToCases} className="btn btn-outline btn-sm">
            View All in Master Table
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <span className="loading-spinner" />
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Querying database cases...
            </div>
          </div>
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No surgical cases found</div>
            <div className="empty-state-desc">
              The database currently contains no case records. Clinical administrators may register
              new patient implant cases above.
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Patient Ref</th>
                  <th>Surgeon</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Specification</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td className="mono-cell" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {item.case_id}
                    </td>
                    <td className="mono-cell">{item.patient_refrence}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Stethoscope size={13} color="var(--text-muted)" />
                        <span>{item.surgeon_name}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          PRIORITY_MAP[item.priority]?.badgeClass || 'badge-priority-low'
                        }`}
                      >
                        {PRIORITY_MAP[item.priority]?.label || `Priority ${item.priority}`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-status-${item.status.replace(/\s+/g, '\\ ')}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {item.implant_type || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectCase(item.case_id)}
                        className="btn btn-outline btn-sm"
                      >
                        Inspect Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
