import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DentalDepartment, ClinicalCase, DepartmentQuotaRequirement } from '../../types';
import {
  GraduationCap,
  Sliders,
  BarChart3,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Edit2,
  Save,
  ChevronDown,
  Lock,
  Building2,
  ShieldCheck,
  Plus,
  Trash2,
  Crown,
  X,
  Search,
  Filter,
  Layers,
  Calendar,
  Eye,
} from 'lucide-react';

interface DepartmentHeadDashboardProps {
  onSelectCase: (c: ClinicalCase) => void;
}

export const DepartmentHeadDashboard: React.FC<DepartmentHeadDashboardProps> = ({
  onSelectCase,
}) => {
  const { currentUser, users, cases, quotas, updateQuota, deleteQuota, addQuota, t, language } = useApp();

  const [activeTab, setActiveTab] = useState<'matrix' | 'quotas' | 'distribution'>('matrix');
  
  // If user is a Department Head, lock strictly to their assigned department
  const isDeptHead = currentUser.role === 'department_head';
  const isFounder = currentUser.role === 'founder';
  const assignedDept = (currentUser.department as DentalDepartment) || 'operative';

  const [selectedDept, setSelectedDept] = useState<DentalDepartment>(
    isDeptHead ? assignedDept : currentUser.department || 'operative'
  );

  // Matrix Filter States
  const [matrixLevelFilter, setMatrixLevelFilter] = useState<'all' | 'level4' | 'level5'>('all');
  const [matrixSemesterFilter, setMatrixSemesterFilter] = useState<'all' | 'first' | 'second'>('all');
  const [matrixGroupFilter, setMatrixGroupFilter] = useState<string>('all');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState<string>('');

  // Modal / Form state for Editing or Adding a Quota
  const [editingQuota, setEditingQuota] = useState<DepartmentQuotaRequirement | null>(null);
  const [isAddingQuota, setIsAddingQuota] = useState(false);
  const [quotaFormDept, setQuotaFormDept] = useState<DentalDepartment>('operative');
  const [quotaFormUnits, setQuotaFormUnits] = useState(10);
  const [quotaFormDescAr, setQuotaFormDescAr] = useState('');
  const [quotaFormDescEn, setQuotaFormDescEn] = useState('');

  // Sync selectedDept if currentUser changes
  useEffect(() => {
    if (isDeptHead && currentUser.department) {
      setSelectedDept(currentUser.department as DentalDepartment);
    }
  }, [isDeptHead, currentUser.department]);

  const activeDept = isDeptHead ? assignedDept : selectedDept;
  const students = users.filter((u) => u.role === 'student');

  const getStudentLevel = (std: typeof students[0]): 'level4' | 'level5' => {
    if (std.academicLevel === 'level5' || std.academicYear?.includes('الخامسة') || std.academicYear?.includes('5')) {
      return 'level5';
    }
    return 'level4';
  };

  const getStudentSemester = (std: typeof students[0]): 'first' | 'second' => {
    if (std.semester === 'second') {
      return 'second';
    }
    return 'first';
  };

  const handleOpenEditQuota = (q: DepartmentQuotaRequirement) => {
    setEditingQuota(q);
    setQuotaFormDept(q.department);
    setQuotaFormUnits(q.requiredUnits);
    setQuotaFormDescAr(q.descriptionAr);
    setQuotaFormDescEn(q.descriptionEn);
    setIsAddingQuota(false);
  };

  const handleOpenAddQuota = () => {
    setEditingQuota(null);
    setQuotaFormDept('operative');
    setQuotaFormUnits(10);
    setQuotaFormDescAr('');
    setQuotaFormDescEn('');
    setIsAddingQuota(true);
  };

  const handleSaveQuotaForm = (e: React.FormEvent) => {
    e.preventDefault();
    const quotaData: DepartmentQuotaRequirement = {
      department: quotaFormDept,
      departmentNameAr: t[quotaFormDept] || quotaFormDept,
      departmentNameEn: quotaFormDept,
      requiredUnits: Number(quotaFormUnits) || 1,
      descriptionAr: quotaFormDescAr.trim() || `متطلبات إنجاز حالات قسم ${t[quotaFormDept]} السريرية`,
      descriptionEn: quotaFormDescEn.trim() || `Graduation clinical requirements for ${quotaFormDept}`,
    };

    if (editingQuota) {
      updateQuota(editingQuota.department, quotaData);
    } else {
      addQuota(quotaData);
    }

    setEditingQuota(null);
    setIsAddingQuota(false);
  };

  const handleDeleteQuotaClick = (dept: DentalDepartment | string) => {
    if (window.confirm(`هل أنت متأكد من حذف متطلبات كوتا قسم [${dept}]؟`)) {
      deleteQuota(dept);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>
                {isDeptHead
                  ? `رئاسة قسم ${t[activeDept] || activeDept}`
                  : 'رئاسة الأقسام التخصصية والأكاديمية'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black">
              إدارة قسم {t[activeDept] || activeDept} ورصد درجات الطلاب 📊
            </h1>
            <p className="text-xs md:text-sm text-purple-100/80 mt-1 max-w-xl">
              {isDeptHead
                ? `عرض حصري لبيانات ودرجات مادة (${t[activeDept]}) ومجموعات الطلاب التابعة للقسم وفق صلاحيات رئيس القسم.`
                : 'تقسيم وتوزيع الطلاب على مجموعات المواد، إدارة متطلبات التخرج، ومصفوفة تقييم وإنجاز الطلاب.'}
            </p>
          </div>

          {/* Department Selection / Lock Badge */}
          {isDeptHead ? (
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-purple-400/30">
              <div className="p-1.5 rounded-lg bg-purple-500/30 text-purple-200">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-purple-200 block font-medium">القسم المخصص لرئاستك:</span>
                <span className="text-xs font-black text-white">{t[activeDept] || activeDept}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/10">
              <span className="text-xs text-purple-200 ml-2 mr-2">القسم المعروض:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as DentalDepartment)}
                className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-500/40 outline-none"
              >
                <option value="operative">{t.operative}</option>
                <option value="endodontics">{t.endodontics}</option>
                <option value="prosthodontics">{t.prosthodontics}</option>
                <option value="periodontics">{t.periodontics}</option>
                <option value="pedodontics">{t.pedodontics}</option>
                <option value="oral_surgery">{t.oral_surgery}</option>
                <option value="orthodontics">{t.orthodontics}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'matrix'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>مصفوفة كشف درجات الطلاب ({t[activeDept]})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotas')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'quotas'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>معايير كوتا القسم</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('distribution')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'distribution'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>توزيع الإجراءات</span>
        </button>
      </div>

      {/* Tab 1: Academic Grade Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-0">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <span>مصفوفة إنجاز ودرجات الطلاب في مادة ({t[activeDept]})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                الحد الأدنى للكوتا المطلوب: {quotas.find((q) => q.department === activeDept)?.requiredUnits || 10} حالة معتمدة
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-3 py-1 rounded-xl">
                قسم {t[activeDept]}
              </span>
            </div>
          </div>

          {/* Filter Toolbar: Level, Semester, Group, Search */}
          <div className="p-3.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={matrixSearchQuery}
                onChange={(e) => setMatrixSearchQuery(e.target.value)}
                placeholder="بحث باسم الطالب أو رقمه..."
                className="w-full pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="text-[11px] text-slate-500 shrink-0 font-bold">المستوى:</span>
              <select
                value={matrixLevelFilter}
                onChange={(e) => setMatrixLevelFilter(e.target.value as 'all' | 'level4' | 'level5')}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none w-full cursor-pointer"
              >
                <option value="all">كافة المستويات (م4 وم5)</option>
                <option value="level4">المستوى الرابع (م4)</option>
                <option value="level5">المستوى الخامس (م5)</option>
              </select>
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="text-[11px] text-slate-500 shrink-0 font-bold">الترم:</span>
              <select
                value={matrixSemesterFilter}
                onChange={(e) => setMatrixSemesterFilter(e.target.value as 'all' | 'first' | 'second')}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none w-full cursor-pointer"
              >
                <option value="all">كافة الأترام</option>
                <option value="first">الترم الأول</option>
                <option value="second">الترم الثاني</option>
              </select>
            </div>

            {/* Group Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-[11px] text-slate-500 shrink-0 font-bold">المجموعة:</span>
              <select
                value={matrixGroupFilter}
                onChange={(e) => setMatrixGroupFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none w-full cursor-pointer"
              >
                <option value="all">كافة المجموعات</option>
                {Array.from(new Set(students.map((s) => s.clinicalGroup).filter(Boolean))).map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">الطالب والرقم الجامعي</th>
                  <th className="py-3 px-4">المستوى الدراسي والترم</th>
                  <th className="py-3 px-4">السنة والمجموعة</th>
                  <th className="py-3 px-4 text-center">الكوتا المنجزة في المادة</th>
                  <th className="py-3 px-4 text-center">متوسط درجات المادة</th>
                  <th className="py-3 px-4 text-center">حالة استيفاء كوتا المادة</th>
                  <th className="py-3 px-4 text-center">حالات المادة المرفوعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students
                  .filter((std) => {
                    const stdLevel = getStudentLevel(std);
                    const stdSemester = getStudentSemester(std);

                    if (matrixLevelFilter !== 'all' && stdLevel !== matrixLevelFilter) return false;
                    if (matrixSemesterFilter !== 'all' && stdSemester !== matrixSemesterFilter) return false;
                    if (matrixGroupFilter !== 'all' && std.clinicalGroup !== matrixGroupFilter) return false;
                    if (matrixSearchQuery.trim()) {
                      const q = matrixSearchQuery.toLowerCase();
                      const matchName = std.name?.toLowerCase().includes(q);
                      const matchId = std.studentId?.toLowerCase().includes(q);
                      if (!matchName && !matchId) return false;
                    }
                    return true;
                  })
                  .map((std) => {
                    const stdLevel = getStudentLevel(std);
                    const stdSemester = getStudentSemester(std);

                    const stdDeptCases = cases.filter(
                      (c) => c.studentId === std.id && c.department === activeDept
                    );
                    const approvedCases = stdDeptCases.filter((c) => c.status === 'approved');
                    const requiredUnits =
                      quotas.find((q) => q.department === activeDept)?.requiredUnits || 10;
                    const isCompleted = approvedCases.length >= requiredUnits;

                    const totalScores = approvedCases.reduce(
                      (acc, c) => acc + (c.evaluation?.grade || 0),
                      0
                    );
                    const avgScore = approvedCases.length > 0 ? Math.round(totalScores / approvedCases.length) : '-';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={std.avatar}
                              alt={std.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <strong className="block text-slate-900 dark:text-slate-100">{std.name}</strong>
                              <span className="font-mono text-slate-400 text-[11px]">{std.studentId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Academic Level and Semester cell */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  stdLevel === 'level5'
                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                }`}
                              >
                                {stdLevel === 'level5' ? 'المستوى الخامس (م5)' : 'المستوى الرابع (م4)'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  stdSemester === 'second'
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                    : 'bg-teal-50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                                }`}
                              >
                                {stdSemester === 'second' ? 'الترم الثاني' : 'الترم الأول'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="block text-slate-700 dark:text-slate-300 font-medium">{std.academicYear || '2025-2026'}</span>
                          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold font-mono">
                            {std.clinicalGroup || 'Group A1'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          <span className="text-sm text-slate-900 dark:text-slate-100">{approvedCases.length}</span>
                          <span className="text-slate-400 text-xs"> / {requiredUnits}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {avgScore !== '-' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              {avgScore}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              مستوفٍ للكوتا
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              قيد الاستكمال ({Math.max(0, requiredUnits - approvedCases.length)} متبقي)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                            {stdDeptCases.length} حالة
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Quota Requirements Editor */}
      {activeTab === 'quotas' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>لوائح ومتطلبات التخرج السريرية {isDeptHead ? `لقسم (${t[activeDept]})` : ''}</span>
                {isFounder && (
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                    تحكم سيادي كامل
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                تحديد وتعديل عدد الحالات الإلزامية والمواصفات السريرية المعتمدة
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddQuota}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كوتا جديدة</span>
            </button>
          </div>

          {/* Quota Modal / Form Drawer */}
          {(editingQuota || isAddingQuota) && (
            <form onSubmit={handleSaveQuotaForm} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-teal-500/30 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-teal-600" />
                  <span>{editingQuota ? `تعديل متطلبات كوتا (${editingQuota.departmentNameAr})` : 'إضافة متطلبات كوتا لقسم سريري جديد'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuota(null);
                    setIsAddingQuota(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">القسم السريري</label>
                  <select
                    value={quotaFormDept}
                    onChange={(e) => setQuotaFormDept(e.target.value as DentalDepartment)}
                    disabled={!!editingQuota}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-bold"
                  >
                    <option value="operative">{t.operative}</option>
                    <option value="endodontics">{t.endodontics}</option>
                    <option value="prosthodontics">{t.prosthodontics}</option>
                    <option value="periodontics">{t.periodontics}</option>
                    <option value="pedodontics">{t.pedodontics}</option>
                    <option value="oral_surgery">{t.oral_surgery}</option>
                    <option value="orthodontics">{t.orthodontics}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">عدد الحالات الإلزامية</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quotaFormUnits}
                    onChange={(e) => setQuotaFormUnits(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-mono font-bold"
                    required
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الوصف والمواصفات السريرية (عربي)</label>
                  <input
                    type="text"
                    value={quotaFormDescAr}
                    onChange={(e) => setQuotaFormDescAr(e.target.value)}
                    placeholder="مثال: حشوات كمبوزيت وأملغم صنف أول وثانٍ"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuota(null);
                    setIsAddingQuota(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ المتطلبات</span>
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotas
              .filter((q) => (isDeptHead ? q.department === activeDept : true))
              .map((q) => (
                <div
                  key={q.department}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{t[q.department] || q.departmentNameAr}</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-xl">
                        {q.requiredUnits} حالة معتمدة
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditQuota(q)}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
                        title="تعديل متطلبات الكوتا"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {(isFounder || !isDeptHead) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteQuotaClick(q.department)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
                          title="حذف متطلبات الكوتا"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {q.descriptionAr}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Distribution */}
      {activeTab === 'distribution' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            توزيع الإجراءات السريرية المنفذة في قسم ({t[activeDept]})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-center">
              <span className="text-2xl font-black font-mono text-teal-700 dark:text-teal-300 block">
                {cases.filter((c) => c.department === activeDept && c.status === 'approved').length}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                حالة معتمدة ومحتسبة
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300 block">
                {cases.filter((c) => c.department === activeDept && c.status === 'under_review').length}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                حالة قيد المراجعة السريرية
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-center">
              <span className="text-2xl font-black font-mono text-orange-700 dark:text-orange-300 block">
                {cases.filter((c) => c.department === activeDept && c.status === 'needs_correction').length}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                حالة تحت التعديل والتصحيح
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
