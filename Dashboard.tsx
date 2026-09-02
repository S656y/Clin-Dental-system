import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicalCase, DentalDepartment } from '../../types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StudentDashboard } from '../views/StudentDashboard';
import { SupervisorDashboard } from '../views/SupervisorDashboard';
import { TeachingAssistantDashboard } from '../views/TeachingAssistantDashboard';
import { DepartmentHeadDashboard } from '../views/DepartmentHeadDashboard';
import { DeanDashboard } from '../views/DeanDashboard';
import { FounderDashboard } from '../views/FounderDashboard';
import { StudentClinicalRequirements } from '../views/StudentClinicalRequirements';
import { CaseBuilder } from '../cases/CaseBuilder';
import { CaseDetailModal } from '../cases/CaseDetailModal';
import { SpecializedClinicalGroupsView } from '../views/SpecializedClinicalGroupsView';

export const Dashboard: React.FC = () => {
  const { currentUser } = useApp();

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isCaseBuilderOpen, setIsCaseBuilderOpen] = useState<boolean>(false);
  const [editingCase, setEditingCase] = useState<ClinicalCase | null>(null);
  const [initialDept, setInitialDept] = useState<DentalDepartment | undefined>(undefined);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<ClinicalCase | null>(null);

  const handleOpenNewCase = (dept?: string) => {
    setEditingCase(null);
    setInitialDept(dept as DentalDepartment | undefined);
    setIsCaseBuilderOpen(true);
  };

  const handleEditCase = (c: ClinicalCase) => {
    setEditingCase(c);
    setInitialDept(undefined);
    setIsCaseBuilderOpen(true);
    setSelectedCaseForDetail(null);
  };

  const handleSelectCase = (c: ClinicalCase) => {
    setSelectedCaseForDetail(c);
  };

  const renderRoleDashboard = () => {
    switch (currentUser.role) {
      case 'student':
        return (
          <StudentDashboard
            onOpenCaseBuilder={handleOpenNewCase}
            onSelectCase={handleSelectCase}
            onEditCase={handleEditCase}
          />
        );
      case 'supervisor':
        return <SupervisorDashboard onSelectCase={handleSelectCase} />;
      case 'teaching_assistant':
        return <TeachingAssistantDashboard onSelectCase={handleSelectCase} />;
      case 'department_head':
        return <DepartmentHeadDashboard onSelectCase={handleSelectCase} />;
      case 'dean':
        return <DeanDashboard onSelectCase={handleSelectCase} />;
      case 'founder':
      default:
        return (
          <FounderDashboard
            onSelectCase={handleSelectCase}
            onEditCase={handleEditCase}
          />
        );
    }
  };

  return (
    <div className="clin-shell min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Header onOpenCaseBuilder={handleOpenNewCase} />

      <main className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            onOpenCaseBuilder={handleOpenNewCase}
          />

          <div className="flex-1 min-w-0 w-full overflow-hidden">
            {activeView === 'dashboard' && renderRoleDashboard()}
            {activeView === 'curriculum' && (currentUser.role === 'student' || currentUser.role === 'founder') && (
              <StudentClinicalRequirements onOpenCaseBuilder={handleOpenNewCase} />
            )}
            {activeView === 'curriculum' && currentUser.role !== 'student' && currentUser.role !== 'founder' && (
              renderRoleDashboard()
            )}
            {activeView === 'subject_groups' && currentUser.role === 'founder' && (
              <SpecializedClinicalGroupsView />
            )}
            {activeView === 'subject_groups' && currentUser.role !== 'founder' && renderRoleDashboard()}
            {activeView === 'accounts' && currentUser.role === 'founder' && (
              <FounderDashboard initialTab="accounts" onSelectCase={handleSelectCase} onEditCase={handleEditCase} />
            )}
            {activeView === 'audit' && currentUser.role === 'founder' && (
              <FounderDashboard initialTab="audit" onSelectCase={handleSelectCase} onEditCase={handleEditCase} />
            )}
            {activeView === 'system' && currentUser.role === 'founder' && (
              <FounderDashboard initialTab="system" onSelectCase={handleSelectCase} onEditCase={handleEditCase} />
            )}
          </div>
        </div>
      </main>

      {/* Case Builder Wizard Modal */}
      {isCaseBuilderOpen && (
        <CaseBuilder
          onClose={() => {
            setIsCaseBuilderOpen(false);
            setEditingCase(null);
            setInitialDept(undefined);
          }}
          onSuccess={() => {
            setIsCaseBuilderOpen(false);
            setEditingCase(null);
            setInitialDept(undefined);
          }}
          initialCase={editingCase || undefined}
          initialDepartment={initialDept}
        />
      )}

      {/* Case Detail & Supervisor Evaluation Modal */}
      {selectedCaseForDetail && (
        <CaseDetailModal
          clinicalCase={selectedCaseForDetail}
          onClose={() => setSelectedCaseForDetail(null)}
          onEdit={() => handleEditCase(selectedCaseForDetail)}
        />
      )}
    </div>
  );
};
