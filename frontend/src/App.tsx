import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { SignUpView } from './components/auth/SignUpView';
import { Layout } from './components/layout/Layout';
import { DashboardOverview } from './pages/DashboardOverview';
import { CaseListView } from './pages/CaseListView';
import { RbacAuditView } from './pages/RbacAuditView';
import { CaseDetailModal } from './components/cases/CaseDetailModal';
import { CaseCreateModal } from './components/cases/CaseCreateModal';
import { CaseStatusUpdateModal } from './components/cases/CaseStatusUpdateModal';
import { CaseDeleteDialog } from './components/cases/CaseDeleteDialog';
import { AdminSignUpModal } from './components/admin/AdminSignUpModal';
import { MedicalCase } from './types/api';
import { api } from './api/client';
import { useToast } from './context/ToastContext';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Case list state
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoadingCases, setIsLoadingCases] = useState<boolean>(false);

  // Modal active states
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [caseForStatusUpdate, setCaseForStatusUpdate] = useState<MedicalCase | null>(null);
  const [caseForDelete, setCaseForDelete] = useState<MedicalCase | null>(null);
  const [isAdminSignUpOpen, setIsAdminSignUpOpen] = useState<boolean>(false);

  const fetchCases = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingCases(true);
    try {
      const data = await api.getCases({
        page,
        status: statusFilter || undefined,
      });
      setCases(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch medical cases', 'Network Error');
    } finally {
      setIsLoadingCases(false);
    }
  }, [isAuthenticated, page, statusFilter, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCases();
    }
  }, [isAuthenticated, fetchCases]);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
        }}
      >
        <span className="loading-spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'signup') {
      return <SignUpView onBackToLogin={() => setAuthMode('login')} />;
    }
    return <LoginView onToggleSignUp={() => setAuthMode('signup')} />;
  }

  return (
    <Layout
      currentView={currentView}
      onSelectView={setCurrentView}
      caseCount={cases.length}
      onOpenAdminSignUp={() => setIsAdminSignUpOpen(true)}
    >
      {currentView === 'dashboard' && (
        <DashboardOverview
          cases={cases}
          isLoading={isLoadingCases}
          onNavigateToCases={() => setCurrentView('cases')}
          onOpenCreateCase={() => setIsCreateModalOpen(true)}
          onSelectCase={(id) => setSelectedCaseId(id)}
        />
      )}

      {currentView === 'cases' && (
        <CaseListView
          cases={cases}
          isLoading={isLoadingCases}
          page={page}
          onPageChange={setPage}
          statusFilter={statusFilter}
          onStatusFilterChange={(st) => {
            setStatusFilter(st);
            setPage(1);
          }}
          onRefresh={fetchCases}
          onSelectCase={(id) => setSelectedCaseId(id)}
          onOpenCreateCase={() => setIsCreateModalOpen(true)}
          onOpenUpdateStatus={(item) => setCaseForStatusUpdate(item)}
          onOpenDeleteDialog={(item) => setCaseForDelete(item)}
        />
      )}

      {currentView === 'system' && <RbacAuditView />}

      {/* Case Details Modal */}
      {selectedCaseId && (
        <CaseDetailModal
          caseId={selectedCaseId}
          onClose={() => setSelectedCaseId(null)}
          onUpdateStatus={(item) => {
            setSelectedCaseId(null);
            setCaseForStatusUpdate(item);
          }}
          onDeleteCase={(item) => {
            setSelectedCaseId(null);
            setCaseForDelete(item);
          }}
        />
      )}

      {/* Case Create Modal */}
      {isCreateModalOpen && (
        <CaseCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchCases();
          }}
        />
      )}

      {/* Status Update Modal */}
      {caseForStatusUpdate && (
        <CaseStatusUpdateModal
          caseItem={caseForStatusUpdate}
          onClose={() => setCaseForStatusUpdate(null)}
          onSuccess={() => {
            setCaseForStatusUpdate(null);
            fetchCases();
          }}
        />
      )}

      {/* Case Delete Confirmation Dialog */}
      {caseForDelete && (
        <CaseDeleteDialog
          caseItem={caseForDelete}
          onClose={() => setCaseForDelete(null)}
          onSuccess={() => {
            setCaseForDelete(null);
            fetchCases();
          }}
        />
      )}

      {/* Admin Sign Up Modal */}
      {isAdminSignUpOpen && (
        <AdminSignUpModal
          onClose={() => setIsAdminSignUpOpen(false)}
          onSuccess={() => setIsAdminSignUpOpen(false)}
        />
      )}
    </Layout>
  );
};
