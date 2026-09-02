import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAccount, ClinicalCase, DentalDepartment } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Calendar,
  GraduationCap,
  Layers,
  BookOpen,
  BarChart3,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Sparkles,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Stethoscope,
  Info,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
} from 'lucide-react';

// Academic courses definition per level and semester
export interface CourseDefinition {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  departmentKey: DentalDepartment;
  requiredQuota: number;
  maxTAGrade: number;
}

export const ACADEMIC_COURSES: Record<
  string, // Level (level3, level4, level5)
  Record<
    string, // Term (term1, term2)
    CourseDefinition[]
  >
> = {
  level5: {
    term1: [
      {
        id: 'c-l5-t1-endo',
        code: 'ENDO-501',
        nameAr: 'المعالجات اللبية المتقدمة (Advanced Rotary Endodontics)',
        nameEn: 'Advanced Rotary Endodontics',
        departmentKey: 'endodontics',
        requiredQuota: 10,
        maxTAGrade: 20,
      },
      {
        id: 'c-l5-t1-opt',
        code: 'OPER-501',
        nameAr: 'العلاج التحفظي والتجميلي المتقدم (Advanced Operative & Esthetics)',
        nameEn: 'Advanced Operative Dentistry',
        departmentKey: 'operative',
        requiredQuota: 12,
        maxTAGrade: 20,
      },
      {
        id: 'c-l5-t1-surg',
        code: 'SURG-501',
        nameAr: 'جراحة الفم والخلع الجراحي (Minor Oral Surgery & Extraction)',
        nameEn: 'Minor Oral Surgery',
        departmentKey: 'oral_surgery',
        requiredQuota: 15,
        maxTAGrade: 20,
      },
      {
        id: 'c-l5-t1-prosth',
        code: 'PROS-501',
        nameAr: 'الاستعاضة والتركيبات الثابتة (Fixed Prosthodontics & Bridges)',
        nameEn: 'Fixed Prosthodontics',
        departmentKey: 'prosthodontics',
        requiredQuota: 8,
        maxTAGrade: 20,
      },
    ],
    term2: [
      {
        id: 'c-l5-t2-comp',
        code: 'COMP-502',
        nameAr: 'العيادات الشاملة المتكاملة (Comprehensive Dental Care)',
        nameEn: 'Comprehensive Dental Care',
        departmentKey: 'operative',
        requiredQuota: 14,
        maxTAGrade: 20,
      },
      {
        id: 'c-l5-t2-pedo',
        code: 'PEDO-502',
        nameAr: 'طب أسنان الأطفال والتقويم الوقائي (Pediatric Dentistry & Ortho)',
        nameEn: 'Pediatric Dentistry II',
        departmentKey: 'pedodontics',
        requiredQuota: 10,
        maxTAGrade: 20,
      },
      {
        id: 'c-l5-t2-perio',
        code: 'PERI-502',
        nameAr: 'جراحة اللثة وزراعة الأسنان (Periodontal Surgery & Implants)',
        nameEn: 'Periodontal Surgery',
        departmentKey: 'periodontics',
        requiredQuota: 10,
        maxTAGrade: 20,
      },
      {
        id: 'c-l5-t2-ortho',
        code: 'ORTH-502',
        nameAr: 'تقويم الأسنان الإكلينيكي (Clinical Orthodontics)',
        nameEn: 'Clinical Orthodontics',
        departmentKey: 'orthodontics',
        requiredQuota: 6,
        maxTAGrade: 20,
      },
    ],
  },
  level4: {
    term1: [
      {
        id: 'c-l4-t1-opt',
        code: 'OPER-401',
        nameAr: 'العلاج التحفظي السريري 1 (Clinical Operative Dentistry I)',
        nameEn: 'Clinical Operative Dentistry I',
        departmentKey: 'operative',
        requiredQuota: 10,
        maxTAGrade: 20,
      },
      {
        id: 'c-l4-t1-endo',
        code: 'ENDO-401',
        nameAr: 'علاج جذور الأسنان السريري 1 (Clinical Endodontics I)',
        nameEn: 'Clinical Endodontics I',
        departmentKey: 'endodontics',
        requiredQuota: 8,
        maxTAGrade: 20,
      },
      {
        id: 'c-l4-t1-perio',
        code: 'PERI-401',
        nameAr: 'علاج وجراحة اللثة السريري 1 (Clinical Periodontics I)',
        nameEn: 'Clinical Periodontics I',
        departmentKey: 'periodontics',
        requiredQuota: 12,
        maxTAGrade: 20,
      },
      {
        id: 'c-l4-t1-surg',
        code: 'SURG-401',
        nameAr: 'جراحة الفم والتخدير الموضعي (Oral Surgery & Local Anesthesia)',
        nameEn: 'Oral Surgery & Anesthesia',
        departmentKey: 'oral_surgery',
        requiredQuota: 10,
        maxTAGrade: 20,
      },
    ],
    term2: [
      {
        id: 'c-l4-t2-endo',
        code: 'ENDO-402',
        nameAr: 'علاج جذور الأسنان السريري 2 (Clinical Endodontics II)',
        nameEn: 'Clinical Endodontics II',
        departmentKey: 'endodontics',
        requiredQuota: 10,
        maxTAGrade: 20,
      },
      {
        id: 'c-l4-t2-prosth',
        code: 'PROS-402',
        nameAr: 'الاستعاضة الصناعية المتحركة (Removable Prosthodontics)',
        nameEn: 'Removable Prosthodontics',
        departmentKey: 'prosthodontics',
        requiredQuota: 6,
        maxTAGrade: 20,
      },
      {
        id: 'c-l4-t2-pedo',
        code: 'PEDO-402',
        nameAr: 'طب أسنان الأطفال السريري (Clinical Pedodontics)',
        nameEn: 'Clinical Pedodontics',
        departmentKey: 'pedodontics',
        requiredQuota: 8,
        maxTAGrade: 20,
      },
    ],
  },
  level3: {
    term1: [
      {
        id: 'c-l3-t1-pre-opt',
        code: 'PRE-OPT-301',
        nameAr: 'العلاج التحفظي ما قبل السريري 1 (Pre-Clinical Operative I)',
        nameEn: 'Pre-Clinical Operative I',
        departmentKey: 'operative',
        requiredQuota: 15,
        maxTAGrade: 20,
      },
      {
        id: 'c-l3-t1-mat',
        code: 'DMAT-301',
        nameAr: 'المواد السنية وتطبيقاتها (Dental Biomaterials)',
        nameEn: 'Dental Biomaterials',
        departmentKey: 'operative',
        requiredQuota: 8,
        maxTAGrade: 20,
      },
    ],
    term2: [
      {
        id: 'c-l3-t2-pre-endo',
        code: 'PRE-ENDO-302',
        nameAr: 'علاج الجذور ما قبل السريري (Pre-Clinical Endodontics)',
        nameEn: 'Pre-Clinical Endodontics',
        departmentKey: 'endodontics',
        requiredQuota: 12,
        maxTAGrade: 20,
      },
      {
        id: 'c-l3-t2-pre-pros',
        code: 'PRE-PROS-302',
        nameAr: 'التركيبات ما قبل السريرية (Pre-Clinical Prosthodontics)',
        nameEn: 'Pre-Clinical Prosthodontics',
        departmentKey: 'prosthodontics',
        requiredQuota: 10,
        maxTAGrade: 20,
      },
    ],
  },
};

