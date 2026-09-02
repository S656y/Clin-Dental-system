import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicalCase, UserAccount, DentalDepartment, SupervisorEvaluation, CaseStatus } from '../../types';
import { SupervisorCascadingLogbook } from './SupervisorCascadingLogbook';
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
  Filter,
  GraduationCap,
  BookOpen,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  Calendar,
  BarChart3,
  CheckSquare,
  FileText,
  User,
  Activity,
  Star,
  Printer,
  ChevronDown,
  Building2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface SupervisorDashboardProps {
  onSelectCase: (c: ClinicalCase) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  onSelectCase,
}) => {
  const { currentUser, cases, users, evaluateCase, quotas, t, language } = useApp();

  // Navigation Sub-tabs in Supervisor Logbook
  const [activeTab, setActiveTab] = useState<'cascading_logbook' | 'grading_queue' | 'grade_sheet' | 'overview_matrix'>('cascading_logbook');

  // If user is a Department Head or Supervisor, lock strictly to their assigned department
  const isRestrictedToDept =
    (currentUser.role === 'department_head' || currentUser.role === 'supervisor') &&
    !!currentUser.department;
  const userDept = currentUser.department as string;

  // Hierarchy Filters:
  // 1. Level Filter (المستوى الدراسي: الكل / المستوى الخامس / المستوى الرابع)
  const [selectedAcademicLevel, setSelectedAcademicLevel] = useState<'all' | 'level5' | 'level4'>('all');
  
  // 2. Clinical Group Filter (المجموعة السريرية)
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // 3. Department / Subject Filter
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    isRestrictedToDept ? userDept : 'all'
  );

  // Sync selectedDepartment if user switches
  useEffect(() => {
    if (isRestrictedToDept && userDept) {
      setSelectedDepartment(userDept);
    }
  }, [isRestrictedToDept, userDept]);

  const effectiveDepartment = isRestrictedToDept ? userDept : selectedDepartment;

  // 4. Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Student for direct Logbook Drill-down Drawer / Modal
  const [selectedStudentForLogbook, setSelectedStudentForLogbook] = useState<UserAccount | null>(null);

  // Quick Direct Evaluation Modal from Supervisor Logbook
  const [gradingCase, setGradingCase] = useState<ClinicalCase | null>(null);
  const [evalGrade, setEvalGrade] = useState<number>(90);
  const [evalInfectionControl, setEvalInfectionControl] = useState<number>(20);
  const [evalCavityPrep, setEvalCavityPrep] = useState<number>(22);
  const [evalRestoration, setEvalRestoration] = useState<number>(23);
  const [evalPatientManagement, setEvalPatientManagement] = useState<number>(13);
  const [evalEthics, setEvalEthics] = useState<number>(12);
  const [evalFeedbackNotes, setEvalFeedbackNotes] = useState<string>('');
  const [evalDecision, setEvalDecision] = useState<CaseStatus>('approved');

  // Helper to get Teaching Assistant for a Group and Subject
  const getTAForGroupAndSubject = (groupName?: string, deptKey?: string) => {
    return users.find((u) => {
      if (u.role !== 'teaching_assistant') return false;
      const matchGroup =
        u.clinicalGroup === groupName ||
        u.assignedGroupName === groupName ||
        (groupName && u.assignedGroupName?.toLowerCase().includes(groupName.toLowerCase().split(' ')[0]));
      const matchDept = !deptKey || !u.assignedSubject || u.assignedSubject === deptKey || u.department === deptKey;
      return matchGroup && matchDept;
    });
  };

  // Helper to get all TAs in a group
  const getTAsForGroup = (groupName?: string) => {
    return users.filter((u) => {
      if (u.role !== 'teaching_assistant') return false;
      return (
        u.clinicalGroup === groupName ||
        u.assignedGroupName === groupName ||
        (groupName && u.assignedGroupName?.includes(groupName.split(' ')[0]))
      );
    });
  };

  // All student users
  const allStudents = useMemo(() => {
    return users.filter((u) => u.role === 'student');
  }, [users]);

  // Distinct groups list
  const availableGroups = useMemo(() => {
    const groupsSet = new Set<string>();
    allStudents.forEach((s) => {
      if (s.clinicalGroup) groupsSet.add(s.clinicalGroup);
    });
    // Add known standard groups if not present
    groupsSet.add('Group A (العيادة 3)');
    groupsSet.add('Group B (العيادة 5)');
    groupsSet.add('Group C (العيادة 2)');
    return Array.from(groupsSet);
  }, [allStudents]);

  // Filtered Students according to Level & Group hierarchy
  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      // 1. Level Filter
      if (selectedAcademicLevel !== 'all') {
        const isL5 =
          student.academicLevel === 'level5' ||
          student.academicYear?.includes('خامس') ||
          student.academicYear?.includes('امتياز');
        const isL4 =
          student.academicLevel === 'level4' ||
          student.academicYear?.includes('رابع');

        if (selectedAcademicLevel === 'level5' && !isL5) return false;
        if (selectedAcademicLevel === 'level4' && !isL4) return false;
      }

      // 2. Group Filter
      if (selectedGroup !== 'all' && student.clinicalGroup !== selectedGroup) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = student.name.toLowerCase().includes(q);
        const matchId = (student.studentId || '').toLowerCase().includes(q);
        const matchGroup = (student.clinicalGroup || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchGroup) return false;
      }

      return true;
    });
  }, [allStudents, selectedAcademicLevel, selectedGroup, searchQuery]);

  // Cases awaiting Supervisor Grading
  const pendingGradingCases = useMemo(() => {
    return cases.filter((c) => {
      // Must be submitted under review or needs evaluation
      if (c.status !== 'under_review') return false;

      // Filter by Department if chosen
      if (selectedDepartment !== 'all' && c.department !== selectedDepartment) {
        return false;
      }

      // Filter by Level if chosen
      if (selectedAcademicLevel !== 'all') {
        const student = users.find((u) => u.id === c.studentId);
        const isL5 =
          student?.academicLevel === 'level5' ||
          c.studentAcademicYear?.includes('خامس') ||
          c.studentAcademicYear?.includes('امتياز');
        const isL4 =
          student?.academicLevel === 'level4' ||
          c.studentAcademicYear?.includes('رابع');
        if (selectedAcademicLevel === 'level5' && !isL5) return false;
        if (selectedAcademicLevel === 'level4' && !isL4) return false;
      }

      // Filter by Group if chosen
      if (selectedGroup !== 'all') {
        const student = users.find((u) => u.id === c.studentId);
        if (student && student.clinicalGroup !== selectedGroup) return false;
      }

      return true;
    });
  }, [cases, selectedDepartment, selectedAcademicLevel, selectedGroup, users]);

  // All Evaluated / Graded cases
  const gradedCases = useMemo(() => {
    return cases.filter((c) => {
      if (c.status !== 'approved' || !c.evaluation) return false;
      if (effectiveDepartment !== 'all' && c.department !== effectiveDepartment) return false;
      if (selectedAcademicLevel !== 'all') {
        const student = users.find((u) => u.id === c.studentId);
        const isL5 =
          student?.academicLevel === 'level5' ||
          c.studentAcademicYear?.includes('خامس') ||
          c.studentAcademicYear?.includes('امتياز');
        const isL4 =
          student?.academicLevel === 'level4' ||
          c.studentAcademicYear?.includes('رابع');
        if (selectedAcademicLevel === 'level5' && !isL5) return false;
        if (selectedAcademicLevel === 'level4' && !isL4) return false;
      }
      if (selectedGroup !== 'all') {
        const student = users.find((u) => u.id === c.studentId);
        if (student && student.clinicalGroup !== selectedGroup) return false;
      }
      return true;
    });
  }, [cases, effectiveDepartment, selectedAcademicLevel, selectedGroup, users]);

  // Handle opening Quick Grading modal
  const handleOpenGradingModal = (c: ClinicalCase) => {
    setGradingCase(c);
    setEvalGrade(c.evaluation?.grade || 92);
    setEvalInfectionControl(c.evaluation?.criteria.infectionControl || 20);
    setEvalCavityPrep(c.evaluation?.criteria.anesthesiaCavityPrep || 23);
    setEvalRestoration(c.evaluation?.criteria.restorationObturation || 23);
    setEvalPatientManagement(c.evaluation?.criteria.patientManagement || 13);
    setEvalEthics(c.evaluation?.criteria.professionalEthics || 13);
    setEvalFeedbackNotes(c.evaluation?.feedbackNotes || 'تم استيفاء معايير الجودة الإكلينيكية واعتماد الخطوات الميدانية بنجاح.');
    setEvalDecision('approved');
  };

  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingCase) return;

    const calculatedGrade =
      evalInfectionControl + evalCavityPrep + evalRestoration + evalPatientManagement + evalEthics;

    const evalData: SupervisorEvaluation = {
      grade: calculatedGrade,
      criteria: {
        infectionControl: evalInfectionControl,
        anesthesiaCavityPrep: evalCavityPrep,
        restorationObturation: evalRestoration,
        patientManagement: evalPatientManagement,
        professionalEthics: evalEthics,
      },
      feedbackNotes: evalFeedbackNotes || 'تم تقييم الحالة السريرية واعتماد درجات اللوج بوك.',
      evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      supervisorId: currentUser.id,
      supervisorName: currentUser.name,
      supervisorSignature: `${currentUser.name} - المشرف الإكلينيكي المعتمد`,
    };

    evaluateCase(gradingCase.id, evalDecision, evalData);
    setGradingCase(null);
  };

  const getDepartmentLabel = (deptKey?: string) => {
    switch (deptKey) {
      case 'operative':
        return 'العلاج التحفظي (Operative)';
      case 'endodontics':
        return 'علاج الجذور (Endo)';
      case 'prosthodontics':
        return 'الاستعاضة والتركيبات (Prosth)';
      case 'periodontics':
        return 'علاج اللثة (Perio)';
      case 'pedodontics':
        return 'طب أسنان الأطفال (Pedo)';
      case 'orthodontics':
        return 'تقويم الأسنان (Ortho)';
      case 'oral_surgery':
        return 'جراحة الفم (Oral Surgery)';
      default:
        return deptKey || 'العيادات العامة';
    }
  };

  // Standard Target Quota for Level
  const getTargetQuota = (student: UserAccount) => {
    if (effectiveDepartment !== 'all') {
      const quotaReq = quotas.find((q) => q.department === effectiveDepartment);
      if (quotaReq) return quotaReq.requiredUnits;
    }
    const isL5 =
      student.academicLevel === 'level5' ||
      student.academicYear?.includes('خامس') ||
      student.academicYear?.includes('امتياز');
    return isL5 ? 12 : 8; // 12 cases for 5th year, 8 for 4th year
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>قسم المشرفين الإكلينيكيين (Clinical Supervisors)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-500/30">
                <BookOpen className="w-3.5 h-3.5" />
                <span>اللوج بوك الإكلينيكي المعتمد (Clinical Logbook)</span>
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black">
              لوج بوك متابعة واعتماد درجات الطلاب السريرية 📑
            </h1>
            <p className="text-xs md:text-sm text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
              استعراض الحالات المكتملة والمحققة من الطلاب، مطابقة توقيعات المعيدين الميدانية، ورصد الدرجات النهائية وفق كوتا الإنجاز ومعايير الجودة السريرية.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black font-mono leading-none block">
                {pendingGradingCases.length}
              </span>
              <span className="text-[11px] text-blue-200">حالات تنتظر رصد الدرجات</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured Academic Level & Clinical Group Hierarchy Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>هيكلية تصفية اللوج بوك (المستوى الدراسي ← المجموعات السريرية ← المعيد المسؤول)</span>
          </h3>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            {filteredStudents.length} طلاب معروضين
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Level 1: Academic Level Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              1. المستوى الدراسي:
            </label>
            <select
              value={selectedAcademicLevel}
              onChange={(e) => setSelectedAcademicLevel(e.target.value as any)}
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">جميع المستويات الدراسية</option>
              <option value="level5">المستوى الخامس (امتياز / إكلينيكي متقدم)</option>
              <option value="level4">المستوى الرابع (تدريب سريري تأسيسي)</option>
            </select>
          </div>

          {/* Level 2: Clinical Group Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              2. المجموعة السريرية:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">جميع المجموعات السريرية</option>
              {availableGroups.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
          </div>

          {/* Level 3: Department / Subject Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              3. المادة التخصصية:
            </label>
            {isRestrictedToDept ? (
              <div className="w-full p-2 text-xs rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span className="truncate">{getDepartmentLabel(userDept)}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-mono shrink-0">
                  🔒 مقيد بالقسم
                </span>
              </div>
            ) : (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">كافة المواد والأقسام</option>
                <option value="operative">العلاج التحفظي (Operative)</option>
                <option value="endodontics">علاج الجذور (Endodontics)</option>
                <option value="prosthodontics">الاستعاضة والتركيبات (Prosthodontics)</option>
                <option value="periodontics">علاج اللثة (Periodontics)</option>
                <option value="oral_surgery">جراحة الفم (Oral Surgery)</option>
              </select>
            )}
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              4. بحث سريع:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اسم الطالب أو الرقم الأكاديمي..."
                className="w-full p-2 pl-7 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 gap-1.5 shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('cascading_logbook')}
          className={`flex-1 min-w-[200px] py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'cascading_logbook'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Filter className="w-4 h-4 text-amber-300" />
          <span>اللوج بوك الإكلينيكي والتصفية المتسلسلة (Cascading Logbook)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview_matrix')}
          className={`py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'overview_matrix'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>مصفوفة إنجاز المجموعات ({filteredStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grading_queue')}
          className={`py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'grading_queue'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>طابور رصد الدرجات ({pendingGradingCases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grade_sheet')}
          className={`py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'grade_sheet'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>كشف الدرجات والكوتا ({gradedCases.length})</span>
        </button>
      </div>

      {/* Tab 1: Cascading Filters Dynamic Logbook & Live TA Analytics */}
      {activeTab === 'cascading_logbook' && (
        <SupervisorCascadingLogbook onSelectCase={onSelectCase} />
      )}

      {/* Tab 2: Students Logbook Overview Matrix */}
      {activeTab === 'overview_matrix' && (
        <div className="space-y-6">
          {/* Quick Group Cards Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableGroups
              .filter((g) => selectedGroup === 'all' || g === selectedGroup)
              .map((grpName) => {
                const groupStudents = allStudents.filter((s) => s.clinicalGroup === grpName);
                const tas = getTAsForGroup(grpName);
                const grpCases = cases.filter((c) =>
                  groupStudents.some((gs) => gs.id === c.studentId)
                );
                const approvedCount = grpCases.filter((c) => c.status === 'approved').length;

                return (
                  <div
                    key={grpName}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          المجموعة السريرية
                        </span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-1">
                          {grpName}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {groupStudents.length} طلاب
                      </span>
                    </div>

                    {/* Assigned TA details */}
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">
                        المعيد المسؤول والمادة:
                      </span>
                      {tas.length > 0 ? (
                        tas.map((ta) => (
                          <div key={ta.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
                            <span className="truncate">{ta.name.split('(')[0]}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold shrink-0">
                              {getDepartmentLabel(ta.assignedSubject || ta.department)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">لم يتم تعيين معيد بعد</span>
                      )}
                    </div>

                    {/* Progress summary */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 font-semibold">
                      <span className="text-slate-500">الحالات المعتمدة:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {approvedCount} حالات
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Detailed Students Logbook List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  قائمة طلاب اللوج بوك وإنجاز الكوتا السريرية
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  رصد عدد الحالات المحققة، متوسط الدرجات المرصودة من المشرف، ومراجعة توقيعات المعيدين
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-bold">لا يوجد طلاب مطابقين للتصفية المحددة</p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const studentCases = cases.filter((c) => {
                    if (c.studentId !== student.id) return false;
                    if (effectiveDepartment !== 'all' && c.department !== effectiveDepartment) return false;
                    return true;
                  });
                  const approvedCases = studentCases.filter((c) => c.status === 'approved');
                  const underReviewCases = studentCases.filter((c) => c.status === 'under_review');
                  const needsCorrectionCases = studentCases.filter((c) => c.status === 'needs_correction');

                  const targetQuota = getTargetQuota(student);
                  const quotaPercentage = Math.min(
                    100,
                    Math.round((approvedCases.length / targetQuota) * 100)
                  );

                  // Calculate GPA / Average Grade
                  const evaluatedList = approvedCases.filter((c) => c.evaluation?.grade !== undefined);
                  const averageGrade =
                    evaluatedList.length > 0
                      ? Math.round(
                          evaluatedList.reduce((acc, c) => acc + (c.evaluation?.grade || 0), 0) /
                            evaluatedList.length
                        )
                      : null;

                  // Find assigned TA
                  const assignedTA = getTAForGroupAndSubject(student.clinicalGroup);

                  return (
                    <div
                      key={student.id}
                      className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all space-y-4"
                    >
                      {/* Top Student Card Info */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/30 shrink-0"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {student.name}
                              </h4>
                              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                {student.studentId || 'ID-2026'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                                {student.academicYear || (student.academicLevel === 'level5' ? 'السنة الخامسة' : 'السنة الرابعة')}
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300">
                                <Users className="w-3.5 h-3.5 text-indigo-600" />
                                {student.clinicalGroup || 'Group A'}
                              </span>
                              {assignedTA && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md font-medium">
                                    <Stethoscope className="w-3 h-3 text-teal-600" />
                                    المعيد المسؤول: {assignedTA.name.split('(')[0]} ({getDepartmentLabel(assignedTA.assignedSubject || assignedTA.department)})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress and Actions */}
                        <div className="flex flex-wrap items-center gap-4 lg:self-center">
                          {/* Progress Bar & Quota */}
                          <div className="w-48 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 text-[11px]">الكوتا السريرية:</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {approvedCases.length}/{targetQuota} حالة ({quotaPercentage}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  quotaPercentage >= 100
                                    ? 'bg-emerald-500'
                                    : quotaPercentage >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${quotaPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Average Grade Pill */}
                          <div className="p-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center min-w-[90px]">
                            <span className="text-[10px] text-slate-400 block">معدل الدرجات</span>
                            <span className="text-sm font-mono font-black text-blue-600 dark:text-blue-400">
                              {averageGrade !== null ? `${averageGrade}/100` : '—'}
                            </span>
                          </div>

                          {/* Drilldown button */}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForLogbook(student)}
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 flex items-center gap-1.5 transition-all border border-blue-200 dark:border-blue-800 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>استعراض لوج بوك الطالب ({studentCases.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* Student Cases Strip Peek */}
                      {studentCases.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                          {studentCases.map((sc) => {
                            const hasTAApproval = sc.procedureSteps.some((s) => s.supervisorSigned || s.stepStatus === 'approved');
                            const isGraded = sc.status === 'approved' && sc.evaluation?.grade;

                            return (
                              <div
                                key={sc.id}
                                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                    {sc.caseNumber}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                                    {getDepartmentLabel(sc.department)}
                                  </span>
                                </div>

                                <h5 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                  {sc.title}
                                </h5>

                                <div className="flex items-center justify-between pt-1 text-[11px]">
                                  {isGraded ? (
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      درجة المشرف: {sc.evaluation?.grade}/100
                                    </span>
                                  ) : (
                                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {hasTAApproval ? 'معتمد من المعيد - بانتظار الدرجة' : 'قيد التدريب'}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1">
                                    {!isGraded && sc.status === 'under_review' && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenGradingModal(sc)}
                                        className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 shadow-xs"
                                      >
                                        + رصد درجة
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => onSelectCase(sc)}
                                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700"
                                      title="فتح ملف الحالة الكامل"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Direct Grading Queue for Completed Cases */}
      {activeTab === 'grading_queue' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                طابور الحالات المكتملة والمرفوعة لاعتماد ورصد الدرجات
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                مراجعة توثيق خطوات المعيد الميداني، رصد درجة التقييم (من 100)، واعتماد إضافة الحالة لكوتا الطالب
              </p>
            </div>
          </div>

          {pendingGradingCases.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-500 opacity-60" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد حالات معلقة تنتظر رصد الدرجات حالياً
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                تم تقييم ورصد درجات كافة الحالات المرفوعة من الطلاب بنجاح.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingGradingCases.map((c) => {
                const student = users.find((u) => u.id === c.studentId);
                const assignedTA = getTAForGroupAndSubject(student?.clinicalGroup, c.department);
                const approvedStepsCount = c.procedureSteps.filter(
                  (s) => s.supervisorSigned || s.stepStatus === 'approved'
                ).length;

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500 transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                            {c.caseNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {getDepartmentLabel(c.department)}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
                          {c.title}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {c.createdAt.split(' ')[0]}
                      </span>
                    </div>

                    {/* Metadata Box */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">الطالب والمستوى:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {c.studentName} ({c.studentAcademicYear?.split('(')[0] || 'المستوى 5'})
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">المجموعة والمعيد:</span>
                        <span className="text-teal-700 dark:text-teal-300 font-bold">
                          {student?.clinicalGroup || 'Group A'} • {assignedTA?.name.split('(')[0] || 'معيد القسم'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">المريض ورقم الملف:</span>
                        <span className="font-semibold">
                          {c.patient.name} ({c.patient.fileNumber})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">خطوات المعيد الموقعة:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {approvedStepsCount}/{c.procedureSteps.length} خطوات معتمدة
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => onSelectCase(c)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فحص الملف السريري</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenGradingModal(c)}
                        className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Award className="w-4 h-4 text-amber-300" />
                        <span>رصد الدرجة واعتماد الحالة ←</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Official Clinical Grade Sheet */}
      {activeTab === 'grade_sheet' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                كشف رصد الدرجات الإكلينيكية المعتمدة (Clinical Evaluation Archive)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                سجل الدرجات الرسمية المعتمدة من المشرف والمحتسبة ضمن كوتا التخرج والتقييم النهائي
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الدرجات</span>
            </button>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 rounded-xl">
                <tr>
                  <th className="py-3 px-4 rounded-r-xl">رقم الحالة</th>
                  <th className="py-3 px-4">اسم الطالب والرقم</th>
                  <th className="py-3 px-4">المستوى والمجموعة</th>
                  <th className="py-3 px-4">المادة السريرية</th>
                  <th className="py-3 px-4">المريض</th>
                  <th className="py-3 px-4">الدرجة الممنوحة</th>
                  <th className="py-3 px-4">تاريخ الاعتماد</th>
                  <th className="py-3 px-4 text-center rounded-l-xl">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gradedCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      لا توجد حالات مقيمة بعد في كشف الدرجات
                    </td>
                  </tr>
                ) : (
                  gradedCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {c.caseNumber}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="block text-slate-900 dark:text-slate-100">
                          {c.studentName}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.studentAcademicYear?.split('(')[0]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {c.studentAcademicYear?.includes('خامس') ? 'المستوى 5' : 'المستوى 4'}
                      </td>
                      <td className="py-3 px-4">{getDepartmentLabel(c.department)}</td>
                      <td className="py-3 px-4 font-semibold">{c.patient.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                          {c.evaluation?.grade || 0}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {c.evaluation?.evaluatedAt || c.updatedAt}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectCase(c)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Logbook Modal / Drawer */}
      {selectedStudentForLogbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudentForLogbook.avatar}
                  alt={selectedStudentForLogbook.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-2xl object-cover border-2 border-blue-500/30"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>ملف اللوج بوك الإكلينيكي: {selectedStudentForLogbook.name}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedStudentForLogbook.studentId} • {selectedStudentForLogbook.academicYear} • {selectedStudentForLogbook.clinicalGroup}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForLogbook(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Quota & Stats banner */}
              {(() => {
                const stdCases = cases.filter((c) => {
                  if (c.studentId !== selectedStudentForLogbook.id) return false;
                  if (effectiveDepartment !== 'all' && c.department !== effectiveDepartment) return false;
                  return true;
                });
                const approvedCount = stdCases.filter((c) => c.status === 'approved').length;
                const targetQuota = getTargetQuota(selectedStudentForLogbook);

                return (
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">الحالات المسجلة</span>
                      <span className="text-base font-black font-mono text-slate-800 dark:text-slate-200">
                        {stdCases.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">الكوتا المعتمدة</span>
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {approvedCount}/{targetQuota}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">بانتظار رصد الدرجة</span>
                      <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                        {stdCases.filter((c) => c.status === 'under_review').length}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* All cases list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  سجل الحالات والخطوات المسجلة في اللوج بوك {isRestrictedToDept ? `لقسم (${getDepartmentLabel(userDept)})` : ''}:
                </h4>

                {cases.filter((c) => {
                  if (c.studentId !== selectedStudentForLogbook.id) return false;
                  if (effectiveDepartment !== 'all' && c.department !== effectiveDepartment) return false;
                  return true;
                }).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    لم يقم الطالب برفع أي حالات سريرية في هذا القسم حتى الآن
                  </p>
                ) : (
                  cases
                    .filter((c) => {
                      if (c.studentId !== selectedStudentForLogbook.id) return false;
                      if (effectiveDepartment !== 'all' && c.department !== effectiveDepartment) return false;
                      return true;
                    })
                    .map((sc) => (
                      <div
                        key={sc.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              {sc.caseNumber}
                            </span>
                            <h5 className="font-bold text-slate-900 dark:text-slate-100">{sc.title}</h5>
                            <span className="text-[11px] text-slate-500">
                              {getDepartmentLabel(sc.department)} • مريض: {sc.patient.name}
                            </span>
                          </div>

                          <div className="text-left">
                            {sc.evaluation?.grade ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                الدرجة: {sc.evaluation.grade}/100
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                قيد التقييم
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Steps overview */}
                        <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                          <span className="text-slate-400 font-semibold block">توثيق الخطوات السريرية:</span>
                          {sc.procedureSteps.map((step) => (
                            <div key={step.id} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span>
                                {step.stepNumber}. {step.title}
                              </span>
                              {step.supervisorSigned || step.stepStatus === 'approved' ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  معتمد ({step.signedByName || step.supervisorName})
                                </span>
                              ) : (
                                <span className="text-slate-400">قيد الإجراء</span>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForLogbook(null);
                              onSelectCase(sc);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200"
                          >
                            عرض الملف السريري الكامل
                          </button>
                          {sc.status === 'under_review' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentForLogbook(null);
                                handleOpenGradingModal(sc);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-600 shadow-xs"
                            >
                              رصد درجة المشرف
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Case Grading Modal */}
      {gradingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>رصد درجة التقييم الإكلينيكي للحالة السريرية</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {gradingCase.caseNumber} • {gradingCase.studentName} ({getDepartmentLabel(gradingCase.department)})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setGradingCase(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrading} className="p-5 overflow-y-auto space-y-4">
              {/* Summary of Case */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <span className="font-bold block">{gradingCase.title}</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                  المريض: {gradingCase.patient.name} ({gradingCase.patient.age} سنة) • التشخيص: {gradingCase.diagnosis}
                </span>
              </div>

              {/* Decision */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  القرار الإكلينيكي النهائي:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEvalDecision('approved')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      evalDecision === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد الحالة واحتساب الكوتا</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalDecision('needs_correction')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      evalDecision === 'needs_correction'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>إعادة للتعديل</span>
                  </button>
                </div>
              </div>

              {/* Rubric Criteria Sliders */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>معايير التقييم الإكلينيكي المعتمدة:</span>
                  <span className="font-mono text-blue-700 dark:text-blue-300 text-sm font-black">
                    المجموع: {evalInfectionControl + evalCavityPrep + evalRestoration + evalPatientManagement + evalEthics} / 100
                  </span>
                </div>

                {/* Criterion 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">1. مكافحة العدوى والتعقيم (20 درجة):</span>
                    <span className="font-mono font-bold">{evalInfectionControl}/20</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={evalInfectionControl}
                    onChange={(e) => setEvalInfectionControl(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Criterion 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">2. التخدير والتحضير السريري والعزل (25 درجة):</span>
                    <span className="font-mono font-bold">{evalCavityPrep}/25</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={evalCavityPrep}
                    onChange={(e) => setEvalCavityPrep(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Criterion 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">3. جودة الترميم والحشو/العلاج اللبي (25 درجة):</span>
                    <span className="font-mono font-bold">{evalRestoration}/25</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={evalRestoration}
                    onChange={(e) => setEvalRestoration(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Criterion 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">4. إدارة المريض والتواصل السريري (15 درجة):</span>
                    <span className="font-mono font-bold">{evalPatientManagement}/15</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={evalPatientManagement}
                    onChange={(e) => setEvalPatientManagement(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Criterion 5 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">5. الالتزام بالوقت والأخلاقيات المهنية (15 درجة):</span>
                    <span className="font-mono font-bold">{evalEthics}/15</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    value={evalEthics}
                    onChange={(e) => setEvalEthics(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              {/* Feedback notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات وتوجيهات المشرف الإكلينيكي في اللوج بوك:
                </label>
                <textarea
                  value={evalFeedbackNotes}
                  onChange={(e) => setEvalFeedbackNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="أدخل التوجيهات الأكاديمية ونقاط القوة للمريض والطالب..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setGradingCase(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-blue-700 hover:bg-blue-600 text-white shadow-xs"
                >
                  حفظ الدرجة وتوثيق اللوج بوك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
