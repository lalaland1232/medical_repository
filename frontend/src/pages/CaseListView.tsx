import React, { useState } from 'react';
import { MedicalCase, PRIORITY_MAP, STATUS_LIST } from '../types/api';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CaseListViewProps {
  cases: MedicalCase[];
  isLoading: boolean;
  page: number;
  onPageChange: (newPage: number) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onRefresh: () => void;
  onSelectCase: (caseId: string) => void;
  onOpenCreateCase: () => void;
  onOpenUpdateStatus: (caseItem: MedicalCase) => void;
  onOpenDeleteDialog: (caseItem: MedicalCase) => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({
  cases,
  isLoading,
  page,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onSelectCase,
  onOpenCreateCase,
  onOpenUpdateStatus,
  onOpenDeleteDialog,
}) => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const canCreate = hasPermission('create');
  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');

  // Client-side search and priority refinement on the returned page
  const filteredCases = cases.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      c.case_id.toLowerCase().includes(term) ||
      c.patient_refrence.toLowerCase().includes(term) ||
      c.surgeon_name.toLowerCase().includes(term) ||
      (c.implant_type && c.implant_type.toLowerCase().includes(term));

    const matchesPriority =
      priorityFilter === 'all' || c.priority.toString() === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <div>
      {/* Header toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Medical Implant Cases</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Viewing active clinical records on Page {page} (10 records per page)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
            title="Refresh records from backend"
          >
            <RefreshCw size={14} className={isLoading ? 'loading-spinner' : ''} />
            Refresh
          </button>

          {canCreate && (
            <button onClick={onOpenCreateCase} className="btn btn-primary btn-sm">
              <Plus size={15} />
              Register Case
            </button>
          )}
        </div>
      </div>

      {/* Filter and search bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search patient ref, case ID, surgeon, or implant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status filter (Server-side) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.65rem' }}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_LIST.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Priority:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.65rem' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="1">High (1)</option>
            <option value="2">Medium (2)</option>
            <option value="3">Low (3)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-card">
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <span className="loading-spinner" />
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Loading cases from PostgreSQL database...
            </div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No matching cases</div>
            <div className="empty-state-desc">
              No medical cases match the current filter criteria or search query on page {page}.
            </div>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('all');
                  onStatusFilterChange('');
                }}
                className="btn btn-outline btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Clear Filters
              </button>
            )}
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
                  <th>Implant Specification</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td className="mono-cell" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {item.case_id}
                    </td>
                    <td className="mono-cell" style={{ fontWeight: 500 }}>
                      {item.patient_refrence}
                    </td>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Sparkles size={13} color="var(--text-muted)" />
                        <span>{item.implant_type || '—'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => onSelectCase(item.case_id)}
                          className="btn btn-outline btn-sm"
                          title="Inspect full case record"
                        >
                          <Eye size={13} />
                          View
                        </button>

                        {canUpdate && (
                          <button
                            onClick={() => onOpenUpdateStatus(item)}
                            className="btn btn-secondary btn-sm"
                            title="Update surgical planning status"
                          >
                            <RefreshCw size={13} />
                            Status
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => onOpenDeleteDialog(item)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fecaca' }}
                            title="Permanently remove case"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            Page <strong>{page}</strong> (Server offset: {(page - 1) * 10})
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="btn btn-outline btn-sm"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={cases.length < 10 || isLoading}
              className="btn btn-outline btn-sm"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
