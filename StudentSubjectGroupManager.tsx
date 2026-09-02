import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  Layers,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Edit3,
  Trash2,
  ArrowRightLeft,
  Sparkles,
  Copy,
  Printer,
  Calendar,
  Clock,
  DoorClosed,
  Stethoscope,
  ChevronDown,
  Check,
  UserCheck,
  X,
  FileText,
  UserMinus,
  Building2,
  Settings2,
  Filter,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubjectGroupConfig, DentalDepartment, UserAccount } from '../../types';
import { STUDENT_CLINICAL_CURRICULUM } from '../../utils/studentCurriculumData';

interface SubjectInfo {
  id: string;
  departmentKey: DentalDepartment | string;
  nameAr: string;
  nameEn: string;
}

export const StudentSubjectGroupManager: React.FC<{
  initialLevel?: 'level4' | 'level5';
  initialSemester?: 'first' | 'second';
  initialSubjectId?: string;
  lockedDepartment?: DentalDepartment;
}> = ({ initialLevel, initialSemester, initialSubjectId, lockedDepartment }) => {
  const {
    currentUser,
    users,
    subjectGroups,
    createSubjectGroup,
    updateSubjectGroup,
    deleteSubjectGroup,
    addStudentToSubjectGroup,
    removeStudentFromSubjectGroup,
    autoDistributeStudentsToSubjectGroups,
    duplicateSubjectGroupsToAnotherSubject,
    language,
  } = useApp();

  // Filters & State
  const [selectedLevel, setSelectedLevel] = useState<'level4' | 'level5'>(initialLevel || 'level4');
  const [selectedSemester, setSelectedSemester] = useState<'first' | 'second'>(initialSemester || 'first');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'matrix'>('board');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SubjectGroupConfig | null>(null);
  const [isAutoDistributeModalOpen, setIsAutoDistributeModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [batchAssignGroupId, setBatchAssignGroupId] = useState<string | null>(null);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<string | null>(null);

  // Available subjects for the active Level & Semester from curriculum
  const availableSubjects = useMemo(() => {
    const levelData = STUDENT_CLINICAL_CURRICULUM.find((l) => l.id === selectedLevel);
    const semesterData = levelData?.semesters.find((s) => s.id === selectedSemester);
    const curriculumSubjects = semesterData?.subjects || [];

    const mapped: SubjectInfo[] = curriculumSubjects.map((s) => ({
      id: s.departmentKey,
      departmentKey: s.departmentKey,
      nameAr: s.nameAr,
      nameEn: s.nameEn,
    }));

    // If there's a locked department (e.g. for a Department Head), prioritize it
    if (lockedDepartment) {
      const found = mapped.find((m) => m.departmentKey === lockedDepartment);
      if (found) return [found];
    }

    return mapped.length > 0
      ? mapped
      : [
          { id: 'operative', departmentKey: 'operative', nameAr: 'العلاج التحفظي (Operative)', nameEn: 'Operative Dentistry' },
          { id: 'endodontics', departmentKey: 'endodontics', nameAr: 'علاج الجذور (Endodontics)', nameEn: 'Endodontics' },
          { id: 'prosthodontics', departmentKey: 'prosthodontics', nameAr: 'الاستعاضة السنية (Prosthodontics)', nameEn: 'Prosthodontics' },
        ];
  }, [selectedLevel, selectedSemester, lockedDepartment]);

  // Active selected subject
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (lockedDepartment) return lockedDepartment;
    if (initialSubjectId) return initialSubjectId;
    return availableSubjects[0]?.id || 'operative';
  });

  // Make sure active subject is valid when level/semester changes
  const activeSubject = useMemo(() => {
    const found = availableSubjects.find((s) => s.id === selectedSubjectId || s.departmentKey === selectedSubjectId);
    if (found) return found;
    return availableSubjects[0] || { id: 'operative', departmentKey: 'operative', nameAr: 'العلاج التحفظي', nameEn: 'Operative' };
  }, [availableSubjects, selectedSubjectId]);

  // Students belonging to the active level
  const levelStudents = useMemo(() => {
    return users.filter((u) => {
      if (u.role !== 'student') return false;
      if (selectedLevel === 'level4') {
        return u.academicLevel === 'level4' || u.academicYear?.includes('الرابعة') || u.academicYear?.includes('4');
      }
      return u.academicLevel === 'level5' || u.academicYear?.includes('الخامسة') || u.academicYear?.includes('5');
    });
  }, [users, selectedLevel]);

  // Subject groups for current selection
  const currentSubjectGroups = useMemo(() => {
    return subjectGroups.filter(
      (g) =>
        (g.subjectId === activeSubject.id || g.subjectId === activeSubject.departmentKey) &&
        g.academicLevel === selectedLevel &&
        g.semester === selectedSemester
    );
  }, [subjectGroups, activeSubject, selectedLevel, selectedSemester]);

  // Teaching Assistants and Supervisors list for dropdowns
  const teachingAssistants = useMemo(() => {
    return users.filter((u) => u.role === 'teaching_assistant');
  }, [users]);

  const supervisors = useMemo(() => {
    return users.filter((u) => u.role === 'supervisor' || u.role === 'department_head');
  }, [users]);

  // Unassigned students in this subject
  const assignedStudentIdsInSubject = useMemo(() => {
    const ids = new Set<string>();
    currentSubjectGroups.forEach((g) => {
      (g.studentIds || []).forEach((sid) => ids.add(sid));
    });
    return ids;
  }, [currentSubjectGroups]);

  const unassignedStudents = useMemo(() => {
    return levelStudents.filter((s) => !assignedStudentIdsInSubject.has(s.id));
  }, [levelStudents, assignedStudentIdsInSubject]);

  // Search filtered students for groups
  const filteredUnassignedStudents = useMemo(() => {
    if (!searchQuery.trim()) return unassignedStudents;
    const q = searchQuery.toLowerCase().trim();
    return unassignedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.studentId && s.studentId.toLowerCase().includes(q)) ||
        (s.clinicalGroup && s.clinicalGroup.toLowerCase().includes(q))
    );
  }, [unassignedStudents, searchQuery]);

  // Form State for Create/Edit Group
  const [groupFormData, setGroupFormData] = useState<{
    academicLevel: 'level4' | 'level5';
    semester: 'first' | 'second';
    code: string;
    nameAr: string;
    clinicRoom: string;
    scheduleDayTime: string;
    assignedTaId: string;
    assignedSupervisorId: string;
    maxCapacity: number;
    notes: string;
    selectedStudentIds: string[];
  }>({
    academicLevel: selectedLevel,
    semester: selectedSemester,
    code: 'Group A1',
    nameAr: '',
    clinicRoom: 'عيادة 1',
    scheduleDayTime: 'الأحد: 08:30 ص - 11:30 ص',
    assignedTaId: '',
    assignedSupervisorId: '',
    maxCapacity: 10,
    notes: '',
    selectedStudentIds: [],
  });

  const [modalStudentSearch, setModalStudentSearch] = useState('');
  const [modalFilterUnassignedOnly, setModalFilterUnassignedOnly] = useState(false);

  const modalLevelStudents = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === 'student' &&
        (u.academicLevel === groupFormData.academicLevel ||
          (!u.academicLevel && groupFormData.academicLevel === 'level4'))
    );
  }, [users, groupFormData.academicLevel]);

  const filteredModalStudents = useMemo(() => {
    const q = modalStudentSearch.toLowerCase().trim();
    return modalLevelStudents.filter((s) => {
      if (modalFilterUnassignedOnly) {
        const isAssignedElsewhere = subjectGroups.some(
          (g) =>
            g.subjectId === activeSubject.departmentKey &&
            g.academicLevel === groupFormData.academicLevel &&
            g.semester === groupFormData.semester &&
            (g.studentIds || []).includes(s.id) &&
            (!editingGroup || g.id !== editingGroup.id)
        );
        if (isAssignedElsewhere) return false;
      }
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.studentId && s.studentId.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.clinicalGroup && s.clinicalGroup.toLowerCase().includes(q))
      );
    });
  }, [
    modalLevelStudents,
    modalStudentSearch,
    modalFilterUnassignedOnly,
    subjectGroups,
    activeSubject.departmentKey,
    groupFormData.academicLevel,
    groupFormData.semester,
    editingGroup,
  ]);

  const openCreateModal = () => {
    const nextGroupIndex = currentSubjectGroups.length + 1;
    const defaultCode = nextGroupIndex <= 2 ? `Group A${nextGroupIndex}` : `Group B${nextGroupIndex - 2}`;
    setGroupFormData({
      academicLevel: selectedLevel,
      semester: selectedSemester,
      code: defaultCode,
      nameAr: `مجموعة ${defaultCode} (${activeSubject.nameAr})`,
      clinicRoom: `عيادة ${nextGroupIndex}`,
      scheduleDayTime: 'الأحد: 08:30 ص - 11:30 ص',
      assignedTaId: teachingAssistants[0]?.id || '',
      assignedSupervisorId: supervisors[0]?.id || '',
      maxCapacity: 10,
      notes: '',
      selectedStudentIds: [],
    });
    setModalStudentSearch('');
    setModalFilterUnassignedOnly(false);
    setEditingGroup(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (group: SubjectGroupConfig) => {
    setEditingGroup(group);
    setGroupFormData({
      academicLevel: group.academicLevel || selectedLevel,
      semester: group.semester || selectedSemester,
      code: group.code,
      nameAr: group.nameAr,
      clinicRoom: group.clinicRoom || '',
      scheduleDayTime: group.scheduleDayTime || '',
      assignedTaId: group.assignedTaId || '',
      assignedSupervisorId: group.assignedSupervisorId || '',
      maxCapacity: group.maxCapacity || 10,
      notes: group.notes || '',
      selectedStudentIds: group.studentIds || [],
    });
    setModalStudentSearch('');
    setModalFilterUnassignedOnly(false);
    setIsCreateModalOpen(true);
  };

  const toggleStudentInModal = (studentId: string) => {
    setGroupFormData((prev) => {
      const exists = prev.selectedStudentIds.includes(studentId);
      return {
        ...prev,
        selectedStudentIds: exists
          ? prev.selectedStudentIds.filter((id) => id !== studentId)
          : [...prev.selectedStudentIds, studentId],
      };
    });
  };

  const handleSelectAllFilteredStudents = () => {
    const allFilteredIds = filteredModalStudents.map((s) => s.id);
    setGroupFormData((prev) => ({
      ...prev,
      selectedStudentIds: Array.from(new Set([...prev.selectedStudentIds, ...allFilteredIds])),
    }));
  };

  const handleDeselectAllStudents = () => {
    setGroupFormData((prev) => ({
      ...prev,
      selectedStudentIds: [],
    }));
  };

  const handleSelectOnlyUnassignedStudents = () => {
    const unassignedIds = modalLevelStudents
      .filter((s) => {
        const isAssigned = subjectGroups.some(
          (g) =>
            g.subjectId === activeSubject.departmentKey &&
            g.academicLevel === groupFormData.academicLevel &&
            g.semester === groupFormData.semester &&
            (g.studentIds || []).includes(s.id) &&
            (!editingGroup || g.id !== editingGroup.id)
        );
        return !isAssigned;
      })
      .map((s) => s.id);

    setGroupFormData((prev) => ({
      ...prev,
      selectedStudentIds: unassignedIds,
    }));
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const ta = teachingAssistants.find((t) => t.id === groupFormData.assignedTaId);
    const sup = supervisors.find((s) => s.id === groupFormData.assignedSupervisorId);

    if (editingGroup) {
      updateSubjectGroup(editingGroup.id, {
        academicLevel: groupFormData.academicLevel,
        semester: groupFormData.semester,
        code: groupFormData.code,
        nameAr: groupFormData.nameAr,
        clinicRoom: groupFormData.clinicRoom,
        scheduleDayTime: groupFormData.scheduleDayTime,
        assignedTaId: groupFormData.assignedTaId || undefined,
        assignedTaName: ta ? ta.name : undefined,
        assignedSupervisorId: groupFormData.assignedSupervisorId || undefined,
        assignedSupervisorName: sup ? sup.name : undefined,
        maxCapacity: Number(groupFormData.maxCapacity) || 10,
        studentIds: groupFormData.selectedStudentIds,
        notes: groupFormData.notes,
      });
    } else {
      createSubjectGroup({
        academicLevel: groupFormData.academicLevel,
        semester: groupFormData.semester,
        academicYear: '2025-2026',
        subjectId: activeSubject.departmentKey,
        subjectNameAr: activeSubject.nameAr,
        subjectNameEn: activeSubject.nameEn,
        code: groupFormData.code,
        nameAr: groupFormData.nameAr || `مجموعة ${groupFormData.code} (${activeSubject.nameAr})`,
        clinicRoom: groupFormData.clinicRoom,
        scheduleDayTime: groupFormData.scheduleDayTime,
        assignedTaId: groupFormData.assignedTaId || undefined,
        assignedTaName: ta ? ta.name : undefined,
        assignedSupervisorId: groupFormData.assignedSupervisorId || undefined,
        assignedSupervisorName: sup ? sup.name : undefined,
        maxCapacity: Number(groupFormData.maxCapacity) || 10,
        studentIds: groupFormData.selectedStudentIds,
        notes: groupFormData.notes,
      });
    }
    setIsCreateModalOpen(false);
    setEditingGroup(null);
  };

  // Auto-distribute Modal state
  const [autoDistributeMethod, setAutoDistributeMethod] = useState<'balanced' | 'alphabetical' | 'random'>('balanced');
  const [autoDistributeResult, setAutoDistributeResult] = useState<string | null>(null);

  const handleExecuteAutoDistribute = () => {
    if (currentSubjectGroups.length === 0) {
      alert('يجب إنشاء مجموعة واحدة على الأقل قبل إجراء التوزيع التلقائي.');
      return;
    }

    const res = autoDistributeStudentsToSubjectGroups({
      academicLevel: selectedLevel,
      semester: selectedSemester,
      subjectId: activeSubject.departmentKey,
      method: autoDistributeMethod,
    });

    setAutoDistributeResult(`تم توزيع ${res.distributedCount} طالباً بنجاح وبشكل متوازن عبر المجموعات.`);
    setTimeout(() => {
      setIsAutoDistributeModalOpen(false);
      setAutoDistributeResult(null);
    }, 1500);
  };

  // Duplicate to another subject modal state
  const [targetDuplicateSubjectId, setTargetDuplicateSubjectId] = useState<string>('');
  const handleExecuteDuplicate = () => {
    if (!targetDuplicateSubjectId) return;
    const targetSub = availableSubjects.find((s) => s.id === targetDuplicateSubjectId || s.departmentKey === targetDuplicateSubjectId);
    if (!targetSub) return;

    duplicateSubjectGroupsToAnotherSubject(
      activeSubject.departmentKey,
      targetSub.departmentKey,
      targetSub.nameAr,
      selectedLevel,
      selectedSemester
    );
    setIsDuplicateModalOpen(false);
    setSelectedSubjectId(targetSub.departmentKey);
  };

  return (
    <div className="space-y-6 pb-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>إدارة وتوزيع المجموعات السريرية التخصصية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>تقسيم الطلاب حسب المستويات إلى مجموعات المواد</span>
            </h1>
            <p className="text-emerald-100/80 text-sm max-w-2xl leading-relaxed">
              توزيع الطلاب في المستوى الأكاديمي على مجموعات وتوزيع المعيدين والمشرفين لكل مادة إكلينيكية، مع التوزيع الذكي المتوازن وطباعة الكشوفات.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAutoDistributeModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>توزيع ذكي تلقائي</span>
            </button>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مجموعة للمادة</span>
            </button>

            <button
              onClick={() => setIsDuplicateModalOpen(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/10 transition-all flex items-center gap-2"
              title="نسخ توزيع المجموعات إلى مادة أخرى"
            >
              <Copy className="w-4 h-4" />
              <span>نسخ لمادة أخرى</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/10 transition-all flex items-center gap-2"
              title="طباعة وتصدير كشف المجموعات"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكشوف</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Filter & Level/Semester Controller Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          {/* Level Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">المستوى السريري:</span>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedLevel('level4')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  selectedLevel === 'level4'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200 dark:border-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>المستوى الرابع (السنة 4)</span>
              </button>
              <button
                onClick={() => setSelectedLevel('level5')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  selectedLevel === 'level5'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200 dark:border-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>المستوى الخامس (السنة 5)</span>
              </button>
            </div>
          </div>

          {/* Semester Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الفصل الدراسي:</span>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedSemester('first')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedSemester === 'first'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                الفصل الدراسي الأول
              </button>
              <button
                onClick={() => setSelectedSemester('second')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedSemester === 'second'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                الفصل الدراسي الثاني
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">طريقة العرض:</span>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>لوحة المجموعات</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'matrix'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>مصفوفة جميع المواد</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Subject Selector Carousel / Badges */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>المواد السريرية للمستوى {selectedLevel === 'level4' ? 'الرابع' : 'الخامس'} ({selectedSemester === 'first' ? 'الفصل الأول' : 'الفصل الثاني'}):</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {availableSubjects.length} مواد مسجلة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {availableSubjects.map((sub) => {
              const isSelected = activeSubject.id === sub.id || activeSubject.departmentKey === sub.departmentKey;
              const subGroups = subjectGroups.filter(
                (g) =>
                  (g.subjectId === sub.id || g.subjectId === sub.departmentKey) &&
                  g.academicLevel === selectedLevel &&
                  g.semester === selectedSemester
              );
              const enrolledCount = subGroups.reduce((acc, g) => acc + (g.studentIds?.length || 0), 0);

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.departmentKey)}
                  className={`p-3 rounded-xl text-right transition-all border flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block text-slate-900 dark:text-white line-clamp-1">
                      {sub.nameAr}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                      {sub.nameEn}
                    </span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {subGroups.length} مجموعات
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        enrolledCount >= levelStudents.length && levelStudents.length > 0
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {enrolledCount}/{levelStudents.length} طلاب
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Subject Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">إجمالي طلاب المستوى</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{levelStudents.length} طالب</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">المسكنين في {activeSubject.nameAr}</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{assignedStudentIdsInSubject.size} طالب</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">بانتظار التسكين للمادة</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{unassignedStudents.length} طالب</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">المجموعات الإكلينيكية</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{currentSubjectGroups.length} مجموعات</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: Groups Board View */}
      {viewMode === 'board' && (
        <div className="space-y-6">
          {/* Unassigned Students Tray (if any) */}
          {unassignedStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                    {unassignedStudents.length}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <span>طلاب المستوى غير المسكنين في مادة ({activeSubject.nameAr})</span>
                    </h3>
                    <p className="text-xs text-amber-700/90 dark:text-amber-300/80">
                      يمكنك تسكين كل طالب في مجموعته بنقرة واحدة أو استخدام التوزيع الذكي المتوازن.
                    </p>
                  </div>
                </div>

                {/* Search bar inside unassigned */}
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="بحث باسم الطالب أو رقمه..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Unassigned Students Pills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {filteredUnassignedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200/80 dark:border-amber-800/40 shadow-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                          {student.studentId || student.email}
                        </span>
                      </div>
                    </div>

                    {/* Quick Assign Dropdown */}
                    <div className="shrink-0">
                      {currentSubjectGroups.length > 0 ? (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addStudentToSubjectGroup(e.target.value, student.id);
                            }
                          }}
                          className="text-xs bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg px-2 py-1 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">+ تسكين</option>
                          {currentSubjectGroups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.code} - {g.nameAr}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={openCreateModal}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold underline"
                        >
                          + أنشئ مجموعة
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Groups Columns Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  مجموعات مادة {activeSubject.nameAr} ({currentSubjectGroups.length} مجموعات)
                </h3>
              </div>
              <button
                onClick={openCreateModal}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مجموعة إكلينيكية جديدة</span>
              </button>
            </div>

            {currentSubjectGroups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    لا توجد مجموعات منشأة لمادة {activeSubject.nameAr} بعد
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    قم بإنشاء المجموعة الأولى (مثل Group A1 و Group A2) أو استخدم ميزة التوزيع التلقائي الذكي أو نسخ المجموعات من مادة أخرى.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء المجموعة الأولى الآن</span>
                  </button>
                  <button
                    onClick={() => setIsDuplicateModalOpen(true)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>نسخ من مادة أخرى</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentSubjectGroups.map((group) => {
                  const assignedStudents = levelStudents.filter((s) => (group.studentIds || []).includes(s.id));
                  const capacity = group.maxCapacity || 10;
                  const percent = Math.min(100, Math.round((assignedStudents.length / capacity) * 100));

                  return (
                    <motion.div
                      key={group.id}
                      layout
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
                    >
                      {/* Group Header */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-xs tracking-wider">
                                {group.code}
                              </span>
                              {group.clinicRoom && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                                  <DoorClosed className="w-3 h-3" />
                                  <span>{group.clinicRoom}</span>
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                              {group.nameAr}
                            </h4>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(group)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="تعديل بيانات المجموعة"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف ${group.nameAr}؟ سيتم إلغاء تسكين الطلاب المسجلين بها.`)) {
                                  deleteSubjectGroup(group.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="حذف المجموعة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Timing & Room */}
                        {group.scheduleDayTime && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{group.scheduleDayTime}</span>
                          </div>
                        )}

                        {/* Supervised Staff */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">المعيد الإكلينيكي:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                              {group.assignedTaName || 'غير محدد'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">المشرف الأكاديمي:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                              {group.assignedSupervisorName || 'غير محدد'}
                            </span>
                          </div>
                        </div>

                        {/* Capacity meter */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                              الطلاب المسجلين: <strong className="text-slate-900 dark:text-white">{assignedStudents.length}</strong> / {capacity}
                            </span>
                            <span className={`font-bold ${percent >= 100 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percent >= 100 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Students List in Group */}
                      <div className="p-3 space-y-2 flex-1 max-h-[360px] overflow-y-auto">
                        {assignedStudents.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 space-y-1">
                            <Users className="w-6 h-6 mx-auto opacity-40" />
                            <p className="text-xs">المجموعة فارغة حالياً</p>
                            <span className="text-[10px] text-slate-500">قم بتسكين طلاب من القائمة بالأعلى</span>
                          </div>
                        ) : (
                          assignedStudents.map((student) => (
                            <div
                              key={student.id}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all flex items-center justify-between gap-2 group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={student.avatar}
                                  alt={student.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                                    {student.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                                    {student.studentId || student.email}
                                  </span>
                                </div>
                              </div>

                              {/* Actions on Student inside Group */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Move to another group */}
                                {currentSubjectGroups.length > 1 && (
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        addStudentToSubjectGroup(e.target.value, student.id);
                                      }
                                    }}
                                    className="text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300 font-medium hover:border-emerald-500 cursor-pointer"
                                    title="نقل الطالب إلى مجموعة أخرى"
                                  >
                                    <option value="">نقل...</option>
                                    {currentSubjectGroups
                                      .filter((g) => g.id !== group.id)
                                      .map((g) => (
                                        <option key={g.id} value={g.id}>
                                          إلى {g.code}
                                        </option>
                                      ))}
                                  </select>
                                )}

                                {/* Remove from group */}
                                <button
                                  onClick={() => removeStudentFromSubjectGroup(group.id, student.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  title="إلغاء تسكين الطالب من المجموعة"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Group Footer Quick Add */}
                      <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {assignedStudents.length} طلاب مسجلين
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Student Cross-Subject Master Matrix */}
      {viewMode === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>مصفوفة توزيع الطلاب عبر جميع المواد للمستوى {selectedLevel === 'level4' ? 'الرابع' : 'الخامس'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                جدول شامل يوضح المجموعة السريرية المخصصة لكل طالب في جميع المواد المقررة في هذا الفصل.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
              {levelStudents.length} طالب
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="p-3">#</th>
                  <th className="p-3">الطالب</th>
                  <th className="p-3">الرقم الأكاديمي</th>
                  <th className="p-3">المجموعة العامة</th>
                  {availableSubjects.map((sub) => (
                    <th key={sub.id} className="p-3 text-center">
                      <span className="block font-bold">{sub.nameAr}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{sub.nameEn}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {levelStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{student.studentId || '-'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium text-[11px]">
                        {student.clinicalGroup || 'Group A1'}
                      </span>
                    </td>

                    {/* Columns for each subject */}
                    {availableSubjects.map((sub) => {
                      const subGroups = subjectGroups.filter(
                        (g) =>
                          (g.subjectId === sub.id || g.subjectId === sub.departmentKey) &&
                          g.academicLevel === selectedLevel &&
                          g.semester === selectedSemester
                      );
                      const studentGroup = subGroups.find((g) => (g.studentIds || []).includes(student.id));

                      return (
                        <td key={sub.id} className="p-3 text-center">
                          {studentGroup ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{studentGroup.code}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium text-[11px] border border-amber-200 dark:border-amber-800/40">
                              غير مسكن
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {/* 1. Create / Edit Group Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl max-h-[92vh] w-full overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {editingGroup ? 'تعديل بيانات المجموعة الإكلينيكية' : `إنشاء وتوزيع مجموعة جديدة لمادة (${activeSubject.nameAr})`}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      مادة {activeSubject.nameAr} ({activeSubject.nameEn})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGroup} className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* 1. Level & Semester Selectors (User Request) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      تحديد المستوى الدراسي *
                    </label>
                    <select
                      value={groupFormData.academicLevel}
                      onChange={(e) => {
                        const newLevel = e.target.value as 'level4' | 'level5';
                        setGroupFormData({
                          ...groupFormData,
                          academicLevel: newLevel,
                          selectedStudentIds: [],
                        });
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="level4">المستوى الرابع (السنة الرابعة)</option>
                      <option value="level5">المستوى الخامس (السنة الخامسة - تخرج)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      تحديد الترم (الفصل الدراسي) *
                    </label>
                    <select
                      value={groupFormData.semester}
                      onChange={(e) =>
                        setGroupFormData({
                          ...groupFormData,
                          semester: e.target.value as 'first' | 'second',
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="first">الترم الأول (الفصل الدراسي الأول)</option>
                      <option value="second">الترم الثاني (الفصل الدراسي الثاني)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Group Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    اسم المجموعة التوضيحي بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`مجموعة A1 (${activeSubject.nameAr})`}
                    value={groupFormData.nameAr}
                    onChange={(e) => setGroupFormData({ ...groupFormData, nameAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                {/* 3. Supervisors & Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      المعيد الإكلينيكي المشرف
                    </label>
                    <select
                      value={groupFormData.assignedTaId}
                      onChange={(e) => setGroupFormData({ ...groupFormData, assignedTaId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- اختياري (تحديد لاحقاً) --</option>
                      {teachingAssistants.map((ta) => (
                        <option key={ta.id} value={ta.id}>
                          {ta.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      عضو هيئة التدريس / المشرف
                    </label>
                    <select
                      value={groupFormData.assignedSupervisorId}
                      onChange={(e) => setGroupFormData({ ...groupFormData, assignedSupervisorId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- اختياري (تحديد لاحقاً) --</option>
                      {supervisors.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name} ({sup.role === 'department_head' ? 'رئيس قسم' : 'مشرف'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      الموعد الأسبوعي (اليوم والوقت)
                    </label>
                    <input
                      type="text"
                      placeholder="الأحد: 08:30 ص - 11:30 ص"
                      value={groupFormData.scheduleDayTime}
                      onChange={(e) => setGroupFormData({ ...groupFormData, scheduleDayTime: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      السعة القصوى للطلاب
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={groupFormData.maxCapacity}
                      onChange={(e) => setGroupFormData({ ...groupFormData, maxCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                </div>

                {/* 4. Student Accounts Selection Section (User Request) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                  {/* Section Title & Counter */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-900 dark:text-white block">
                          تحديد واختيار طلاب المجموعة (من حسابات الطلاب المسجلين) *
                        </label>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          اختر الطلاب الذين سيتم تسكينهم في هذه المجموعة لمادة ({activeSubject.nameAr})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          groupFormData.selectedStudentIds.length > groupFormData.maxCapacity
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
                            : groupFormData.selectedStudentIds.length === groupFormData.maxCapacity
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        تم تحديد: {groupFormData.selectedStudentIds.length} / {groupFormData.maxCapacity} طالب
                      </span>
                    </div>
                  </div>

                  {/* Actions & Search */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="بحث بالاسم، الرقم الجامعي، أو البريد..."
                        value={modalStudentSearch}
                        onChange={(e) => setModalStudentSearch(e.target.value)}
                        className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSelectAllFilteredStudents}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                      >
                        تحديد الكل ({filteredModalStudents.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectOnlyUnassignedStudents}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg transition-colors cursor-pointer"
                      >
                        غير المسكنين فقط
                      </button>
                      {groupFormData.selectedStudentIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleDeselectAllStudents}
                          className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          إلغاء التحديد
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Student List */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-200/70 dark:divide-slate-700/70 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    {filteredModalStudents.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        لا يوجد طلاب مطابقين لنتائج البحث في {groupFormData.academicLevel === 'level4' ? 'المستوى الرابع' : 'المستوى الخامس'}.
                      </div>
                    ) : (
                      filteredModalStudents.map((student) => {
                        const isSelected = groupFormData.selectedStudentIds.includes(student.id);
                        const assignedElsewhere = subjectGroups.find(
                          (g) =>
                            g.subjectId === activeSubject.departmentKey &&
                            g.academicLevel === groupFormData.academicLevel &&
                            g.semester === groupFormData.semester &&
                            (g.studentIds || []).includes(student.id) &&
                            (!editingGroup || g.id !== editingGroup.id)
                        );

                        return (
                          <div
                            key={student.id}
                            onClick={() => toggleStudentInModal(student.id)}
                            className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/40'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="shrink-0 text-emerald-600 dark:text-emerald-400">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                )}
                              </div>
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div className="min-w-0">
                                <span
                                  className={`text-xs block truncate ${
                                    isSelected
                                      ? 'font-black text-emerald-900 dark:text-emerald-100'
                                      : 'font-bold text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {student.name}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  <span>{student.studentId || student.email}</span>
                                  {student.clinicalGroup && (
                                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-sans">
                                      {student.clinicalGroup}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                                  <Check className="w-3 h-3" />
                                  <span>محدد للمجموعة</span>
                                </span>
                              ) : assignedElsewhere ? (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                                  مسكن في {assignedElsewhere.code}
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-medium border border-amber-200 dark:border-amber-800/40">
                                  غير مسكن
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 5. Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ملاحظات أو توجيهات سريرية للمجموعة
                  </label>
                  <textarea
                    rows={2}
                    placeholder="مثل: متطلبات التعقيم، الأدوات المطلوبة..."
                    value={groupFormData.notes}
                    onChange={(e) => setGroupFormData({ ...groupFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* 6. Form Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    الطلاب المختارين:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {groupFormData.selectedStudentIds.length} طالب
                    </strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{editingGroup ? 'حفظ التعديلات' : `إنشاء المجموعة (${groupFormData.selectedStudentIds.length} طلاب)`}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Smart Auto-Distribute Modal */}
      <AnimatePresence>
        {isAutoDistributeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-950/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      محرك التوزيع الذكي لطلاب مادة ({activeSubject.nameAr})
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      توزيع تلقائي متوازن لـ {levelStudents.length} طلاب على {currentSubjectGroups.length} مجموعات
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAutoDistributeModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {currentSubjectGroups.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs text-center">
                    يرجى أولاً إنشاء مجموعة واحدة على الأقل في هذه المادة لتتمكن من تشغيل التوزيع التلقائي.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        اختر طريقة التوزيع:
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                          <input
                            type="radio"
                            name="dist_method"
                            checked={autoDistributeMethod === 'balanced'}
                            onChange={() => setAutoDistributeMethod('balanced')}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              توزيع متوازن بالتساوي (Round-Robin Balanced)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              تقسيم الطلاب بالتساوي على جميع المجموعات المسجلة لمراعاة السعة الإكلينيكية.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                          <input
                            type="radio"
                            name="dist_method"
                            checked={autoDistributeMethod === 'alphabetical'}
                            onChange={() => setAutoDistributeMethod('alphabetical')}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              توزيع أبجدي متوازن حسب الأسماء (Alphabetical Split)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              ترتيب الطلاب هجائياً ثم توزيعهم بالتساوي بين المجموعات.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                          <input
                            type="radio"
                            name="dist_method"
                            checked={autoDistributeMethod === 'random'}
                            onChange={() => setAutoDistributeMethod('random')}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              توزيع عشوائي متوازن (Balanced Random)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              توزيع عشوائي عادل يضمن تساوي أعداد الطلاب في كل مجموعة.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {autoDistributeResult && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{autoDistributeResult}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAutoDistributeModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    إلغاء
                  </button>
                  {currentSubjectGroups.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExecuteAutoDistribute}
                      className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>تنفيذ التوزيع التلقائي الآن</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Replicate / Duplicate Groups to another Subject Modal */}
      <AnimatePresence>
        {isDuplicateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      نسخ هيكل وتوزيع المجموعات إلى مادة أخرى
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      من مادة: {activeSubject.nameAr} ({currentSubjectGroups.length} مجموعات)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    اختر المادة المستهدفة للنسخ إليها:
                  </label>
                  <select
                    value={targetDuplicateSubjectId}
                    onChange={(e) => setTargetDuplicateSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- اختر مادة سريرية --</option>
                    {availableSubjects
                      .filter((s) => s.id !== activeSubject.id && s.departmentKey !== activeSubject.departmentKey)
                      .map((sub) => (
                        <option key={sub.id} value={sub.departmentKey}>
                          {sub.nameAr} ({sub.nameEn})
                        </option>
                      ))}
                  </select>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  سيتم إنشاء نفس المجموعات (مثل Group A1 و Group A2) مع نفس الطلاب والمعيدين في المادة المستهدفة، مما يوفر عليك إعادة الإدخال يدوياً.
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDuplicateModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={!targetDuplicateSubjectId}
                    onClick={handleExecuteDuplicate}
                    className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>تأكيد النسخ للمادة</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Print Roster Modal */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-900"
              dir="rtl"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:bg-white">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase">كلية طب وجراحة الأسنان</span>
                  <h3 className="font-bold text-lg text-slate-900">
                    كشف توزيع المجموعات السريرية الرسمية - مادة {activeSubject.nameAr}
                  </h3>
                  <span className="text-xs text-slate-500 block">
                    العام الأكاديمي: 2025-2026 | المستوى: {selectedLevel === 'level4' ? 'الرابع' : 'الخامس'} | الفصل: {selectedSemester === 'first' ? 'الأول' : 'الثاني'}
                  </span>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة / حفظ PDF</span>
                  </button>
                  <button
                    onClick={() => setIsPrintModalOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {currentSubjectGroups.map((group, gIdx) => {
                  const studentsInGroup = levelStudents.filter((s) => (group.studentIds || []).includes(s.id));
                  return (
                    <div key={group.id} className="border border-slate-300 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <div>
                          <span className="font-bold text-sm text-emerald-800">
                            {group.code} — {group.nameAr}
                          </span>
                          <span className="text-xs text-slate-600 block">
                            العيادة: {group.clinicRoom || 'غير محدد'} | الموعد: {group.scheduleDayTime || 'غير محدد'}
                          </span>
                        </div>
                        <div className="text-left text-xs text-slate-600">
                          <span>المعيد: <strong>{group.assignedTaName || 'غير محدد'}</strong></span>
                          <span className="block">المشرف: <strong>{group.assignedSupervisorName || 'غير محدد'}</strong></span>
                        </div>
                      </div>

                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                            <th className="p-2">#</th>
                            <th className="p-2">اسم الطالب</th>
                            <th className="p-2">الرقم الأكاديمي</th>
                            <th className="p-2">المجموعة العامة</th>
                            <th className="p-2 text-center">التوقيع / الحضور</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {studentsInGroup.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-400">
                                لا يوجد طلاب مسجلين في هذه المجموعة
                              </td>
                            </tr>
                          ) : (
                            studentsInGroup.map((st, sIdx) => (
                              <tr key={st.id}>
                                <td className="p-2 font-mono text-slate-400">{sIdx + 1}</td>
                                <td className="p-2 font-bold text-slate-900">{st.name}</td>
                                <td className="p-2 font-mono text-slate-600">{st.studentId || '-'}</td>
                                <td className="p-2 text-slate-600">{st.clinicalGroup || '-'}</td>
                                <td className="p-2 text-center text-slate-300 font-mono">................</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
                تم استخراج هذا الكشف آلياً عبر منصة ClinDent للتعليم والتدريب السريري لطب الأسنان.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