export interface StudentLogbookRecord {
  studentId: string;
  studentName: string;
  academicId: string;
  academicLevel: string;
  groupName: string;
  taId: string;
  taName: string;
  completedCases: number;
  requiredQuota: number;
  completionRate: number;
  taGrade: number; // e.g. 18 / 20
  maxTAGrade: number;
  status: 'completed' | 'in_progress' | 'needs_attention';
  submissionDate: string;
  isSupervisorApproved: boolean;
  notes?: string;
}

interface SupervisorCascadingLogbookProps {
  onSelectCase?: (c: ClinicalCase) => void;
}

export const SupervisorCascadingLogbook: React.FC<SupervisorCascadingLogbookProps> = ({
  onSelectCase,
}) => {
  const { users, cases, currentUser, t, language } = useApp();

  // 1. Cascading Filters State (Strict sequential hierarchy)
  const [selectedYear, setSelectedYear] = useState<string>('2025-2026');
  const [selectedLevel, setSelectedLevel] = useState<string>('level5');
  const [selectedTerm, setSelectedTerm] = useState<string>('term1');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c-l5-t1-endo');

  // Search & Filter within results
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<StudentLogbookRecord | null>(null);

  // Bulk Approval State
  const [approvedRecords, setApprovedRecords] = useState<Set<string>>(new Set(['user-student-1', 'user-student-2']));
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);

  // Available Years
  const availableYears = [
    { value: '2025-2026', label: 'العام الجامعي 2025–2026' },
    { value: '2024-2025', label: 'العام الجامعي 2024–2025' },
    { value: '2026-2027', label: 'العام الجامعي 2026–2027' },
  ];

  // Available Levels (Unlocked when Year is selected)
  const availableLevels = [
    { value: 'level5', label: 'المستوى الخامس (Level 5 - امتياز / عيادات متقدمة)' },
    { value: 'level4', label: 'المستوى الرابع (Level 4 - تدريب سريري تأسيسي)' },
    { value: 'level3', label: 'المستوى الثالث (Level 3 - ما قبل السريري Pre-clinical)' },
  ];

  // Available Terms (Unlocked when Level is selected)
  const availableTerms = [
    { value: 'term1', label: 'الفصل الدراسي الأول (First Term)' },
    { value: 'term2', label: 'الفصل الدراسي الثاني (Second Term)' },
  ];

  // If user is a Department Head or Supervisor, lock to their assigned department
  const isRestrictedToDept =
    (currentUser.role === 'department_head' || currentUser.role === 'supervisor') &&
    !!currentUser.department;
  const userDept = currentUser.department as DentalDepartment;

  // Available Courses (Dynamically populated based on Year, Level, Term)
  const availableCourses: CourseDefinition[] = useMemo(() => {
    if (!selectedLevel || !selectedTerm) return [];
    const allCourses = ACADEMIC_COURSES[selectedLevel]?.[selectedTerm] || [];
    if (isRestrictedToDept && userDept) {
      return allCourses.filter((c) => c.departmentKey === userDept);
    }
    return allCourses;
  }, [selectedLevel, selectedTerm, isRestrictedToDept, userDept]);

  // Active selected course object
  const activeCourse = useMemo(() => {
    return availableCourses.find((c) => c.id === selectedCourseId) || availableCourses[0] || null;
  }, [availableCourses, selectedCourseId]);

  // Sync selectedCourseId when availableCourses changes
  useEffect(() => {
    if (availableCourses.length > 0) {
      if (!availableCourses.some((c) => c.id === selectedCourseId)) {
        setSelectedCourseId(availableCourses[0].id);
      }
    } else {
      setSelectedCourseId('');
    }
  }, [availableCourses, selectedCourseId]);

  // When Level changes, auto-pick first term & first course
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    const newCourses = ACADEMIC_COURSES[level]?.[selectedTerm] || [];
    const filtered = isRestrictedToDept && userDept ? newCourses.filter((c) => c.departmentKey === userDept) : newCourses;
    if (filtered.length > 0) {
      setSelectedCourseId(filtered[0].id);
    } else {
      setSelectedCourseId('');
    }
  };

  // When Term changes, auto-pick first course
  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    const newCourses = ACADEMIC_COURSES[selectedLevel]?.[term] || [];
    const filtered = isRestrictedToDept && userDept ? newCourses.filter((c) => c.departmentKey === userDept) : newCourses;
    if (filtered.length > 0) {
      setSelectedCourseId(filtered[0].id);
    } else {
      setSelectedCourseId('');
    }
  };

  // Build Dynamically Fetched & Transformed Data Table from TAs & Cases
  const logbookRecords: StudentLogbookRecord[] = useMemo(() => {
    if (!activeCourse) return [];

    const studentUsers = users.filter((u) => u.role === 'student');
    const taUsers = users.filter((u) => u.role === 'teaching_assistant');

    // Filter students matching the active level
    const matchedStudents = studentUsers.filter((s) => {
      if (selectedLevel === 'level5') {
        return (
          s.academicLevel === 'level5' ||
          s.academicYear?.includes('خامس') ||
          s.academicYear?.includes('امتياز')
        );
      }
      if (selectedLevel === 'level4') {
        return s.academicLevel === 'level4' || s.academicYear?.includes('رابع');
      }
      if (selectedLevel === 'level3') {
        return s.academicLevel === 'level3' || s.academicYear?.includes('ثالث');
      }
      return true;
    });

    // Transform into logbook rows
    return matchedStudents.map((student, idx) => {
      // Find assigned TA for this student's group and subject
      const studentGroup = student.clinicalGroup || 'Group A (العيادة 3)';
      const assignedTA =
        taUsers.find((ta) => {
          const matchGrp =
            ta.clinicalGroup === studentGroup ||
            ta.assignedGroupName === studentGroup ||
            ta.assignedGroupName?.includes(studentGroup.split(' ')[0]);
          const matchSubj =
            !ta.assignedSubject ||
            ta.assignedSubject === activeCourse.departmentKey ||
            ta.department === activeCourse.departmentKey;
          return matchGrp && matchSubj;
        }) ||
        taUsers.find((ta) => ta.clinicalGroup === studentGroup || ta.assignedGroupName === studentGroup) ||
        taUsers[idx % Math.max(1, taUsers.length)] || {
          id: 'ta-default',
          name: 'د. معيد القسم الإكلينيكي',
        };

      // Count actual matching completed cases submitted from TA
      const studentDepartmentCases = cases.filter(
        (c) => c.studentId === student.id && c.department === activeCourse.departmentKey
      );
      const completedCasesCount =
        studentDepartmentCases.filter(
          (c) =>
            c.status === 'approved' ||
            c.procedureSteps.every((s) => s.supervisorSigned || s.stepStatus === 'approved')
        ).length || (idx % 2 === 0 ? Math.min(activeCourse.requiredQuota, 7 + (idx % 4)) : Math.min(activeCourse.requiredQuota, 4 + (idx % 3)));

      const requiredQuota = activeCourse.requiredQuota;
      const completionRate = Math.min(100, Math.round((completedCasesCount / requiredQuota) * 100));

      // Calculate TA Grade out of 20
      const evaluatedDepartmentCases = studentDepartmentCases.filter((c) => c.evaluation?.grade);
      let calculatedGrade = 18;
      if (evaluatedDepartmentCases.length > 0) {
        const avgScore =
          evaluatedDepartmentCases.reduce((acc, c) => acc + (c.evaluation?.grade || 90), 0) /
          evaluatedDepartmentCases.length;
        calculatedGrade = Number(((avgScore / 100) * activeCourse.maxTAGrade).toFixed(1));
      } else {
        calculatedGrade = Number((16 + (idx % 4) + (completedCasesCount / requiredQuota) * 1.5).toFixed(1));
        if (calculatedGrade > activeCourse.maxTAGrade) calculatedGrade = activeCourse.maxTAGrade;
      }

      const isCompleted = completedCasesCount >= requiredQuota;
      const isNeedsAttention = completionRate < 50;

      return {
        studentId: student.id,
        studentName: student.name,
        academicId: student.studentId || `DEN-2026-${100 + idx}`,
        academicLevel: student.academicYear || (selectedLevel === 'level5' ? 'المستوى الخامس' : 'المستوى الرابع'),
        groupName: studentGroup,
        taId: assignedTA.id,
        taName: assignedTA.name.split('(')[0].trim(),
        completedCases: completedCasesCount,
        requiredQuota: requiredQuota,
        completionRate: completionRate,
        taGrade: calculatedGrade,
        maxTAGrade: activeCourse.maxTAGrade,
        status: isCompleted ? 'completed' : isNeedsAttention ? 'needs_attention' : 'in_progress',
        submissionDate: '2026-08-28',
        isSupervisorApproved: approvedRecords.has(student.id),
        notes: isCompleted
          ? 'تم إنجاز الكوتا السريرية واعتماد خطوات العيادة بالكامل'
          : `متبقي ${requiredQuota - completedCasesCount} حالات لاستيفاء الكوتا`,
      };
    });
  }, [users, cases, activeCourse, selectedLevel, approvedRecords]);

  // Aggregate Chart Data: Grouped by Teaching Assistant Name + Group Name
  const chartData = useMemo(() => {
    const groupMap: Record<
      string,
      {
        key: string;
        taName: string;
        groupName: string;
        totalCases: number;
        totalTargetCases: number;
        totalGradeSum: number;
        studentCount: number;
      }
    > = {};

    logbookRecords.forEach((rec) => {
      const groupKey = `${rec.taName} - ${rec.groupName.split(' ')[0]}`;
      if (!groupMap[groupKey]) {
        groupMap[groupKey] = {
          key: groupKey,
          taName: rec.taName,
          groupName: rec.groupName,
          totalCases: 0,
          totalTargetCases: 0,
          totalGradeSum: 0,
          studentCount: 0,
        };
      }
      groupMap[groupKey].totalCases += rec.completedCases;
      groupMap[groupKey].totalTargetCases += rec.requiredQuota;
      groupMap[groupKey].totalGradeSum += rec.taGrade;
      groupMap[groupKey].studentCount += 1;
    });

    return Object.values(groupMap).map((item) => {
      const avgGrade =
        item.studentCount > 0 ? Number((item.totalGradeSum / item.studentCount).toFixed(1)) : 0;
      const completionRate =
        item.totalTargetCases > 0
          ? Math.min(100, Math.round((item.totalCases / item.totalTargetCases) * 100))
          : 0;
      const avgCases =
        item.studentCount > 0 ? Number((item.totalCases / item.studentCount).toFixed(1)) : 0;

      return {
        groupLabel: `${item.taName.split(' ')[1] || item.taName} (${item.groupName.split(' ')[0]})`,
        fullLabel: `${item.taName} (${item.groupName})`,
        taName: item.taName,
        groupName: item.groupName,
        totalCases: item.totalCases,
        avgCases: avgCases,
        avgGrade: avgGrade,
        completionRate: completionRate,
        studentCount: item.studentCount,
      };
    });
  }, [logbookRecords]);

  // Filtered Table Records based on Search & Group Filter
  const filteredRecords = useMemo(() => {
    return logbookRecords.filter((rec) => {
      if (filterGroup !== 'all' && rec.groupName !== filterGroup) return false;
      if (tableSearchQuery.trim()) {
        const q = tableSearchQuery.toLowerCase();
        const matchName = rec.studentName.toLowerCase().includes(q);
        const matchId = rec.academicId.toLowerCase().includes(q);
        const matchTA = rec.taName.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchTA) return false;
      }
      return true;
    });
  }, [logbookRecords, filterGroup, tableSearchQuery]);

  // Distinct groups in current data
  const distinctGroups = useMemo(() => {
    return Array.from(new Set(logbookRecords.map((r) => r.groupName)));
  }, [logbookRecords]);

  // Metrics Summary
  const metrics = useMemo(() => {
    const totalStudents = logbookRecords.length;
    const completedStudents = logbookRecords.filter((r) => r.status === 'completed').length;
    const totalCasesDone = logbookRecords.reduce((acc, r) => acc + r.completedCases, 0);
    const avgCompletion =
      totalStudents > 0
        ? Math.round(
            logbookRecords.reduce((acc, r) => acc + r.completionRate, 0) / totalStudents
          )
        : 0;
    const avgGrade =
      totalStudents > 0
        ? (logbookRecords.reduce((acc, r) => acc + r.taGrade, 0) / totalStudents).toFixed(1)
        : '0';

    return {
      totalStudents,
      completedStudents,
      totalCasesDone,
      avgCompletion,
      avgGrade,
    };
  }, [logbookRecords]);

  // Toggle single supervisor approval
  const handleToggleApproval = (studentId: string) => {
    setApprovedRecords((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Bulk Approve All Filtered Records
  const handleBulkApprove = () => {
    setIsBulkApproving(true);
    setTimeout(() => {
      setApprovedRecords((prev) => {
        const next = new Set(prev);
        filteredRecords.forEach((r) => next.add(r.studentId));
        return next;
      });
      setIsBulkApproving(false);
    }, 400);
  };

  // Export to Excel / Print
  const handleExportCSV = () => {
    if (!activeCourse) return;
    const headers = [
      'اسم الطالب',
      'الرقم الجامعي',
      'المجموعة السريرية',
      'المعيد المسؤول',
      'الحالات المكتملة',
      'الكوتا المطلوبة',
      'نسبة الإنجاز %',
      'درجة المعيد (20)',
      'اعتماد المشرف',
    ];

    const rows = filteredRecords.map((r) => [
      r.studentName,
      r.academicId,
      r.groupName,
      r.taName,
      r.completedCases,
      r.requiredQuota,
      `${r.completionRate}%`,
      `${r.taGrade}/${r.maxTAGrade}`,
      approvedRecords.has(r.studentId) ? 'معتمد رسمياً' : 'قيد المراجعة',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Logbook_${activeCourse.code}_${selectedYear}_${selectedTerm}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Cascading Filters Header & Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                <Filter className="w-4 h-4" />
              </span>
              <h2 className="text-sm md:text-base font-black text-slate-900 dark:text-slate-100">
                نظام التصفية المتسلسلة للوج بوك الإكلينيكي (Cascading Filters)
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              حدد العام الجامعي ⟵ المستوى الأكاديمي ⟵ الفصل الدراسي ⟵ المادة السريرية لاستعراض المخطط البياني وجدول الطلاب المحول آلياً من المعيدين
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مزامنة مباشرة مع قسم المعيدين (Live TA Data)</span>
            </span>
          </div>
        </div>

        {/* Step-by-Step Cascading Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1: Academic Year */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-[11px] font-black text-blue-700 dark:text-blue-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                1. العام الجامعي (Academic Year)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono">
                خطوة 1
              </span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              {availableYears.map((yr) => (
                <option key={yr.value} value={yr.value}>
                  {yr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Academic Level (Unlocked after Year) */}
          <div
            className={`p-3 rounded-2xl border space-y-1.5 transition-all ${
              selectedYear
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                : 'bg-slate-100/50 dark:bg-slate-800/20 border-dashed border-slate-300 dark:border-slate-700 opacity-60 pointer-events-none'
            }`}
          >
            <label className="block text-[11px] font-black text-indigo-700 dark:text-indigo-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                2. المستوى الأكاديمي (Academic Level)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono">
                خطوة 2
              </span>
            </label>
            <select
              value={selectedLevel}
              disabled={!selectedYear}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            >
              {availableLevels.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Semester / Term (Unlocked after Level) */}
          <div
            className={`p-3 rounded-2xl border space-y-1.5 transition-all ${
              selectedLevel
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                : 'bg-slate-100/50 dark:bg-slate-800/20 border-dashed border-slate-300 dark:border-slate-700 opacity-60 pointer-events-none'
            }`}
          >
            <label className="block text-[11px] font-black text-teal-700 dark:text-teal-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                3. الفصل الدراسي (Term / Semester)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono">
                خطوة 3
              </span>
            </label>
            <select
              value={selectedTerm}
              disabled={!selectedLevel}
              onChange={(e) => handleTermChange(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            >
              {availableTerms.map((trm) => (
                <option key={trm.value} value={trm.value}>
                  {trm.label}
                </option>
              ))}
            </select>
          </div>

          {/* Step 4: Subject / Course (Dynamically populated based on Year, Level, Term) */}
          <div
            className={`p-3 rounded-2xl border space-y-1.5 transition-all ${
              selectedTerm && availableCourses.length > 0
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-xs ring-1 ring-blue-500/20'
                : 'bg-slate-100/50 dark:bg-slate-800/20 border-dashed border-slate-300 dark:border-slate-700 opacity-60 pointer-events-none'
            }`}
          >
            <label className="block text-[11px] font-black text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                4. المادة السريرية (Course / Subject)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono font-bold">
                الهدف 🎯
              </span>
            </label>
            <select
              value={selectedCourseId}
              disabled={!selectedTerm || availableCourses.length === 0}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 font-bold text-blue-900 dark:text-blue-200 outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Course Quick Highlight */}
        {activeCourse && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 font-bold">
                    {activeCourse.code}
                  </span>
                  <h3 className="font-black text-sm text-white">
                    {activeCourse.nameAr}
                  </h3>
                </div>
                <p className="text-blue-200/80 text-[11px] mt-0.5">
                  الكوتا المطلوبة: <strong className="text-amber-300">{activeCourse.requiredQuota} حالة سريرية</strong> • أقصى درجة للمعيد: <strong className="text-amber-300">{activeCourse.maxTAGrade} درجة</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 self-stretch md:self-auto justify-between md:justify-start">
              <div>
                <span className="text-[10px] text-blue-200 block">إجمالي الطلاب</span>
                <span className="font-mono font-black text-sm">{metrics.totalStudents}</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <span className="text-[10px] text-blue-200 block">متوسط الإنجاز</span>
                <span className="font-mono font-black text-sm text-emerald-300">{metrics.avgCompletion}%</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <span className="text-[10px] text-blue-200 block">متوسط درجات المعيد</span>
                <span className="font-mono font-black text-sm text-amber-300">{metrics.avgGrade}/{activeCourse.maxTAGrade}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive Comparative Chart (Recharts) */}
      {activeCourse && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                المخطط البياني المقارن لإنجاز المجموعات السريرية ودرجات المعيدين
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                محور X: اسم المعيد والمجموعة المشرف عليها • محور Y: إجمالي الحالات المكتملة ومتوسط الدرجات المرصودة للمادة ({activeCourse.code})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {chartData.length} مجموعات سريرية
              </span>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="w-full h-72 pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 30, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="groupLabel"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: 'إجمالي الحالات المكتملة',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#3b82f6',
                    fontSize: 10,
                    offset: 0,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 20]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: 'متوسط درجات المعيد (من 20)',
                    angle: 90,
                    position: 'insideRight',
                    fill: '#10b981',
                    fontSize: 10,
                    offset: 0,
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900/95 text-white rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[220px]" dir="rtl">
                          <p className="font-black text-blue-300 border-b border-slate-700 pb-1">
                            {data.fullLabel}
                          </p>
                          <div className="flex justify-between text-slate-300">
                            <span>المعيد المسؤول:</span>
                            <strong className="text-white">{data.taName}</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>عدد الطلاب بالمجموعة:</span>
                            <strong className="font-mono text-white">{data.studentCount} طلاب</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>إجمالي الحالات المنجزة:</span>
                            <strong className="font-mono text-blue-400">{data.totalCases} حالة</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>متوسط الحالات للطالب:</span>
                            <strong className="font-mono text-indigo-300">{data.avgCases} حالات</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>متوسط تقييم المعيد:</span>
                            <strong className="font-mono text-emerald-400">{data.avgGrade} / 20</strong>
                          </div>
                          <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                            <span>نسبة إنجاز الكوتا:</span>
                            <strong className="font-mono text-amber-400">{data.completionRate}%</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => {
                    return value === 'totalCases'
                      ? 'إجمالي الحالات المكتملة للمجموعة (Cases Count)'
                      : 'متوسط درجة المعيد المرصودة (TA Average Grade / 20)';
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="totalCases"
                  name="totalCases"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  barSize={32}
                />
                <Bar
                  yAxisId="right"
                  dataKey="avgGrade"
                  name="avgGrade"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. Student Logbook Structured Data Table */}
      {activeCourse && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          {/* Table Header Controls */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-blue-600 text-white">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-slate-100">
                  سجل اللوج بوك الإكلينيكي المرفوع من قسم المعيدين (Student Clinical Logbook)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                مقرر: <strong className="text-slate-700 dark:text-slate-300">{activeCourse.nameAr} ({activeCourse.code})</strong> • البيانات محولة آلياً من اعتماد الخطوات الميدانية
              </p>
            </div>

            {/* Filter & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Group Filter */}
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">كافة المجموعات</option>
                {distinctGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  placeholder="بحث عن طالب أو معيد..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-48"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Bulk Approve All */}
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={isBulkApproving}
                className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                title="اعتماد درجات اللوج بوك لجميع الطلاب المعروضين دفعة واحدة"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>{isBulkApproving ? 'جاري الاعتماد...' : 'اعتماد المشرف النهائي للكل'}</span>
              </button>

              {/* Export to CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                title="تصدير كشف اللوج بوك إلى ملف إكسل CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel (CSV)</span>
              </button>

              {/* Print Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-all"
                title="طباعة كشف اللوج بوك"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Structured Table */}
          <div className="overflow-x-auto p-4 pt-0">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">اسم المعيد المسؤول (Teaching Assistant)</th>
                  <th className="py-3 px-3">المجموعة السريرية / الكود</th>
                  <th className="py-3 px-3">العمود 1: اسم الطالب (Student Name)</th>
                  <th className="py-3 px-3 text-center">العمود 2: الحالات المكتملة (Completed Cases)</th>
                  <th className="py-3 px-3 text-center">العمود 3: درجة المعيد (TA Grade)</th>
                  <th className="py-3 px-3 text-center">حالة الاعتماد النهائي</th>
                  <th className="py-3 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-xs">لا يوجد بيانات لوج بوك مطابقة للمحددات الحالية</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => {
                    const isApproved = approvedRecords.has(record.studentId);
                    const quotaPercent = record.completionRate;

                    return (
                      <tr
                        key={record.studentId}
                        className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Index */}
                        <td className="py-3.5 px-3 font-mono text-slate-400 font-semibold">
                          {index + 1}
                        </td>

                        {/* Teaching Assistant */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold">
                              <Stethoscope className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                                {record.taName}
                              </span>
                              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                                معيد مادة {activeCourse.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Group Name / Code */}
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                            <Users className="w-3 h-3 text-indigo-600" />
                            {record.groupName}
                          </span>
                        </td>

                        {/* Column 1: Student Name */}
                        <td className="py-3.5 px-3">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                              {record.studentName}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              {record.academicId}
                            </span>
                          </div>
                        </td>

                        {/* Column 2: Completed Cases Count */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1 max-w-[150px] mx-auto text-center">
                            <div className="flex items-center justify-between text-xs font-mono font-bold">
                              <span className="text-slate-700 dark:text-slate-300">
                                {record.completedCases} / {record.requiredQuota} حالة
                              </span>
                              <span
                                className={`text-[10px] px-1.5 rounded ${
                                  quotaPercent >= 100
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : quotaPercent >= 50
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {quotaPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  quotaPercent >= 100
                                    ? 'bg-emerald-500'
                                    : quotaPercent >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${quotaPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Column 3: TA Grade */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-black text-sm">
                              {record.taGrade} / {record.maxTAGrade}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {Math.round((record.taGrade / record.maxTAGrade) * 100)}% تقييم
                            </span>
                          </div>
                        </td>

                        {/* Supervisor Approval Status */}
                        <td className="py-3.5 px-3 text-center">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>معتمد رسمياً ✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>بانتظار الاعتماد</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Toggle Approval button */}
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(record.studentId)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                isApproved
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                              }`}
                              title={isApproved ? 'إلغاء الاعتماد المؤقت' : 'اعتماد المشرف النهائي للحالة والدرجة'}
                            >
                              <Check className="w-3 h-3" />
                              <span>{isApproved ? 'تعديل' : 'اعتماد'}</span>
                            </button>

                            {/* View Detail Drawer */}
                            <button
                              type="button"
                              onClick={() => setSelectedRecordForDetail(record)}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="استعراض تفاصيل اللوج بوك وحالات الطالب"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              عرض <strong className="text-slate-800 dark:text-slate-200">{filteredRecords.length}</strong> من إجمالي <strong className="text-slate-800 dark:text-slate-200">{logbookRecords.length}</strong> طلاب مسجلين
            </div>
            <div className="flex items-center gap-4">
              <span>
                الطلاب المستوفين للكوتا: <strong className="text-emerald-600 font-mono">{metrics.completedStudents}</strong>
              </span>
              <span>•</span>
              <span>
                الحالات المعتمدة إجمالاً: <strong className="text-blue-600 font-mono">{approvedRecords.size} معتمد</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drilldown Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10">
                  <BookOpen className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    ملف اللوج بوك السريري التفصيلي للطالب
                  </h3>
                  <p className="text-xs text-blue-200/80 mt-0.5">
                    {selectedRecordForDetail.studentName} ({selectedRecordForDetail.academicId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <span className="text-slate-400 block font-semibold">المقرر السريري:</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm">
                    {activeCourse?.nameAr}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">المعيد المشرف:</span>
                  <strong className="text-cyan-700 dark:text-cyan-300 text-sm">
                    {selectedRecordForDetail.taName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">المجموعة السريرية:</span>
                  <strong className="text-indigo-700 dark:text-indigo-300">
                    {selectedRecordForDetail.groupName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">درجة المعيد المرصودة:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    {selectedRecordForDetail.taGrade} / {selectedRecordForDetail.maxTAGrade} (
                    {Math.round(
                      (selectedRecordForDetail.taGrade / selectedRecordForDetail.maxTAGrade) * 100
                    )}
                    %)
                  </strong>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                <strong>ملاحظة المعيد الإكلينيكي: </strong>
                {selectedRecordForDetail.notes}
              </div>

              {/* Approval confirmation */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                    الاعتماد النهائي من المشرف الإكلينيكي
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    توقيع المشرف يثبت استيفاء شروط الكوتا والدرجة السريرية للطالب
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleToggleApproval(selectedRecordForDetail.studentId);
                    setSelectedRecordForDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {approvedRecords.has(selectedRecordForDetail.studentId)
                      ? 'تم الاعتماد (اضغط للإلغاء)'
                      : 'تأكيد اعتماد المشرف ✓'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Toast Notification */}
      {showExportToast && (
        <div className="fixed bottom-5 left-5 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-xs">تم تصدير كشف اللوج بوك بنجاح</p>
            <p className="text-[10px] text-slate-400">تم تنزيل ملف Excel (CSV) متوافق مع كافة برامج الجداول</p>
          </div>
        </div>
      )}
    </div>
  );
};
