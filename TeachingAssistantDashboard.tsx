import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicalCase, UserAccount, ClinicalProcedureStep } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Users,
  Search,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  ClipboardList,
  Stethoscope,
  ChevronLeft,
  XCircle,
  MessageSquare,
  ShieldCheck,
  FileText,
  User,
  Activity,
  Layers,
  Calendar,
  Send,
  Lock,
} from 'lucide-react';

interface TeachingAssistantDashboardProps {
  onSelectCase: (c: ClinicalCase) => void;
}

export const TeachingAssistantDashboard: React.FC<TeachingAssistantDashboardProps> = ({
  onSelectCase,
}) => {
  const {
    currentUser,
    cases,
    users,
    signProcedureStep,
    t,
    language,
    subjectGroups,
    taAllocations,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'approvals' | 'students' | 'history'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseForSteps, setSelectedCaseForSteps] = useState<ClinicalCase | null>(null);

  // Note dialog state for Request Changes / Rejection
  const [activeStepActionModal, setActiveStepActionModal] = useState<{
    caseId: string;
    stepId: string;
    action: 'needs_correction' | 'reject';
    stepTitle: string;
  } | null>(null);
  const [actionNote, setActionNote] = useState('');

  // 1. Triple-link Isolation Logic & Allocations:
  const taSubject = currentUser.assignedSubject || currentUser.department || 'operative';
  const taGroup = currentUser.assignedGroupName || currentUser.clinicalGroup || 'Group A (العيادة 3)';

  // Find all groups & subjects this TA is allocated to in subjectGroups and taAllocations:
  const taSubjectGroupConfigs = subjectGroups.filter((sg) => sg.assignedTaId === currentUser.id);
  const taDirectAllocations = taAllocations.filter((a) => a.taId === currentUser.id);

  // Student IDs assigned through subject groups
  const subjectGroupStudentIds = new Set<string>();
  taSubjectGroupConfigs.forEach((sg) => {
    if (sg.studentIds) {
      sg.studentIds.forEach((id) => subjectGroupStudentIds.add(id));
    }
  });

  // Isolated Students:
  const assignedStudents = users.filter((u) => {
    if (u.role !== 'student') return false;
    if (currentUser.assignedStudentIds && currentUser.assignedStudentIds.includes(u.id)) {
      return true;
    }
    if (subjectGroupStudentIds.has(u.id)) {
      return true;
    }
    if (taDirectAllocations.some((a) => a.groupCode === u.clinicalGroup)) {
      return true;
    }
    return u.clinicalGroup === taGroup;
  });

  const assignedStudentIds = assignedStudents.map((s) => s.id);

  // Isolated Cases:
  // 1. Directly assigned to this TA: c.assignedTaId === currentUser.id
  // 2. Or from assigned student in TA's subject
  // 3. Or student in subjectGroups for this TA in that subject
  // 4. Or student in taAllocations for this TA in that subject
  const isolatedCases = cases.filter((c) => {
    // 1. Direct match by assignedTaId
    if (c.assignedTaId && c.assignedTaId === currentUser.id) {
      return true;
    }

    // 2. Match via subjectGroups
    const matchingSubjectGroup = taSubjectGroupConfigs.find(
      (sg) => sg.subjectId === c.department && sg.studentIds && sg.studentIds.includes(c.studentId)
    );
    if (matchingSubjectGroup) {
      return true;
    }

    // 3. Match via taAllocations
    const matchingAlloc = taDirectAllocations.find(
      (a) => a.subjectId === c.department && (a.groupCode === c.clinicalGroup || (a.assignedStudentIds && a.assignedStudentIds.includes(c.studentId)))
    );
    if (matchingAlloc) {
      return true;
    }

    // 4. Fallback to student list & subject
    const isStudentAssigned = assignedStudentIds.includes(c.studentId);
    const isDepartmentMatch = !taSubject || c.department === taSubject || !c.department;
    return isStudentAssigned && isDepartmentMatch;
  });

  // Pending items:
  const pendingCases = isolatedCases.filter((c) => c.status === 'under_review');
  const approvedCases = isolatedCases.filter((c) => c.status === 'approved');
  const needsCorrectionCases = isolatedCases.filter((c) => c.status === 'needs_correction');

  // Count total pending procedure steps in isolated cases:
  const pendingStepsCount = isolatedCases.reduce((acc, c) => {
    const unapproved = c.procedureSteps.filter(
      (s) => !s.supervisorSigned && s.stepStatus !== 'approved'
    ).length;
    return acc + unapproved;
  }, 0);

  // Filtered by search query:
  const filteredCases = isolatedCases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.patient.name.toLowerCase().includes(q)
    );
  });

  const handleStepAction = (
    caseId: string,
    stepId: string,
    action: 'approve' | 'needs_correction' | 'reject',
    notes?: string
  ) => {
    signProcedureStep(caseId, stepId, action, notes);
    
    // Update local selected case view if open
    if (selectedCaseForSteps && selectedCaseForSteps.id === caseId) {
      const updated = cases.find((c) => c.id === caseId);
      if (updated) setSelectedCaseForSteps(updated);
    }
  };

  const handleConfirmStepModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStepActionModal) return;
    if (!actionNote.trim()) {
      alert(language === 'ar' ? 'يرجى كتابة الملاحظة أو سبب الإجراء' : 'Please provide notes for this action');
      return;
    }

    handleStepAction(
      activeStepActionModal.caseId,
      activeStepActionModal.stepId,
      activeStepActionModal.action,
      actionNote
    );

    setActiveStepActionModal(null);
    setActionNote('');
  };

  const getDepartmentLabel = (deptKey?: string) => {
    switch (deptKey) {
      case 'operative':
        return 'طب الأسنان التحفظي وحشو الأسنان (Operative Dentistry)';
      case 'endodontics':
        return 'علاج الجذور والأقنية اللبية (Endodontics)';
      case 'prosthodontics':
        return 'الاستعاضة الصناعية والتركيبات (Prosthodontics)';
      case 'periodontics':
        return 'طب وجراحة اللثة (Periodontics)';
      case 'pedodontics':
        return 'طب أسنان الأطفال (Pedodontics)';
      case 'orthodontics':
        return 'تقويم الأسنان والفكين (Orthodontics)';
      case 'oral_surgery':
        return 'جراحة الفم والوجه والفكين (Oral Surgery)';
      default:
        return deptKey || 'العيادات السريرية';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Triple-Link Badge */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>قسم المعيدين الإكلينيكيين (Teaching Assistant)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-semibold border border-cyan-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>نظام العزل الثلاثي المعتمد</span>
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black">
              لوحة اعتماد ومتابعة طلاب المجموعة السريرية 🩺
            </h1>

            {/* Triple-link Metadata Pill */}
            <div className="mt-3 inline-flex flex-wrap items-center gap-2 bg-slate-950/40 backdrop-blur-md p-2 px-3 rounded-2xl border border-white/10 text-xs text-slate-200">
              <span className="font-bold text-teal-300">المعيد:</span>
              <span>{currentUser.name} ({currentUser.staffId || 'TA-01'})</span>
              <span className="text-slate-600">|</span>
              <span className="font-bold text-cyan-300">المادة:</span>
              <span>{getDepartmentLabel(taSubject)}</span>
              <span className="text-slate-600">|</span>
              <span className="font-bold text-amber-300">المجموعة:</span>
              <span>{taGroup}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black font-mono leading-none block">
                {pendingCases.length}
              </span>
              <span className="text-[11px] text-teal-200">حالات للمراجعة</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Isolation Guarantee & Scope Notice */}
      <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            <strong>نطاق الصلاحية محصور (Data Isolation Active):</strong> يقتصر ظهور الحالات وطلبات الاعتماد على طلاب <strong>{taGroup}</strong> في مادة <strong>{getDepartmentLabel(taSubject)}</strong> فقط.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-teal-200 dark:bg-teal-900 text-[11px] font-bold text-teal-800 dark:text-teal-300">
          {assignedStudents.length} طلاب مسندين
        </span>
      </div>

      {/* 3. Fast Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>طلاب المجموعة</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {assignedStudents.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">في {taGroup}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>خطوات قيد الإنجاز</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
            {pendingStepsCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">تتطلب توقيع سريري</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>حالات معتمدة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {approvedCases.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">احتسبت في الكوتا</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ملاحظات تعديل</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-2xl font-black font-mono text-orange-600 dark:text-orange-400">
            {needsCorrectionCases.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">أعيدت للطلاب</span>
        </div>
      </div>

      {/* 4. Main Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'approvals'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>طابور المراجعة والاعتماد السريري للخطوات ({isolatedCases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'students'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>قائمة طلاب المجموعة ({assignedStudents.length})</span>
        </button>
      </div>

      {/* Tab 1: Step-by-Step Approval Queue & Case Sheets */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-600" />
                سجل الحالات والخطوات السريرية لطلابك
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                مراجعة خطة العلاج، التشخيص، وتوثيق اعتماد كل خطوة سريرية بالطابع الزمني الرسمي للمعيد
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الحالة أو اسم الطالب..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                لا توجد حالات معلقة لطلاب مجموعتك حالياً
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                جميع الحالات والخطوات السريرية لطلاب {taGroup} في مادة {getDepartmentLabel(taSubject)} مكتملة ومعتمدة.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCases.map((c) => {
                const totalSteps = c.procedureSteps.length;
                const completedSteps = c.procedureSteps.filter(
                  (s) => s.supervisorSigned || s.stepStatus === 'approved'
                ).length;

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 transition-all space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                              {c.caseNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {getDepartmentLabel(c.department)}
                            </span>
                          </div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                            {c.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectCase(c)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض كامل الملف</span>
                        </button>
                      </div>
                    </div>

                    {/* Student & Patient Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                      <div>
                        <span className="text-slate-400 block text-[10px]">الطالب المعالج:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 text-teal-600" />
                          {c.studentName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{c.studentAcademicYear}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">المريض ورقم الملف:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
                          {c.patient.name} ({c.patient.age} سنة - {c.patient.gender === 'male' ? 'ذكر' : 'أنثى'})
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">ملف: {c.patient.fileNumber}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">حالة الاعتماد والتقدم:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full transition-all"
                              style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-bold font-mono text-[11px] text-teal-600 dark:text-teal-400">
                            {completedSteps}/{totalSteps} خطوات
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Diagnosis & Treatment Plan Peek */}
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">التشخيص السريري: </span>
                        <span className="text-slate-600 dark:text-slate-400">{c.diagnosis}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">خطة العلاج المعتمدة: </span>
                        <span className="text-slate-600 dark:text-slate-400 line-clamp-2 whitespace-pre-line">
                          {c.treatmentPlan}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Interactive Review Section */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-teal-600" />
                          خطوات الإجراء السريري ومطابقة المعايير:
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          انقر على أي إجراء لاعتماده أو طلب تعديله مع توثيق التوقيع
                        </span>
                      </div>

                      <div className="space-y-2">
                        {c.procedureSteps.map((step) => {
                          const isApproved = step.supervisorSigned || step.stepStatus === 'approved';
                          const isNeedsCorrection = step.stepStatus === 'needs_correction';
                          const isRejected = step.stepStatus === 'rejected';

                          return (
                            <div
                              key={step.id}
                              className={`p-3 rounded-2xl border transition-all ${
                                isApproved
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                                  : isNeedsCorrection
                                  ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/60'
                                  : isRejected
                                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                              }`}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {step.stepNumber}
                                    </span>
                                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                      {step.title}
                                    </h5>
                                    {isApproved && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                        <CheckCircle2 className="w-3 h-3" />
                                        معتمدة سريرياً
                                      </span>
                                    )}
                                    {isNeedsCorrection && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300">
                                        <AlertTriangle className="w-3 h-3" />
                                        مطلوب تعديل
                                      </span>
                                    )}
                                    {isRejected && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300">
                                        <XCircle className="w-3 h-3" />
                                        مرفوضة
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 pr-7">
                                    {step.description}
                                  </p>

                                  {/* Notes & Signature details */}
                                  {step.feedbackNotes && (
                                    <div className="pr-7 text-[11px] text-orange-700 dark:text-orange-300 flex items-center gap-1 mt-1 font-semibold">
                                      <MessageSquare className="w-3 h-3 shrink-0" />
                                      <span>ملاحظة المشرف: {step.feedbackNotes}</span>
                                    </div>
                                  )}

                                  {step.signedTimestamp && (
                                    <div className="pr-7 text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                                      <span>
                                        توقيع: {step.signedByName || step.supervisorName} | {step.signedTimestamp}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons for this Step */}
                                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                                  <button
                                    type="button"
                                    onClick={() => handleStepAction(c.id, step.id, 'approve')}
                                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                                      isApproved
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>اعتماد (Approve)</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveStepActionModal({
                                        caseId: c.id,
                                        stepId: step.id,
                                        action: 'needs_correction',
                                        stepTitle: step.title,
                                      })
                                    }
                                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 hover:bg-orange-200 transition-all flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>طلب تعديل</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveStepActionModal({
                                        caseId: c.id,
                                        stepId: step.id,
                                        action: 'reject',
                                        stepTitle: step.title,
                                      })
                                    }
                                    className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-red-600 dark:bg-slate-800 dark:text-red-400 hover:bg-red-50 transition-all flex items-center gap-1"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>رفض</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assigned Students Progress Roster */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              قائمة الطلاب المسندين للمعيد في {taGroup}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              متابعة الإنجاز والكوتا الأكاديمية لكل طالب في مادة {getDepartmentLabel(taSubject)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedStudents.map((student) => {
              const studentCases = isolatedCases.filter((c) => c.studentId === student.id);
              const approvedCount = studentCases.filter((c) => c.status === 'approved').length;
              const pendingCount = studentCases.filter((c) => c.status === 'under_review').length;

              return (
                <div
                  key={student.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-500/30 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {student.name}
                      </h4>
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-mono block">
                        {student.studentId || 'ID-2026'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {student.academicYear || 'السنة الخامسة'} | {student.clinicalGroup || taGroup}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">إجمالي الحالات</span>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {studentCases.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">المعتمدة</span>
                      <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {approvedCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">بانتظار المراجعة</span>
                      <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                        {pendingCount}
                      </span>
                    </div>
                  </div>

                  {studentCases.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        آخر الحالات المسجلة للطالب:
                      </span>
                      {studentCases.slice(0, 2).map((sc) => (
                        <div
                          key={sc.id}
                          onClick={() => onSelectCase(sc)}
                          className="p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer flex items-center justify-between text-xs transition-all"
                        >
                          <span className="truncate max-w-[200px] text-slate-800 dark:text-slate-200 font-medium">
                            {sc.title}
                          </span>
                          <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold shrink-0">
                            {sc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Action Notes Modal */}
      {activeStepActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {activeStepActionModal.action === 'needs_correction' ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-orange-500" />
                    <span>طلب تعديل سريري على الخطوة</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>توثيق سبب رفض الخطوة</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setActiveStepActionModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStepModal} className="p-5 space-y-4">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">الخطوة المستهدفة:</span>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                  {activeStepActionModal.stepTitle}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات وتوجيهات المعيد للطالب: <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    activeStepActionModal.action === 'needs_correction'
                      ? 'مثال: يرجى إعادة عزل السن وضبط الحواف قبل وضع مادة الحشو...'
                      : 'اذكر سبب عدم قبول هذه الخطوة السريرية...'
                  }
                  rows={3}
                  required
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-[11px] text-teal-800 dark:text-teal-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  سيتم توثيق اسمك <strong>({currentUser.name})</strong> والتاريخ والتوقيت اللحظي بدقة دون تعديل بيانات المريض.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStepActionModal(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-xs ${
                    activeStepActionModal.action === 'needs_correction'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  تأكيد الإجراء وتوثيق التوقيع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
