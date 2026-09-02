import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Sparkles,
  Search,
  Filter,
  Info,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Layers,
  Award,
  Check,
  Circle,
  Clock,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STUDENT_CLINICAL_CURRICULUM } from '../../utils/studentCurriculumData';
import { CurriculumLevel, CurriculumSemester, CurriculumSubject, ClinicalCase } from '../../types';

interface StudentClinicalRequirementsProps {
  onOpenCaseBuilder?: (deptKey?: string) => void;
  myCases?: ClinicalCase[];
  defaultLevelId?: 'level4' | 'level5';
}

export const StudentClinicalRequirements: React.FC<StudentClinicalRequirementsProps> = ({
  onOpenCaseBuilder,
  myCases = [],
  defaultLevelId,
}) => {
  const { currentUser, studentActiveSemester, setStudentActiveSemester } = useApp();

  // Determine student's actual level if logged in as student
  const isStudent = currentUser.role === 'student';
  const derivedStudentLevel: 'level4' | 'level5' =
    currentUser.academicLevel === 'level4' ||
    currentUser.academicYear?.includes('الرابعة') ||
    currentUser.academicYear?.includes('4')
      ? 'level4'
      : 'level5';

  const initialLevel = isStudent ? derivedStudentLevel : (defaultLevelId || 'level5');
  const [selectedLevelId, setSelectedLevelId] = useState<'level4' | 'level5'>(initialLevel);

  // If student role, ensure level stays locked to their registered academic level
  useEffect(() => {
    if (isStudent) {
      setSelectedLevelId(derivedStudentLevel);
    }
  }, [isStudent, derivedStudentLevel]);

  const [selectedSemesterId, setSelectedSemesterId] = useState<'first' | 'second'>(
    currentUser.semester || studentActiveSemester || 'first'
  );

  const [selectedDeptKey, setSelectedDeptKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const handleSemesterChange = (sem: 'first' | 'second') => {
    setSelectedSemesterId(sem);
    if (setStudentActiveSemester) {
      setStudentActiveSemester(sem);
    }
    setSelectedDeptKey('all');
  };

  const [activeChecklist, setActiveChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('clindent_student_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCheck = (itemId: string) => {
    setActiveChecklist((prev) => {
      const updated = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem('clindent_student_checklist', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const toggleNotes = (subjectId: string) => {
    setExpandedNotes((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const currentLevel: CurriculumLevel =
    STUDENT_CLINICAL_CURRICULUM.find((l) => l.id === selectedLevelId) ||
    STUDENT_CLINICAL_CURRICULUM[1];

  const currentSemester: CurriculumSemester =
    currentLevel.semesters.find((s) => s.id === selectedSemesterId) || currentLevel.semesters[0];

  // Filter subjects by Department and Search
  const filteredSubjects = currentSemester.subjects.filter((sub) => {
    if (selectedDeptKey !== 'all' && sub.departmentKey !== selectedDeptKey) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = sub.nameAr.toLowerCase().includes(q) || sub.nameEn.toLowerCase().includes(q);
    const matchItems = sub.items.some(
      (item) =>
        item.titleAr.toLowerCase().includes(q) ||
        (item.titleEn && item.titleEn.toLowerCase().includes(q))
    );
    return matchName || matchItems;
  });

  // Calculate statistics
  const totalItems = currentSemester.subjects.reduce((sum, s) => sum + s.items.length, 0);
  const completedItems = currentSemester.subjects
    .flatMap((s) => s.items)
    .filter((item) => activeChecklist[item.id]).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Department icon and color styling
  const getDeptMeta = (deptKey: string) => {
    switch (deptKey) {
      case 'operative':
        return {
          label: 'العلاج التحفظي',
          color: 'blue',
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
          badge: 'bg-blue-600 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600',
        };
      case 'endodontics':
        return {
          label: 'علاج الجذور',
          color: 'purple',
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
          badge: 'bg-purple-600 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600',
        };
      case 'prosthodontics':
        return {
          label: 'الاستعاضة الصناعية',
          color: 'amber',
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          badge: 'bg-amber-600 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600',
        };
      case 'periodontics':
        return {
          label: 'أمراض اللثة',
          color: 'emerald',
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
          badge: 'bg-emerald-600 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600',
        };
      case 'pedodontics':
        return {
          label: 'طب أسنان الأطفال',
          color: 'pink',
          bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900',
          badge: 'bg-pink-600 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-pink-400 dark:hover:border-pink-600',
        };
      case 'oral_surgery':
        return {
          label: 'جراحة الفم',
          color: 'rose',
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
          badge: 'bg-rose-600 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600',
        };
      default:
        return {
          label: 'عام',
          color: 'teal',
          bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
          badge: 'bg-teal-600 text-white',
          cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600',
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Sleek Top Header & Segmented Selectors */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Level & Term Quick Switcher */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Level Display / Switcher */}
          {isStudent ? (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-slate-900 rounded-2xl border border-teal-200/80 dark:border-teal-800 self-start">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                {selectedLevelId === 'level4' ? <BookOpen className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">المستوى الدراسي المعتمد:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-600 text-white shadow-xs">
                    {selectedLevelId === 'level4' ? 'السنة الرابعة (Level 4)' : 'السنة الخامسة (Level 5)'}
                  </span>
                </div>
                <span className="text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                  {selectedLevelId === 'level4'
                    ? 'العيادات التأسيسية الشاملة - طب وجراحة الأسنان'
                    : 'العيادات المتقدمة وسنة التخرج السريرية'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 self-start">
              <button
                type="button"
                onClick={() => setSelectedLevelId('level4')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedLevelId === 'level4'
                    ? 'bg-white dark:bg-teal-600 text-teal-700 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>المستوى الرابع</span>
                <span className="text-[10px] opacity-75 font-normal">4th Year</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLevelId('level5')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedLevelId === 'level5'
                    ? 'bg-white dark:bg-teal-600 text-teal-700 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>المستوى الخامس (التخرج)</span>
                <span className="text-[10px] opacity-75 font-normal">5th Year</span>
              </button>
            </div>
          )}

          {/* Semester Switcher & Progress Mini Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleSemesterChange('first')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSemesterId === 'first'
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>الترم الأول</span>
              </button>
              <button
                type="button"
                onClick={() => handleSemesterChange('second')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSemesterId === 'second'
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>الترم الثاني</span>
              </button>
            </div>

            {/* Quick Completion Percentage Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold">
              <span>إنجاز متطلبات {selectedSemesterId === 'first' ? 'الترم الأول' : 'الترم الثاني'}:</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">
                {completedItems} / {totalItems}
              </span>
              <div className="w-12 bg-teal-200/70 dark:bg-teal-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="font-mono text-[11px]">{progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedDeptKey('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDeptKey === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              جميع المواد ({currentSemester.subjects.length})
            </button>
            {currentSemester.subjects.map((sub) => {
              const meta = getDeptMeta(sub.departmentKey);
              const isSelected = selectedDeptKey === sub.departmentKey;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedDeptKey(sub.departmentKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <span>{meta.label}</span>
                  {!sub.hasNoRequirements && (
                    <span className="text-[10px] opacity-75 font-mono">({sub.items.length})</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع..."
              className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Subject Requirement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubjects.map((subject) => {
          const meta = getDeptMeta(subject.departmentKey);
          const hasNotesOrRules = Boolean(
            (subject.rulesAndNotes && subject.rulesAndNotes.length > 0) ||
              (subject.conditions && subject.conditions.length > 0)
          );
          const isNotesExpanded = expandedNotes[subject.id];

          // Subject completion check
          const subTotal = subject.items.length;
          const subDone = subject.items.filter((i) => activeChecklist[i.id]).length;
          const isSubComplete = subTotal > 0 && subDone === subTotal;

          return (
            <div
              key={subject.id}
              className={`rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                subject.hasNoRequirements
                  ? 'border-dashed border-slate-200 dark:border-slate-800 opacity-70'
                  : meta.cardBorder
              }`}
            >
              {/* Card Header */}
              <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl shrink-0 ${meta.bg}`}>
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-slate-100">
                        {subject.nameAr}
                      </h3>
                      {isSubComplete && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> مكتمل
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-sans block">
                      {subject.nameEn}
                    </span>
                  </div>
                </div>

                {/* Direct Action Button */}
                {!subject.hasNoRequirements && onOpenCaseBuilder && (
                  <button
                    type="button"
                    onClick={() => onOpenCaseBuilder(subject.departmentKey)}
                    className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title="توثيق حالة جديدة بهذا القسم"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">توثيق حالة</span>
                  </button>
                )}
              </div>

              {/* Card Body: Items List */}
              <div className="p-4 md:p-5 flex-1 space-y-3">
                {subject.hasNoRequirements ? (
                  <div className="py-6 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-slate-500 text-xs flex flex-col items-center justify-center gap-1">
                    <Info className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      لا توجد متطلبات سريرية لهذا الترم
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (التركيز الأكاديمي أو السريري مخصص لأقسام أخرى في هذه المرحلة)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subject.items.map((item) => {
                      const isChecked = Boolean(activeChecklist[item.id]);

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {/* Checkbox & Item Info */}
                          <div className="flex items-start gap-2.5 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleCheck(item.id)}
                              className={`p-1 rounded-lg mt-0.5 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-emerald-500 text-white'
                                  : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-transparent'
                              }`}
                              title={isChecked ? 'تم الاستيفاء' : 'تحديد كمكتمل'}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <div className="space-y-1 flex-1">
                              <span
                                className={`text-xs md:text-sm font-bold block leading-tight ${
                                  isChecked
                                    ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-80'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {item.titleAr}
                              </span>

                              {/* Multi Options / Choices rendered cleanly */}
                              {item.options && item.options.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  {item.options.map((opt, i) => (
                                    <span
                                      key={i}
                                      className="inline-block text-[11px] font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 ml-1.5"
                                    >
                                      • {opt}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Specific Item Note */}
                              {item.notes && item.notes.length > 0 && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-300 pt-0.5 font-medium">
                                  ⚠️ {item.notes.join(' ')}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Target Count Pill */}
                          {item.targetCount && (
                            <span className="px-2 py-1 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold shrink-0">
                              {item.targetCount} {item.unitLabel || 'حالة'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card Footer: Collapsible Rules / Notes if present */}
              {hasNotesOrRules && !subject.hasNoRequirements && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20">
                  <button
                    type="button"
                    onClick={() => toggleNotes(subject.id)}
                    className="w-full px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>الشروط والضوابط الأكاديمية ({subject.rulesAndNotes?.length || 0 + (subject.conditions?.length || 0)})</span>
                    </span>
                    {isNotesExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isNotesExpanded && (
                    <div className="px-4 pb-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {subject.rulesAndNotes?.map((rule, idx) => (
                        <p key={`r-${idx}`} className="text-[11px] leading-relaxed">
                          • {rule}
                        </p>
                      ))}
                      {subject.conditions?.map((cond, idx) => (
                        <p key={`c-${idx}`} className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                          📌 {cond}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
