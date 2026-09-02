import React, { useState } from 'react';
import {
  ClinicalCase,
  CaseStatus,
  SupervisorEvaluation,
  DentalDepartment,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { DentalChart } from '../dental/DentalChart';
import { PacsViewer } from '../dental/PacsViewer';
import { CONDITION_CONFIG } from '../../utils/dentalData';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Activity,
  HeartPulse,
  Award,
  Sparkles,
  Printer,
  Calendar,
  Layers,
  Send,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Trash2,
  Edit,
  Sliders,
  Save,
  Crown,
  Lock,
  Unlock,
  Check,
  RotateCcw,
} from 'lucide-react';

interface CaseDetailModalProps {
  clinicalCase: ClinicalCase;
  onClose: () => void;
  onEdit?: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  clinicalCase,
  onClose,
  onEdit,
}) => {
  const { currentUser, evaluateCase, updateCase, deleteCase, signProcedureStep, submitCaseForReview, t, language } = useApp();
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  const isFounder = currentUser.role === 'founder';
  const isSupervisorOrDeanOrHead =
    currentUser.role === 'supervisor' ||
    currentUser.role === 'department_head' ||
    currentUser.role === 'dean' ||
    currentUser.role === 'founder' ||
    currentUser.role === 'teaching_assistant';

  // Founder Quick Edit State
  const [showFounderQuickEdit, setShowFounderQuickEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(clinicalCase.title);
  const [editDiagnosis, setEditDiagnosis] = useState(clinicalCase.diagnosis);
  const [editTreatmentPlan, setEditTreatmentPlan] = useState(clinicalCase.treatmentPlan);
  const [editQuotaUnits, setEditQuotaUnits] = useState(clinicalCase.quotaUnits || 1);
  const [editPatientName, setEditPatientName] = useState(clinicalCase.patient.name);
  const [editPatientFile, setEditPatientFile] = useState(clinicalCase.patient.fileNumber);
  const [editPatientAge, setEditPatientAge] = useState(clinicalCase.patient.age);
  const [editPatientPhone, setEditPatientPhone] = useState(clinicalCase.patient.phone);
  const [editStatus, setEditStatus] = useState<CaseStatus>(clinicalCase.status);
  const [editGrade, setEditGrade] = useState<number>(clinicalCase.evaluation?.grade || 90);
  const [editDept, setEditDept] = useState<DentalDepartment>(clinicalCase.department);

  const handleSubmitCase = () => {
    submitCaseForReview(clinicalCase.id, clinicalCase.supervisorId, clinicalCase.assignedTaId);
    const taLabel = clinicalCase.assignedTaName ? ` والمعيد المسؤول (${clinicalCase.assignedTaName})` : '';
    setSubmitFeedback(`✅ تم تحويل الحالة السريرية بنجاح إلى المشرف الإكلينيكي${taLabel} للمراجعة والاعتماد.`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleDeleteCasePermanent = () => {
    const confirmMsg = language === 'ar'
      ? `تحذير سيادي للمؤسس:\nهل أنت متأكد من رغبتك في حذف الحالة السريرية [${clinicalCase.caseNumber}] نهائياً من قاعدة البيانات وسجلات القسم؟ لا يمكن التراجع عن هذا الإجراء.`
      : `Founder Warning: Are you sure you want to permanently delete case [${clinicalCase.caseNumber}] from the database?`;
    
    if (window.confirm(confirmMsg)) {
      deleteCase(clinicalCase.id);
      onClose();
    }
  };

  const handleSaveFounderQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedEval: SupervisorEvaluation | undefined =
      editStatus === 'approved'
        ? {
            grade: Number(editGrade) || 90,
            criteria: {
              infectionControl: 20,
              anesthesiaCavityPrep: 25,
              restorationObturation: 25,
              patientManagement: 10,
              professionalEthics: 10,
            },
            feedbackNotes: clinicalCase.evaluation?.feedbackNotes || 'تم الاعتماد والتعديل المباشر بصلاحية المؤسس السيادية',
            supervisorSignature: clinicalCase.evaluation?.supervisorSignature || `${currentUser.name} (Founder Sovereignty)`,
            evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            supervisorId: currentUser.id,
            supervisorName: currentUser.name,
          }
        : clinicalCase.evaluation;

    updateCase(clinicalCase.id, {
      title: editTitle,
      diagnosis: editDiagnosis,
      treatmentPlan: editTreatmentPlan,
      quotaUnits: Number(editQuotaUnits) || 1,
      department: editDept,
      status: editStatus,
      patient: {
        ...clinicalCase.patient,
        name: editPatientName,
        fileNumber: editPatientFile,
        age: Number(editPatientAge) || clinicalCase.patient.age,
        phone: editPatientPhone,
      },
      evaluation: updatedEval,
    });

    setShowFounderQuickEdit(false);
    setSubmitFeedback('✅ تم حفظ تعديلات المؤسس السيادية وتحديث بيانات الحالة بنجاح.');
    setTimeout(() => setSubmitFeedback(null), 3500);
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'pacs' | 'eval'>('overview');

  // Evaluation Form State
  const [evalStatus, setEvalStatus] = useState<CaseStatus>('approved');
  const [infectionControl, setInfectionControl] = useState(
    clinicalCase.evaluation?.criteria.infectionControl || 20
  );
  const [anesthesiaCavityPrep, setAnesthesiaCavityPrep] = useState(
    clinicalCase.evaluation?.criteria.anesthesiaCavityPrep || 24
  );
  const [restorationObturation, setRestorationObturation] = useState(
    clinicalCase.evaluation?.criteria.restorationObturation || 24
  );
  const [patientManagement, setPatientManagement] = useState(
    clinicalCase.evaluation?.criteria.patientManagement || 14
  );
  const [professionalEthics, setProfessionalEthics] = useState(
    clinicalCase.evaluation?.criteria.professionalEthics || 14
  );

  const [feedbackNotes, setFeedbackNotes] = useState(
    clinicalCase.evaluation?.feedbackNotes || ''
  );
  const [revisionPoints, setRevisionPoints] = useState<string[]>(
    clinicalCase.evaluation?.revisionRequests || ['']
  );
  const [supervisorSignature, setSupervisorSignature] = useState(
    clinicalCase.evaluation?.supervisorSignature ||
      `${currentUser.name}, BDS, Clinical Faculty`
  );

  const totalGrade =
    infectionControl +
    anesthesiaCavityPrep +
    restorationObturation +
    patientManagement +
    professionalEthics;

  const handleAddRevisionPoint = () => {
    setRevisionPoints((prev) => [...prev, '']);
  };

  const handleUpdateRevisionPoint = (index: number, text: string) => {
    setRevisionPoints((prev) => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  const handleRemoveRevisionPoint = (index: number) => {
    setRevisionPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNotes) {
      alert(language === 'ar' ? 'يرجى كتابة الملاحظات التوجيهية للطالب' : 'Please enter feedback notes');
      return;
    }

    const evalData: SupervisorEvaluation = {
      grade: totalGrade,
      criteria: {
        infectionControl,
        anesthesiaCavityPrep,
        restorationObturation,
        patientManagement,
        professionalEthics,
      },
      feedbackNotes,
      revisionRequests:
        evalStatus === 'needs_correction'
          ? revisionPoints.filter((r) => r.trim().length > 0)
          : undefined,
      supervisorSignature,
    };

    evaluateCase(clinicalCase.id, evalStatus, evalData);
    onClose();
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.approved}
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            {t.under_review}
          </span>
        );
      case 'needs_correction':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.needs_correction}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            {t.rejected}
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <FileText className="w-3.5 h-3.5" />
            {t.draft}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Top Header */}
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  {clinicalCase.caseNumber}
                </span>
                {getStatusBadge(clinicalCase.status)}
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {clinicalCase.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Founder Sovereign Action Buttons */}
            {isFounder && (
              <>
                <button
                  type="button"
                  onClick={() => setShowFounderQuickEdit((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                    showFounderQuickEdit
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                  title="تعديل سيادي فوري لكافة بيانات الحالة والدرجات"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{showFounderQuickEdit ? 'إغلاق التعديل' : 'تعديل سيادي'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteCasePermanent}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                  title="حذف هذه الحالة السريرية نهائياً من قاعدة البيانات وسجلات القسم"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف نهائي</span>
                </button>
              </>
            )}

            {(clinicalCase.status === 'draft' || clinicalCase.status === 'needs_correction') && (
              <button
                type="button"
                onClick={handleSubmitCase}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                title="تحويل الحالة إلى المراجعة والاعتماد (إرسال للمُعيد والمشرف)"
              >
                <Send className="w-3.5 h-3.5" />
                <span>تحويل للاعتماد</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={t.printLogbook}
            >
              <Printer className="w-4 h-4" />
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-colors shadow-xs"
              >
                {t.editCase}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Founder Quick Edit Sovereignty Banner */}
        {isFounder && showFounderQuickEdit && (
          <form onSubmit={handleSaveFounderQuickEdit} className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border-b border-indigo-500/30 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black text-amber-300">
                  لوحة التعديل والاعتماد السيادي للمؤسس (Founder Sovereignty Editor)
                </span>
              </div>
              <span className="text-[11px] text-indigo-200 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                صلاحيات تعديل وحذف كاملة بدون قيود
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-indigo-200 text-[11px] font-bold mb-1">عنوان الحالة الإكلينيكية</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-indigo-200 text-[11px] font-bold mb-1">القسم السريري التابع</label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value as DentalDepartment)}
                  className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
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
                <label className="block text-indigo-200 text-[11px] font-bold mb-1">حالة الاعتماد</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as CaseStatus)}
                  className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                >
                  <option value="approved">معتمدة ومحتسبة (Approved)</option>
                  <option value="under_review">قيد المراجعة (Under Review)</option>
                  <option value="needs_correction">مطلوب تعديل (Needs Correction)</option>
                  <option value="rejected">مرفوضة (Rejected)</option>
                  <option value="draft">مسودة (Draft)</option>
                </select>
              </div>

              <div>
                <label className="block text-indigo-200 text-[11px] font-bold mb-1">الدرجة الممنوحة (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editGrade}
                  onChange={(e) => setEditGrade(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-indigo-200 text-[11px] font-bold mb-1">اسم المريض</label>
                <input
                  type="text"
                  value={editPatientName}
                  onChange={(e) => setEditPatientName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-indigo-200 text-[11px] font-bold mb-1">رقم ملف المريض</label>
                <input
                  type="text"
                  value={editPatientFile}
                  onChange={(e) => setEditPatientFile(e.target.value)}
                  className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-indigo-200 text-[11px] font-bold mb-1">نقاط الكوتا المحتسبة</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editQuotaUnits}
                  onChange={(e) => setEditQuotaUnits(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono font-bold"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات السيادية</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Feedback Alert if submitted */}
        {submitFeedback && (
          <div className="p-3 bg-emerald-500 text-white text-xs font-bold px-6 flex items-center justify-between">
            <span>{submitFeedback}</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 px-4 md:px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            الملف السريري والتشخيص
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'chart'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            مخطط الأسنان ({Object.keys(clinicalCase.dentalChart || {}).length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pacs')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pacs'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            الأشعة الرقمية PACS ({clinicalCase.radiographs.length})
          </button>

          {isSupervisorOrDeanOrHead && (
            <button
              type="button"
              onClick={() => setActiveTab('eval')}
              className={`py-3 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'eval'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-amber-600/80 hover:text-amber-700'
              }`}
            >
              <Award className="w-4 h-4" />
              مركز تقييم واعتماد المشرف
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Tab 1: Clinical Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Supervisor Evaluation Callout (if already evaluated) */}
              {clinicalCase.evaluation && (
                <div
                  className={`p-4 rounded-2xl border ${
                    clinicalCase.status === 'approved'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : clinicalCase.status === 'needs_correction'
                      ? 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800'
                      : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-sm">
                        تقرير التقييم الإكلينيكي المعتمد (الدرجة: {clinicalCase.evaluation.grade}/100)
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {clinicalCase.evaluation.evaluatedAt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    {clinicalCase.evaluation.feedbackNotes}
                  </p>

                  {/* Revision points list if needs correction */}
                  {clinicalCase.evaluation.revisionRequests &&
                    clinicalCase.evaluation.revisionRequests.length > 0 && (
                      <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-orange-200 dark:border-orange-800/60">
                        <span className="text-xs font-bold text-orange-800 dark:text-orange-300 block mb-1">
                          التعديلات المطلوبة من الطالب:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          {clinicalCase.evaluation.revisionRequests.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 mt-2">
                    <span>
                      المشرف المقيم:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {clinicalCase.evaluation.supervisorName || clinicalCase.supervisorName}
                      </strong>
                    </span>
                    <span>{clinicalCase.evaluation.supervisorSignature}</span>
                  </div>
                </div>
              )}

              {/* Student & Supervisor & Teaching Assistant Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-500 block">طالب طب الأسنان:</span>
                  <strong className="text-sm text-slate-800 dark:text-slate-200">
                    {clinicalCase.studentName}
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    {clinicalCase.studentAcademicYear}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">المشرف الإكلينيكي:</span>
                  <strong className="text-sm text-slate-800 dark:text-slate-200">
                    {clinicalCase.supervisorName}
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    {t[clinicalCase.department]}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-800/40">
                  <span className="text-cyan-800 dark:text-cyan-300 block font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    المعيد المسؤول:
                  </span>
                  <strong className="text-xs text-cyan-950 dark:text-cyan-100 block mt-0.5">
                    {clinicalCase.assignedTaName || 'معيد المجموعة السريرية'}
                  </strong>
                  <span className="text-[10px] text-cyan-700 dark:text-cyan-400 block">
                    مراجعة واعتماد الخطوات الإجرائية
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">تاريخ التوثيق:</span>
                  <strong className="text-sm text-slate-800 dark:text-slate-200">
                    {clinicalCase.createdAt}
                  </strong>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 block font-bold">
                    النقاط المحتسبة: +{clinicalCase.quotaUnits} كوتا
                  </span>
                </div>
              </div>

              {/* Patient Demographics & History */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  بيانات المريض والسجل الطبي
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">اسم المريض:</span>
                    <p className="font-bold">{clinicalCase.patient.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">رقم الملف:</span>
                    <p className="font-mono font-bold">{clinicalCase.patient.fileNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">العمر والجنس:</span>
                    <p className="font-bold">
                      {clinicalCase.patient.age} سنة / {clinicalCase.patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">الهاتف:</span>
                    <p className="font-mono">{clinicalCase.patient.phone}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    الشكوى الرئيسية (Chief Complaint):
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{clinicalCase.patient.chiefComplaint}"
                  </p>
                </div>

                {/* Medical History & Allergies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      التاريخ الطبي:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">
                      {clinicalCase.patient.medicalHistory.join(' • ')}
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg border border-rose-200/60 dark:border-rose-900/40">
                    <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">
                      التحسس الدوائي:
                    </span>
                    <p className="text-rose-900 dark:text-rose-300">
                      {clinicalCase.patient.allergies || 'لا يوجد تحسس مسجل'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnosis and Treatment Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                    التشخيص السريري (Diagnosis)
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {clinicalCase.diagnosis}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                    خطة العلاج المعتمدة (Treatment Plan)
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {clinicalCase.treatmentPlan}
                  </p>
                </div>
              </div>

              {/* Procedure Steps Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  مراحل وخطوات العمل الإجرائية وتوقيع المشرف
                </h4>
                <div className="space-y-2">
                  {clinicalCase.procedureSteps.map((step) => (
                    <div
                      key={step.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            step.isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 dark:bg-slate-700 text-slate-700'
                          }`}
                        >
                          {step.stepNumber}
                        </span>
                        <div>
                          <strong className="block text-slate-800 dark:text-slate-200">
                            {step.title}
                          </strong>
                          {step.description && (
                            <span className="text-[11px] text-slate-500">
                              {step.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {step.supervisorSigned || step.stepStatus === 'approved' ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              تم الاعتماد ({step.signedByName || step.supervisorName})
                            </span>
                            {step.signedTimestamp && (
                              <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                {step.signedTimestamp}
                              </span>
                            )}
                          </div>
                        ) : step.stepStatus === 'needs_correction' ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              مطلوب تعديل
                            </span>
                            {step.feedbackNotes && (
                              <span className="block text-[10px] text-orange-600 dark:text-orange-400 mt-0.5 max-w-xs">
                                {step.feedbackNotes}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {step.isCompleted ? 'بانتظار التوقيع' : 'قيد التنفيذ'}
                          </span>
                        )}

                        {/* Founder Sovereign Step Actions */}
                        {isFounder && (
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              type="button"
                              onClick={() => signProcedureStep(clinicalCase.id, step.id, 'approve', 'اعتماد سيادي مباشر من المؤسس')}
                              className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                              title="اعتماد هذه الخطوة فورياً بصلاحية المؤسس"
                            >
                              اعتماد المؤسس
                            </button>
                            <button
                              type="button"
                              onClick={() => signProcedureStep(clinicalCase.id, step.id, 'needs_correction', 'توجيه تصحيح من قِبل المؤسس')}
                              className="px-2 py-0.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold"
                              title="إرجاع الخطوة للتعديل"
                            >
                              طلب تعديل
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Interactive Dental Chart */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <DentalChart
                dentalChart={clinicalCase.dentalChart || {}}
                readOnly={true}
                dentitionType={clinicalCase.dentitionType || 'permanent'}
              />
            </div>
          )}

          {/* Tab 3: PACS Viewer */}
          {activeTab === 'pacs' && (
            <div className="space-y-4">
              <PacsViewer radiographs={clinicalCase.radiographs} readOnly={true} />
            </div>
          )}

          {/* Tab 4: Supervisor Evaluation Form */}
          {activeTab === 'eval' && isSupervisorOrDeanOrHead && (
            <form onSubmit={handleSubmitEvaluation} className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-amber-600" />
                  {t.evaluationTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  التقييم الإلزامي لاعتماد السجل السريري واحتساب النقاط في كوتا التخرج الخاصة بالطالب.
                </p>
              </div>

              {/* Outcome Selection Buttons (Approved / Correction / Rejected) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  القرار والاعتماد الإكلينيكي النهائي *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setEvalStatus('approved')}
                    className={`p-3.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      evalStatus === 'approved'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t.approveCase}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvalStatus('needs_correction')}
                    className={`p-3.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      evalStatus === 'needs_correction'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 ring-2 ring-orange-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-orange-300'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    {t.requestCorrection}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvalStatus('rejected')}
                    className={`p-3.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      evalStatus === 'rejected'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-rose-300'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    {t.rejectCase}
                  </button>
                </div>
              </div>

              {/* Rubric Evaluation Sliders */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    بنود التقييم السريري الدقيق (Rubric Scoring):
                  </span>
                  <span className="text-sm font-bold font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                    المجموع: {totalGrade} / 100
                  </span>
                </div>

                {/* 1. Infection Control */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t.criteriaInfectionControl}</span>
                    <strong className="font-mono text-teal-600">{infectionControl}/20</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={infectionControl}
                    onChange={(e) => setInfectionControl(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                {/* 2. Anesthesia & Cavity Prep */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t.criteriaAnesthesiaCavity}</span>
                    <strong className="font-mono text-teal-600">{anesthesiaCavityPrep}/25</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={anesthesiaCavityPrep}
                    onChange={(e) => setAnesthesiaCavityPrep(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                {/* 3. Restoration & Obturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t.criteriaRestoration}</span>
                    <strong className="font-mono text-teal-600">{restorationObturation}/25</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={restorationObturation}
                    onChange={(e) => setRestorationObturation(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                {/* 4. Patient Management */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t.criteriaPatientMgmt}</span>
                    <strong className="font-mono text-teal-600">{patientManagement}/15</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={patientManagement}
                    onChange={(e) => setPatientManagement(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                {/* 5. Ethics & Time */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t.criteriaEthics}</span>
                    <strong className="font-mono text-teal-600">{professionalEthics}/15</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={professionalEthics}
                    onChange={(e) => setProfessionalEthics(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>

              {/* Feedback Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الملاحظات والتوجيهات السريرية الإلزامية *
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder={t.supervisorNotesPlaceholder}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Revision Points (if Needs Correction) */}
              {evalStatus === 'needs_correction' && (
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-900 dark:text-orange-200">
                      {t.requiredRevisions}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddRevisionPoint}
                      className="text-xs text-orange-700 dark:text-orange-300 font-bold hover:underline"
                    >
                      + {t.addRevisionPoint}
                    </button>
                  </div>

                  {revisionPoints.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => handleUpdateRevisionPoint(i, e.target.value)}
                        placeholder={`نقطة التعديل #${i + 1} (مثال: إعادة صورة الأشعة أو تعديل الحواف)...`}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-900 outline-none"
                      />
                      {revisionPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRevisionPoint(i)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Digital Signature */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.supervisorSignature}
                </label>
                <input
                  type="text"
                  value={supervisorSignature}
                  onChange={(e) => setSupervisorSignature(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>

              {/* Submit Evaluation Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  حفظ واعتماد التقييم رسمياً
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
