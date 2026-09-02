import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Users,
  UserCheck,
  Stethoscope,
  GraduationCap,
  Sparkles,
  Building2,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  ArrowRightLeft,
  Copy,
  Clock,
  Calendar,
  DoorClosed,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DentalDepartment, SubjectGroupConfig, UserAccount } from '../../types';
import { StudentSubjectGroupManager } from '../admin/StudentSubjectGroupManager';
import { STUDENT_CLINICAL_CURRICULUM } from '../../utils/studentCurriculumData';

export const SpecializedClinicalGroupsView: React.FC = () => {
  const { currentUser, users, subjectGroups, t, language } = useApp();

  const isFounder = currentUser.role === 'founder';

  const [activeTab, setActiveTab] = useState<'groups_manager' | 'staff_overview' | 'student_directory'>(
    'groups_manager'
  );

  // Selected level & department filters for quick stats
  const [selectedLevel, setSelectedLevel] = useState<'level4' | 'level5'>('level4');

  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);
  const teachingAssistants = useMemo(() => users.filter((u) => u.role === 'teaching_assistant'), [users]);
  const supervisors = useMemo(
    () => users.filter((u) => u.role === 'supervisor' || u.role === 'department_head'),
    [users]
  );

  // Stats calculation
  const totalGroupsCount = subjectGroups.length;
  const levelStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedLevel === 'level4') {
        return s.academicLevel === 'level4' || s.academicYear?.includes('الرابعة') || s.academicYear?.includes('4');
      }
      return s.academicLevel === 'level5' || s.academicYear?.includes('الخامسة') || s.academicYear?.includes('5');
    });
  }, [students, selectedLevel]);

  if (!isFounder) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
          منطقة سيادية محصورة للمؤسس
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          صلاحية إدارة وتوزيع المجموعات السريرية التخصصية وربط الطلاب بالمعيدين والمشرفين محصورة بحساب المؤسس (Sovereign Founder) فقط.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Banner / Department Title */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>لوحة الإدارة السيادية للمؤسس (Founder Sovereignty)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              إدارة وتوزيع المجموعات السريرية التخصصية
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              المنظومة المركزية الحصرية لتقسيم مجموعات العيادات التخصصية، توزيع الطلاب وربطهم بالمعيدين والمشرفين السريريين، وتحديد القاعات والمواعيد.
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <span className="text-2xl font-black font-mono text-emerald-300 block">
                {totalGroupsCount}
              </span>
              <span className="text-[10px] text-emerald-100 font-bold block mt-0.5">مجموعة سريرية</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <span className="text-2xl font-black font-mono text-teal-300 block">
                {teachingAssistants.length}
              </span>
              <span className="text-[10px] text-teal-100 font-bold block mt-0.5">معيد إكلينيكي</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center col-span-2 sm:col-span-1">
              <span className="text-2xl font-black font-mono text-cyan-300 block">
                {students.length}
              </span>
              <span className="text-[10px] text-cyan-100 font-bold block mt-0.5">طالب مسجل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('groups_manager')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'groups_manager'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>منظومة إدارة وتوزيع المجموعات السريرية (Board & Matrix)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staff_overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'staff_overview'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>خريطة تكليف المعيدين والمشرفين (Clinical Staff Map)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('student_directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'student_directory'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>دليل وسجل طلاب المجموعات ({students.length} طالب)</span>
        </button>
      </div>

      {/* Tab 1: Groups Manager Core Component */}
      {activeTab === 'groups_manager' && (
        <StudentSubjectGroupManager />
      )}

      {/* Tab 2: Clinical Staff & TA Allocations Map */}
      {activeTab === 'staff_overview' && (
        <div className="space-y-6">
          {/* Teaching Assistants Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    كادر المعيدين الإكلينيكيين والمجموعات المسندة إليهم
                  </h3>
                  <p className="text-xs text-slate-500">
                    قائمة المعيدين المكلفين بمتابعة وتوقيع خطوات اللوج بوك ومراجعة الحالات السريرية
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {teachingAssistants.length} معيد
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachingAssistants.map((ta) => {
                const assignedGroups = subjectGroups.filter(
                  (g) => g.assignedTaId === ta.id || g.code === ta.assignedGroupName || g.code === ta.clinicalGroup
                );
                return (
                  <div
                    key={ta.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={ta.avatar}
                        alt={ta.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-teal-500/30 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {ta.name}
                        </h4>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold block truncate">
                          {t[ta.assignedSubject || ta.department || ''] || ta.department || 'القسم الإكلينيكي'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {ta.email}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">
                        المجموعات السريرية المكلفة:
                      </span>
                      {assignedGroups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignedGroups.map((ag) => (
                            <span
                              key={ag.id}
                              className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[10px] font-bold"
                            >
                              {ag.code} ({ag.studentIds?.length || 0} طالب)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          المجموعة الافتراضية: {ta.assignedGroupName || ta.clinicalGroup || 'Group A'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supervisors Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    كادر أعضاء هيئة التدريس والمشرفين الإكلينيكيين
                  </h3>
                  <p className="text-xs text-slate-500">
                    الأساتذة والمشرفون المعتمدون لتقييم الحالات والدرجات النهائية
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {supervisors.length} مشرف
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supervisors.map((sup) => {
                const assignedGroups = subjectGroups.filter((g) => g.assignedSupervisorId === sup.id);
                return (
                  <div
                    key={sup.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sup.avatar}
                        alt={sup.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-purple-500/30 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {sup.name}
                        </h4>
                        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold block truncate">
                          {t[sup.department || ''] || sup.department || 'مشرف إكلينيكي'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {sup.email}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">
                        المجموعات المشرف عليها:
                      </span>
                      {assignedGroups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignedGroups.map((ag) => (
                            <span
                              key={ag.id}
                              className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold"
                            >
                              {ag.code} - {ag.nameAr}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          إشراف عام على القسم التخصصي
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: All Students Directory & Allocations */}
      {activeTab === 'student_directory' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                دليل الطلاب وتوزيع المجموعات السريرية
              </h3>
              <p className="text-xs text-slate-500">
                قائمة الطلاب مع تفاصيل المجموعة العامة والمجموعات التخصصية المسجلة
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">المستوى:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as 'level4' | 'level5')}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 outline-none"
              >
                <option value="level4">المستوى الرابع (Level 4)</option>
                <option value="level5">المستوى الخامس (Level 5)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">الطالب والرقم الجامعي</th>
                  <th className="py-3 px-4">المجموعة العامة</th>
                  <th className="py-3 px-4">مجموعات المواد التخصصية المسجلة</th>
                  <th className="py-3 px-4 text-center">عدد المواد الموزع بها</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {levelStudents.map((std) => {
                  const studentSubjectGroupList = subjectGroups.filter((g) =>
                    (g.studentIds || []).includes(std.id)
                  );
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={std.avatar}
                            alt={std.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {std.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {std.studentId || std.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {std.clinicalGroup || 'Group A'}
                      </td>
                      <td className="py-3 px-4">
                        {studentSubjectGroupList.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {studentSubjectGroupList.map((sg) => (
                              <span
                                key={sg.id}
                                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800"
                              >
                                {sg.subjectId ? (t[sg.subjectId] || sg.subjectId) : 'مادة'}: {sg.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            توزيع تلقائي عام ({std.clinicalGroup || 'Group A'})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            studentSubjectGroupList.length > 0
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {studentSubjectGroupList.length} مواد
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
    </div>
  );
};
