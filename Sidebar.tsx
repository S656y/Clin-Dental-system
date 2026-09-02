import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderPlus,
  BookOpen,
  Award,
  Layers,
  Users,
  ShieldCheck,
  GraduationCap,
  Building2,
  History,
  Database,
  Sliders,
  Sparkles,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenCaseBuilder: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenCaseBuilder,
}) => {
  const { currentUser, t, cases } = useApp();

  const isStudent = currentUser.role === 'student';
  const isSupervisor = currentUser.role === 'supervisor';
  const isTA = currentUser.role === 'teaching_assistant';
  const isHead = currentUser.role === 'department_head';
  const isDean = currentUser.role === 'dean';
  const isFounder = currentUser.role === 'founder';

  const pendingCount = cases.filter((c) => {
    if (isTA) {
      const taGroup = currentUser.assignedGroupName || currentUser.clinicalGroup;
      const taSubject = currentUser.assignedSubject || currentUser.department;
      const isStudentMatch = currentUser.assignedStudentIds?.includes(c.studentId);
      const isDeptMatch = !taSubject || c.department === taSubject;
      return c.status === 'under_review' && (isStudentMatch || c.studentAcademicYear?.includes(taGroup || '')) && isDeptMatch;
    }
    return c.status === 'under_review';
  }).length;
  const needsCorrectionCount = cases.filter(
    (c) => c.status === 'needs_correction' && c.studentId === currentUser.id
  ).length;

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      {/* User Info Capsule */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          referrerPolicy="no-referrer"
          className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-500/40 shrink-0"
        />
        <div className="overflow-hidden">
          <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-slate-100 truncate">
            {currentUser.name}
          </h3>
          <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 block truncate">
            {t[currentUser.role]}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block truncate">
            {currentUser.studentId || currentUser.department || currentUser.email}
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="p-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 text-xs font-bold">
        {/* Universal Dashboard Link */}
        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className={`w-full text-right p-3 rounded-2xl flex items-center justify-between transition-all ${
            activeView === 'dashboard'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة التحكم الرئيسية</span>
          </div>
          {(isSupervisor || isTA) && pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-mono">
              {pendingCount}
            </span>
          )}
          {isStudent && needsCorrectionCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-400 text-white font-mono">
              {needsCorrectionCount}
            </span>
          )}
        </button>

        {/* Clinical Requirements & Curriculum Link - Restricted to Student & Founder */}
        {(isStudent || isFounder) && (
          <button
            type="button"
            onClick={() => setActiveView('curriculum')}
            className={`w-full text-right p-3 rounded-2xl flex items-center justify-between transition-all ${
              activeView === 'curriculum'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4" />
              <span>الخطة الإكلينيكية والمتطلبات</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold">
              {isStudent
                ? (currentUser.academicLevel === 'level4' || currentUser.academicYear?.includes('الرابعة') || currentUser.academicYear?.includes('4') ? 'المستوى 4' : 'المستوى 5')
                : 'م4 & م5'}
            </span>
          </button>
        )}

        {/* Student Specific Items */}
        {isStudent && (
          <>
            <button
              type="button"
              onClick={onOpenCaseBuilder}
              className="w-full text-right p-3 rounded-2xl flex items-center gap-2.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-all font-bold"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ {t.createNewCase}</span>
            </button>
          </>
        )}

        {/* Founder Only Items */}
        {isFounder && (
          <>
            <button
              type="button"
              onClick={() => setActiveView('subject_groups')}
              className={`w-full text-right p-3 rounded-2xl flex items-center justify-between transition-all ${
                activeView === 'subject_groups'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>إدارة وتوزيع المجموعات السريرية</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                حصر للمؤسس
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('accounts')}
              className={`w-full text-right p-3 rounded-2xl flex items-center gap-2.5 transition-all ${
                activeView === 'accounts'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>إدارة الحسابات الشاملة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('audit')}
              className={`w-full text-right p-3 rounded-2xl flex items-center gap-2.5 transition-all ${
                activeView === 'audit'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>سجل التدقيق والحماية (Audit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('system')}
              className={`w-full text-right p-3 rounded-2xl flex items-center gap-2.5 transition-all ${
                activeView === 'system'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>النسخ الاحتياطي وإعادة الضبط</span>
            </button>
          </>
        )}
      </div>

      {/* Clinical Reference Widget */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 text-xs space-y-2">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold">
          <HeartPulse className="w-4 h-4 text-teal-600" />
          <span>منظومة الاعتماد الإكلينيكي</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          نظام متوافق مع معايير ترقيم الأسنان الدولية (FDI/ISO 3950) ومواصفات جودة التعليم الطبي لطب وجراحة الأسنان.
        </p>
      </div>
    </aside>
  );
};
