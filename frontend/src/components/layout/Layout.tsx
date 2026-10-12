import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onSelectView: (view: string) => void;
  caseCount?: number;
  onOpenAdminSignUp?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView,
  onSelectView,
  caseCount = 0,
  onOpenAdminSignUp,
}) => {
  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        onSelectView={onSelectView}
        caseCount={caseCount}
      />
      <div className="main-wrapper">
        <Header
          currentView={currentView}
          onOpenAdminSignUp={onOpenAdminSignUp}
        />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};
