import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicalCase, DentalDepartment } from '../../types';
import { StudentClinicalRequirements } from './StudentClinicalRequirements';
import { STUDENT_CLINICAL_CURRICULUM } from '../../utils/studentCurriculumData';
import {
  FolderPlus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Layers,
  Calendar,
  Users,
  Send,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenCaseBuilder: () => void;
  onSelectCase: (c: ClinicalCase) => void;
  onEditCase: (c: ClinicalCase) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenCaseBuilder,
  onSelectCase,
  onEditCase,
}) => {
  const {
    currentUser,
    cases,
    quotas,
    deleteCase,
    submitCaseForReview,
    t,
    language,
    studentActiveSemester,
    setStudentActiveSemester,
  } = useApp();

  const [activePortalTab, setActivePortalTab] = useState<'curriculum' | 'logbook'>('curriculum');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  const handleSubmitForReview = (c: ClinicalCase) => {
    submitCaseForReview(c.id, c.supervisorId, c.assignedTaId);
    const taName = c.assignedTaName ? ` والمُعيد المسؤول (${c.assignedTaName})` : '';
    setSubmitSuccessMsg(`✅ تم تحويل الحالة [${c.caseNumber}] بنجاح إلى المشرف الإكلينيكي${taName} للمراجعة والاعتماد.`);
    setTimeout(() => {
      setSubmitSuccessMsg(null);
    }, 4500);
  };

  // Strict Academic Level Calculation
  const isLevel4 =
    currentUser.academicLevel === 'level4' ||
    currentUser.academicYear?.includes('الرابعة') ||
    currentUser.academicYear?.includes('4');
  const studentLevel: 'level4' | 'level5' = isLevel4 ? 'level4' : 'level5';

  // Active semester within the student's level
  const [activeSemester, setActiveSemester] = useState<'first' | 'second'>(
    currentUser.semester || studentActiveSemester || 'first'
  );

  const handleSemesterSwitch = (sem: 'first' | 'second') => {
    setActiveSemester(sem);
    if (setStudentActiveSemester) {
      setStudentActiveSemester(sem);
    }
  };

  // Curriculum data for the student's level & active semester
  const currentLevelCurriculum =
    STUDENT_CLINICAL_CURRICULUM.find((l) => l.id === studentLevel) ||
    STUDENT_CLINICAL_CURRICULUM[1];
  const currentSemesterCurriculum =
    currentLevelCurriculum.semesters.find((s) => s.id === activeSemester) ||
    currentLevelCurriculum.semesters[0];
  const semesterSubjects = currentSemesterCurriculum.subjects;

  // Filter cases for the current student
  const myCases = cases.filter((c) => c.studentId === currentUser.id);

  // Filter by department, status, search
  const filteredCases = myCases.filter((c) => {
    if (selectedDeptFilter !== 'all' && c.department !== selectedDeptFilter) return false;
    if (selectedStatusFilter !== 'all' && c.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchNumber = c.caseNumber.toLowerCase().includes(q);
      const matchPatient = c.patient.name.toLowerCase().includes(q);
      if (!matchTitle && !matchNumber && !matchPatient) return false;
    }
    return true;
  });

  const approvedCases = myCases.filter((c) => c.status === 'approved');
  const underReviewCases = myCases.filter((c) => c.status === 'under_review');
  const needsCorrectionCases = myCases.filter((c) => c.status === 'needs_correction');
  const draftCases = myCases.filter((c) => c.status === 'draft');

  // Calculate semester quota progress based on level subjects
  const semesterSubjectTargets = semesterSubjects.map((sub) => {
    const targetCases = sub.items.reduce((sum, item) => sum + (item.targetCount || 1), 0);
    const completedCount = approvedCases.filter(
      (c) => c.department === sub.departmentKey
    ).length;
    return {
      id: sub.id,
      departmentKey: sub.departmentKey,
      nameAr: sub.nameAr,
      nameEn: sub.nameEn,
      requiredUnits: targetCases,
      completedUnits: completedCount,
      isFinished: completedCount >= targetCases,
      percentage: targetCases > 0 ? Math.min(Math.round((completedCount / targetCases) * 100), 100) : 0,
    };
  });

  const totalRequiredUnits = semesterSubjectTargets.reduce((acc, q) => acc + q.requiredUnits, 0);
  const totalEarnedUnits = semesterSubjectTargets.reduce((acc, q) => acc + q.completedUnits, 0);
  const overallPercentage =
    totalRequiredUnits > 0
      ? Math.min(Math.round((totalEarnedUnits / totalRequiredUnits) * 100), 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Banner - Strict Level & Term Branding */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                {studentLevel === 'level4' ? (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>المستوى الرابع (Level 4)</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>المستوى الخامس - سنة التخرج (Level 5)</span>
                  </>
                )}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 text-slate-200 text-xs font-semibold border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>{activeSemester === 'first' ? 'الترم الأول' : 'الترم الثاني'}</span>
              </span>

              {currentUser.clinicalGroup && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  <Users className="w-3.5 h-3.5" />
                  <span>{currentUser.clinicalGroup}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              أهلاً بك يا دكتور {currentUser.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs md:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
              بوابة الطالب الإكلينيكية المخصصة لـ{' '}
              <span className="text-teal-300 font-bold">
                {studentLevel === 'level4' ? 'السنة الرابعة' : 'السنة الخامسة'} (
                {activeSemester === 'first' ? 'الترم الأول' : 'الترم الثاني'})
              </span>
              : استعراض الخطة المعتمدة لمستواك، إنجاز كوتا المواد السريرية، وتوثيق الحالات.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Semester Switcher Pill in Top Banner */}
            <div className="flex items-center bg-teal-900/60 p-1 rounded-2xl border border-teal-700/60 shadow-inner">
              <button
                type="button"
                onClick={() => handleSemesterSwitch('first')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSemester === 'first'
                    ? 'bg-teal-400 text-slate-950 shadow-md'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                الترم الأول
              </button>
              <button
                type="button"
                onClick={() => handleSemesterSwitch('second')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSemester === 'second'
                    ? 'bg-teal-400 text-slate-950 shadow-md'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                الترم الثاني
              </button>
            </div>

            <button
              type="button"
              id="student-new-case-btn"
              onClick={onOpenCaseBuilder}
              className="px-5 py-3 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs md:text-sm shadow-lg hover:shadow-teal-400/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{t.createNewCase}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Student Portal Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActivePortalTab('curriculum')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePortalTab === 'curriculum'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>
            🎓 خطة ومتطلبات {studentLevel === 'level4' ? 'المستوى 4' : 'المستوى 5'} (
            {activeSemester === 'first' ? 'الترم 1' : 'الترم 2'})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActivePortalTab('logbook')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePortalTab === 'logbook'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📋 السجل الإكلينيكي والحالات ({myCases.length})</span>
        </button>
      </div>

      {/* Tab 1: Curriculum & Requirements View */}
      {activePortalTab === 'curriculum' && (
        <StudentClinicalRequirements
          onOpenCaseBuilder={onOpenCaseBuilder}
          myCases={myCases}
          defaultLevelId={studentLevel}
        />
      )}

      {/* Tab 2: Clinical Logbook & Cases View */}
      {activePortalTab === 'logbook' && (
        <div className="space-y-6">
          {/* Needs Correction Urgent Alert Banner */}
          {needsCorrectionCases.length > 0 && (
            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500 text-white shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    لديك ({needsCorrectionCases.length}) حالة سريرية تتطلب مراجعة وتعديلاً
                  </h4>
                  <p className="text-xs text-orange-800 dark:text-orange-300 mt-0.5">
                    أعاد المشرف الإكلينيكي الحالة مع توجيهات إرشادية. يرجى الاطلاع على الملاحظات وإعادة إرسالها.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectCase(needsCorrectionCases[0])}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                عرض ملاحظات المشرف ←
              </button>
            </div>
          )}

          {/* Quota Progress Overview Card - Strictly for Student's Level & Active Semester */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      متابعة كوتا مواد {studentLevel === 'level4' ? 'السنة الرابعة' : 'السنة الخامسة'} (
                      {activeSemester === 'first' ? 'الترم الأول' : 'الترم الثاني'})
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      {semesterSubjects.length} مواد سريرية
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    استيفاء {totalEarnedUnits} من أصل {totalRequiredUnits} حالة مطلوبة في متطلبات هذا الترم
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                  {overallPercentage}%
                </span>
                <span className="text-xs text-slate-400 font-semibold">مكتمل</span>
              </div>
            </div>

            {/* Global Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            {/* Specialty Breakdown Grid - Filtered to Student's Level Courses */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {semesterSubjectTargets.map((subject) => (
                <div
                  key={subject.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    subject.isFinished
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">
                    <span className="truncate">{subject.nameAr}</span>
                    {subject.isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </div>
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {subject.completedUnits}/{subject.requiredUnits}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{subject.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        subject.isFinished ? 'bg-emerald-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Status Counts Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono">{approvedCases.length}</span>
                <p className="text-xs text-slate-500">{t.approved}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono">{underReviewCases.length}</span>
                <p className="text-xs text-slate-500">{t.under_review}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono">{needsCorrectionCases.length}</span>
                <p className="text-xs text-slate-500">{t.needs_correction}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono">{draftCases.length}</span>
                <p className="text-xs text-slate-500">{t.draft}</p>
              </div>
            </div>
          </div>

          {/* Digital Logbook & Cases Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-4 md:p-6 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.navLogbook} ({myCases.length} حالة سريرية)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-3 pr-9 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Department Filter - tailored to student level subjects */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-semibold"
            >
              <option value="all">كل مواد هذا الترم ({semesterSubjects.length})</option>
              {semesterSubjects.map((sub) => (
                <option key={sub.id} value={sub.departmentKey}>
                  {sub.nameAr}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-semibold"
            >
              <option value="all">كافة الحالات</option>
              <option value="approved">{t.approved}</option>
              <option value="under_review">{t.under_review}</option>
              <option value="needs_correction">{t.needs_correction}</option>
              <option value="draft">{t.draft}</option>
            </select>
          </div>
        </div>

        {/* Success Alert */}
        {submitSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{submitSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmitSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Cases List Table */}
        <div className="overflow-x-auto">
          {filteredCases.length > 0 ? (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">رقم الحالة والتاريخ</th>
                  <th className="py-3.5 px-4">عنوان الإجراء السريري</th>
                  <th className="py-3.5 px-4">القسم والمشرف والمعيد</th>
                  <th className="py-3.5 px-4">المريض</th>
                  <th className="py-3.5 px-4">الحالة والدرجة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                        {c.caseNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">{c.createdAt}</span>
                    </td>

                    <td className="py-3 px-4">
                      <strong className="text-slate-900 dark:text-slate-100 block text-xs max-w-xs truncate">
                        {c.title}
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        {Object.keys(c.dentalChart || {}).length} أسنان موثقة • {c.radiographs.length} صور أشعة
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {t[c.department]}
                      </span>
                      <div className="flex flex-col text-[11px] text-slate-500 space-y-0.5 mt-0.5">
                        <span>المشرف: {c.supervisorName || 'مشرف القسم'}</span>
                        <span className="text-cyan-700 dark:text-cyan-400 font-medium">
                          المعيد: {c.assignedTaName || 'معيد المجموعة'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {c.patient.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {c.patient.fileNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        {c.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            معتمدة ({c.evaluation?.grade}/100)
                          </span>
                        )}
                        {c.status === 'under_review' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Clock className="w-3 h-3" />
                            {t.under_review}
                          </span>
                        )}
                        {c.status === 'needs_correction' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                            <AlertTriangle className="w-3 h-3" />
                            {t.needs_correction}
                          </span>
                        )}
                        {c.status === 'draft' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <FileText className="w-3 h-3" />
                            {t.draft}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Direct Submit for Review Action Button */}
                        {(c.status === 'draft' || c.status === 'needs_correction') && (
                          <button
                            type="button"
                            onClick={() => handleSubmitForReview(c)}
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 transition-colors flex items-center gap-1 px-2 font-bold"
                            title="تحويل الحالة إلى المراجعة والاعتماد (إرسال للمُعيد والمشرف)"
                          >
                            <Send className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span className="text-[10px]">تحويل للاعتماد</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectCase(c)}
                          className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                          title={t.viewDetails}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(c.status === 'draft' || c.status === 'needs_correction') && (
                          <button
                            type="button"
                            onClick={() => onEditCase(c)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={t.editCase}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {c.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذه المسودة؟')) {
                                deleteCase(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title={t.deleteCase}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold">لا توجد حالات سريرية مطابقة للتصفية</p>
              <button
                type="button"
                onClick={onOpenCaseBuilder}
                className="mt-3 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs"
              >
                + إنشاء حالة جديدة الآن
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
      )}
    </div>
  );
};
