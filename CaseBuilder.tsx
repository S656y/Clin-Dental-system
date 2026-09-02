import React, { useState, useEffect, useMemo } from 'react';
import {
  DentalDepartment,
  PatientInfo,
  ToothState,
  RadiographItem,
  ClinicalProcedureStep,
  ClinicalCase,
} from '../../types';
import { useApp, findAssignedTaForStudent, findAssignedSupervisorForStudent } from '../../context/AppContext';
import { DentalChart } from '../dental/DentalChart';
import { PacsViewer } from '../dental/PacsViewer';
import {
  User,
  HeartPulse,
  Activity,
  FileText,
  CheckCircle2,
  Send,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Stethoscope,
  FolderPlus,
  Image as ImageIcon,
  X,
  Sparkles,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

interface CaseBuilderProps {
  onSuccess?: (createdCase: ClinicalCase) => void;
  onCancel?: () => void;
  onClose?: () => void;
  initialCase?: ClinicalCase;
  initialDepartment?: DentalDepartment;
}

export const CaseBuilder: React.FC<CaseBuilderProps> = ({
  onSuccess,
  onCancel,
  onClose,
  initialCase,
  initialDepartment,
}) => {
  const {
    currentUser,
    users,
    createCase,
    updateCase,
    t,
    language,
    subjectGroups,
    taAllocations,
  } = useApp();

  const handleDismiss = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  // Find available clinical supervisors
  const supervisors = useMemo(
    () => users.filter((u) => u.role === 'supervisor' || u.role === 'department_head'),
    [users]
  );

  // Find available teaching assistants
  const teachingAssistants = useMemo(
    () => users.filter((u) => u.role === 'teaching_assistant'),
    [users]
  );

  const [activeTab, setActiveTab] = useState<'patient' | 'chart' | 'pacs' | 'procedure'>(
    'patient'
  );

  // Status message for feedback
  const [statusFeedback, setStatusFeedback] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialCase?.title || '');
  const [department, setDepartment] = useState<DentalDepartment>(
    initialCase?.department || initialDepartment || 'operative'
  );

  // Auto-resolve initial TA
  const initialResolvedTa = useMemo(() => {
    if (initialCase?.assignedTaId) {
      return users.find((u) => u.id === initialCase.assignedTaId);
    }
    return findAssignedTaForStudent(
      currentUser.id,
      initialCase?.department || initialDepartment || 'operative',
      users,
      subjectGroups,
      taAllocations
    );
  }, [initialCase, initialDepartment, currentUser.id, users, subjectGroups, taAllocations]);

  const [assignedTaId, setAssignedTaId] = useState<string>(
    initialCase?.assignedTaId || initialResolvedTa?.id || ''
  );

  const [supervisorId, setSupervisorId] = useState(
    initialCase?.supervisorId || supervisors[0]?.id || ''
  );

  // When department changes, update auto-assigned TA and Supervisor
  useEffect(() => {
    if (!initialCase) {
      const resolved = findAssignedTaForStudent(
        currentUser.id,
        department,
        users,
        subjectGroups,
        taAllocations
      );
      if (resolved) {
        setAssignedTaId(resolved.id);
      }
      const resolvedSup = findAssignedSupervisorForStudent(
        currentUser.id,
        department,
        users,
        subjectGroups
      );
      if (resolvedSup) {
        setSupervisorId(resolvedSup.id);
      }
    }
  }, [department, currentUser.id, users, subjectGroups, taAllocations, initialCase]);

  const [dentitionType, setDentitionType] = useState<'permanent' | 'deciduous'>(
    initialCase?.dentitionType || 'permanent'
  );

  // Patient Info
  const [patientName, setPatientName] = useState(initialCase?.patient?.name || '');
  const [fileNumber, setFileNumber] = useState(
    initialCase?.patient?.fileNumber || `P-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [nationalId, setNationalId] = useState(initialCase?.patient?.nationalId || '');
  const [age, setAge] = useState<number>(initialCase?.patient?.age || 30);
  const [gender, setGender] = useState<'male' | 'female'>(
    initialCase?.patient?.gender || 'male'
  );
  const [phone, setPhone] = useState(initialCase?.patient?.phone || '');
  const [chiefComplaint, setChiefComplaint] = useState(
    initialCase?.patient?.chiefComplaint || ''
  );
  const [medicalHistory, setMedicalHistory] = useState(
    initialCase?.patient?.medicalHistory?.join(', ') || 'سليم تماماً، لا يوجد أمراض مزمنة'
  );
  const [allergies, setAllergies] = useState(initialCase?.patient?.allergies || '');
  const [bloodPressure, setBloodPressure] = useState(
    initialCase?.patient?.vitalSigns?.bloodPressure || '120/80 mmHg'
  );
  const [pulse, setPulse] = useState(initialCase?.patient?.vitalSigns?.pulse || '72 bpm');
  const [bloodSugar, setBloodSugar] = useState(
    initialCase?.patient?.vitalSigns?.bloodSugar || ''
  );

  // Dental Chart & Radiographs
  const [dentalChart, setDentalChart] = useState<Record<string, ToothState>>(
    initialCase?.dentalChart || {}
  );
  const [radiographs, setRadiographs] = useState<RadiographItem[]>(
    initialCase?.radiographs || []
  );

  // Diagnosis & Treatment
  const [diagnosis, setDiagnosis] = useState(
    initialCase?.diagnosis || 'حالة علاجية تحتاج تقييماً وتوثيقاً سريرياً معتمداً'
  );
  const [treatmentPlan, setTreatmentPlan] = useState(
    initialCase?.treatmentPlan || 'خطة العلاج السريري المعتمدة وفق بروتوكول الكلية'
  );
  const [procedureSteps, setProcedureSteps] = useState<ClinicalProcedureStep[]>(
    initialCase?.procedureSteps || [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'الفحص السريري والتخدير الموضعي والعزل',
        description: 'Clinical examination, local anesthesia and rubber dam isolation.',
        isCompleted: true,
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'الإجراء العلاجي الأساسي',
        description: 'Cavity prep / Instrumentation / Extraction.',
        isCompleted: true,
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'الإنهاء والتقييم النهائي مع المشرف',
        description: 'Finishing, polishing and final clinical verification.',
        isCompleted: false,
      },
    ]
  );

  const handleAddProcedureStep = () => {
    const nextNum = procedureSteps.length + 1;
    setProcedureSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        stepNumber: nextNum,
        title: `خطوة سريرية إجرائية ${nextNum}`,
        description: '',
        isCompleted: false,
      },
    ]);
  };

  const handleRemoveStep = (id: string) => {
    setProcedureSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateStep = (id: string, updates: Partial<ClinicalProcedureStep>) => {
    setProcedureSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleAddRadiographToCase = (radData: Omit<RadiographItem, 'id'>) => {
    const newRad: RadiographItem = {
      ...radData,
      id: `case-rad-${Date.now()}`,
    };
    setRadiographs((prev) => [newRad, ...prev]);
  };

  const getDeptLabelAr = (dept: DentalDepartment): string => {
    switch (dept) {
      case 'operative':
        return 'مداواة الأسنان والترميمات';
      case 'endodontics':
        return 'علاج جذور وعصب الأسنان';
      case 'prosthodontics':
        return 'الاستعاضة الصناعية والتركيبات';
      case 'periodontics':
        return 'أمراض وجراحة اللثة والأنسجة';
      case 'pedodontics':
        return 'طب أسنان الأطفال';
      case 'oral_surgery':
        return 'جراحة الفم والتخدير والقلع';
      case 'orthodontics':
        return 'تقويم الأسنان والفكين';
      default:
        return dept;
    }
  };

  const handleSave = (submitForReview = false) => {
    setIsSubmitting(true);

    // Provide default safe values if user submitted without typing
    const finalPatientName = patientName.trim() || `مريض عيادة (${fileNumber})`;
    const finalTitle =
      title.trim() ||
      `حالة ${getDeptLabelAr(department)} - مريض: ${finalPatientName}`;

    const effectiveSupervisorId = supervisorId || supervisors[0]?.id || 'sup-1';
    const selectedSupervisor = users.find((u) => u.id === effectiveSupervisorId);

    // Resolve effective TA
    const resolvedTa =
      users.find((u) => u.id === assignedTaId) ||
      findAssignedTaForStudent(
        currentUser.id,
        department,
        users,
        subjectGroups,
        taAllocations
      );
    const effectiveTaId = assignedTaId || resolvedTa?.id;
    const effectiveTaName = resolvedTa?.name;

    const patientInfo: PatientInfo = {
      name: finalPatientName,
      fileNumber: fileNumber || `P-${Math.floor(10000 + Math.random() * 90000)}`,
      nationalId: nationalId || '',
      age: Number(age) || 28,
      gender,
      phone: phone || '',
      chiefComplaint: chiefComplaint || 'فحص وعلاج أسنان',
      medicalHistory: medicalHistory
        ? medicalHistory.split(',').map((s) => s.trim())
        : ['سليم تماماً، لا يوجد أمراض مزمنة'],
      allergies: allergies || 'لا توجد حساسية معروفة',
      vitalSigns: {
        bloodPressure: bloodPressure || '120/80 mmHg',
        pulse: pulse || '72 bpm',
        bloodSugar: bloodSugar || '',
      },
    };

    const studentAcademicYearLabel =
      currentUser.academicYear ||
      (currentUser.academicLevel === 'level4'
        ? 'المستوى الرابع (Level 4)'
        : 'المستوى الخامس (Level 5)');

    let resultCase: ClinicalCase;

    if (initialCase) {
      updateCase(initialCase.id, {
        title: finalTitle,
        department,
        supervisorId: effectiveSupervisorId,
        supervisorName: selectedSupervisor?.name || initialCase.supervisorName || 'مشرف إكلينيكي',
        assignedTaId: effectiveTaId || initialCase.assignedTaId,
        assignedTaName: effectiveTaName || initialCase.assignedTaName,
        clinicalGroup: currentUser.clinicalGroup || initialCase.clinicalGroup || 'Group A1',
        academicLevel: currentUser.academicLevel || initialCase.academicLevel || 'level4',
        semester: currentUser.semester || initialCase.semester || 'first',
        patient: patientInfo,
        dentitionType,
        dentalChart,
        radiographs,
        diagnosis: diagnosis || 'تشخيص سريري معتمد',
        treatmentPlan: treatmentPlan || 'خطة علاجية سريرية معتمدة',
        procedureSteps,
        status: submitForReview ? 'under_review' : 'draft',
      });
      resultCase = {
        ...initialCase,
        title: finalTitle,
        department,
        supervisorId: effectiveSupervisorId,
        supervisorName: selectedSupervisor?.name || initialCase.supervisorName || 'مشرف إكلينيكي',
        assignedTaId: effectiveTaId || initialCase.assignedTaId,
        assignedTaName: effectiveTaName || initialCase.assignedTaName,
        status: submitForReview ? 'under_review' : 'draft',
        procedureSteps,
      };
    } else {
      resultCase = createCase({
        title: finalTitle,
        department,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentAcademicYear: studentAcademicYearLabel,
        academicLevel: currentUser.academicLevel || 'level4',
        semester: currentUser.semester || 'first',
        clinicalGroup: currentUser.clinicalGroup || 'Group A1',
        supervisorId: effectiveSupervisorId,
        supervisorName: selectedSupervisor?.name || 'مشرف إكلينيكي',
        assignedTaId: effectiveTaId,
        assignedTaName: effectiveTaName,
        patient: patientInfo,
        dentitionType,
        dentalChart,
        radiographs,
        clinicalPhotos: [],
        diagnosis: diagnosis || 'تشخيص سريري معتمد',
        treatmentPlan: treatmentPlan || 'خطة علاجية سريرية معتمدة',
        procedureSteps,
        status: submitForReview ? 'under_review' : 'draft',
        quotaUnits: 1,
      });
    }

    const taMsg = effectiveTaName ? ` والمعيد المسؤول (${effectiveTaName})` : '';
    setStatusFeedback({
      type: 'success',
      text: submitForReview
        ? `✅ تم تحويل الحالة السريرية بنجاح إلى المشرف الإكلينيكي${taMsg} للمراجعة والاعتماد!`
        : '💾 تم حفظ مسودة الحالة السريرية بنجاح.',
    });

    setTimeout(() => {
      if (onSuccess) onSuccess(resultCase);
      if (onClose) onClose();
      else if (onCancel) onCancel();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">
                {initialCase ? 'تعديل وتحديث الحالة السريرية' : t.navCaseBuilder}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                توثيق السجل السريري، التخطيط السني، وإرفاق الأشعة للتقييم والاعتماد
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="save-draft-case-btn"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{t.saveDraft}</span>
            </button>

            <button
              type="button"
              id="submit-review-case-btn"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{t.submitForReview}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if triggered */}
        {statusFeedback && (
          <div
            className={`p-3 text-xs font-bold flex items-center justify-between ${
              statusFeedback.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            <span>{statusFeedback.text}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 px-4 md:px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'patient'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            1. بيانات المريض والقسم
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'chart'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            2. تخطيط الأسنان التفاعلي ({Object.keys(dentalChart).length} أسنان)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pacs')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pacs'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            3. عارض الأشعة PACS ({radiographs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('procedure')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'procedure'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            4. التشخيص وخطة العلاج والخطوات
          </button>
        </div>

        {/* Tab Contents Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Tab 1: Patient & Department Info */}
          {activeTab === 'patient' && (
            <div className="space-y-6">
              {/* Title & Department Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان الحالة والإجراء السريري
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: حشوة كمبوزيت Class II للسن 16 أو معالجة عصب للرحى 46..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    القسم السريري التخصصي *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as DentalDepartment)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
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
              </div>

              {/* Teaching Assistant & Supervisor Assignment (Dual-routing UI) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Teaching Assistant Assignment */}
                <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-cyan-900 dark:text-cyan-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      المعيد الإكلينيكي المسؤول عن متابعة المجموعة *
                    </label>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      تعيين تلقائي للمجموعة
                    </span>
                  </div>

                  <select
                    value={assignedTaId}
                    onChange={(e) => setAssignedTaId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {teachingAssistants.map((ta) => (
                      <option key={ta.id} value={ta.id}>
                        {ta.name} ({ta.assignedGroupName || ta.clinicalGroup || 'المجموعة'} - {ta.assignedSubject || ta.department || 'القسم'})
                      </option>
                    ))}
                  </select>

                  <p className="text-[11px] text-cyan-800/80 dark:text-cyan-300/80">
                    ستظهر الحالة فوراً في طابور المراجعة والاعتماد لدى المعيد المسؤول عن مجموعتك السريرية.
                  </p>
                </div>

                {/* 2. Supervisor Assignment */}
                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      المشرف الإكلينيكي / عضو هيئة التدريس *
                    </label>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                      الاعتماد النهائي
                    </span>
                  </div>

                  <select
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - {s.clinicalGroup || s.department || 'مشرف سريري'}
                      </option>
                    ))}
                  </select>

                  <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80">
                    عضو هيئة التدريس المسؤول عن التقييم السريري الشامل واحتساب الكوتا.
                  </p>
                </div>
              </div>

              {/* Patient Personal Information */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  البيانات الديموغرافية والشخصية للمريض
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      اسم المريض الكامل
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="اسم المريض..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      رقم الملف الطبي
                    </label>
                    <input
                      type="text"
                      value={fileNumber}
                      onChange={(e) => setFileNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      رقم الهوية الوطنية / الإقامة
                    </label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="10xxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      العمر (سنوات)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      الجنس
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="male">ذكر (Male)</option>
                      <option value="female">أنثى (Female)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      الشكوى الرئيسية للمريض (Chief Complaint)
                    </label>
                    <input
                      type="text"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="مثال: ألم حاد ومستمر عند شرب الماء البارد في الجهة اليمنى..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Medical History & Vital Signs */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  التاريخ الطبي والعلامات الحيوية (Medical History & Vitals)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      الأمراض المزمنة والتاريخ المرضي
                    </label>
                    <input
                      type="text"
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      placeholder="سليم، لا يوجد أمراض مزمنة..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      الحساسية الدوائية والغذائية (Allergies)
                    </label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="لا توجد، أو حساسية البنسلين..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      ضغط الدم (BP)
                    </label>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      النبض (Pulse)
                    </label>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      سكر الدم (RBS)
                    </label>
                    <input
                      type="text"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(e.target.value)}
                      placeholder="110 mg/dL"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Next Step Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chart')}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md hover:bg-teal-500 transition-all cursor-pointer"
                >
                  التالي: تخطيط الأسنان التفاعلي ←
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Interactive Dental Chart */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    نوع الأسنان:
                  </span>
                  <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() => setDentitionType('permanent')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        dentitionType === 'permanent'
                          ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      أسنان دائمة (Adult)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDentitionType('deciduous')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        dentitionType === 'deciduous'
                          ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      أسنان لبنية (Pediatric)
                    </button>
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  انقر على السن والأسطح لتحديد التشخيص والإجراء
                </span>
              </div>

              <DentalChart
                dentalChart={dentalChart}
                onChange={setDentalChart}
                dentitionType={dentitionType}
                interactive={true}
              />

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('patient')}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                >
                  → السابق: بيانات المريض
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pacs')}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md hover:bg-teal-500 transition-all cursor-pointer"
                >
                  التالي: عارض الأشعة PACS ←
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: PACS Viewer */}
          {activeTab === 'pacs' && (
            <div className="space-y-4">
              <PacsViewer
                radiographs={radiographs}
                onAddRadiograph={handleAddRadiographToCase}
                canUpload={true}
              />

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chart')}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                >
                  → السابق: تخطيط الأسنان
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('procedure')}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md hover:bg-teal-500 transition-all cursor-pointer"
                >
                  التالي: خطة العلاج والخطوات الإجرائية ←
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Diagnosis & Clinical Procedure Steps */}
          {activeTab === 'procedure' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التشخيص الإكلينيكي النهائي (Clinical Diagnosis)
                  </label>
                  <textarea
                    rows={3}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="مثال: Symptomatic Irreversible Pulpitis or Class II Deep Dentinal Caries..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    خطة العلاج الشاملة (Treatment Plan)
                  </label>
                  <textarea
                    rows={3}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="وصف تفصيلي للخطوات والمواد السريرية المستخدمة..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
              </div>

              {/* Clinical Procedure Steps Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    خطوات العمل الإجرائية وتوقيع المشرف (Clinical Procedure Steps)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddProcedureStep}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة خطوة سريرية
                  </button>
                </div>

                <div className="space-y-3">
                  {procedureSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 w-full">
                        <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) =>
                              handleUpdateStep(step.id, { title: e.target.value })
                            }
                            className="w-full text-xs font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 outline-none text-slate-900 dark:text-slate-100"
                          />
                          <input
                            type="text"
                            value={step.description}
                            onChange={(e) =>
                              handleUpdateStep(step.id, { description: e.target.value })
                            }
                            placeholder="وصف تفصيلي للخطوة أو الملاحظات..."
                            className="w-full text-xs text-slate-500 dark:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          <input
                            type="checkbox"
                            checked={step.isCompleted}
                            onChange={(e) =>
                              handleUpdateStep(step.id, { isCompleted: e.target.checked })
                            }
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span>تم الإنجاز</span>
                        </label>

                        {procedureSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(step.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="حذف هذه الخطوة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission Actions Box (From User Screenshot) */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-xs text-teal-950 dark:text-teal-200 text-center md:text-right">
                  <span className="font-bold text-sm block">جاهز للاعتماد السريري؟</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    عند التحويل للمراجعة، ستظهر الحالة مباشرة في قائمة تقييم المشرف الإكلينيكي المعتمد.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSave(false)}
                    className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {t.saveDraft}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSave(true)}
                    className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.submitForReview}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
