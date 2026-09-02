import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicalCase, UserAccount } from '../../types';
import {
  Building2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Activity,
  Zap,
  ArrowUpRight,
  Sparkles,
  Search,
} from 'lucide-react';

interface DeanDashboardProps {
  onSelectCase: (c: ClinicalCase) => void;
}

export const DeanDashboard: React.FC<DeanDashboardProps> = ({ onSelectCase }) => {
  const { cases, users, quotas, t } = useApp();

  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'moderate' | 'ontrack'>('all');
  const [searchStudent, setSearchStudent] = useState('');

  const students = users.filter((u) => u.role === 'student');
  const totalApproved = cases.filter((c) => c.status === 'approved').length;
  const totalSubmitted = cases.length;
  const approvalRate =
    totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 100;

  const totalRequiredUnits = quotas.reduce((acc, q) => acc + q.requiredUnits, 0);

  // Compute student risk profile
  const studentRiskProfiles = students.map((std) => {
    const stdApprovedCases = cases.filter(
      (c) => c.studentId === std.id && c.status === 'approved'
    );
    const completedUnits = stdApprovedCases.reduce(
      (acc, c) => acc + (c.quotaUnits || 1),
      0
    );
    const progressPct = Math.round((completedUnits / (totalRequiredUnits || 1)) * 100);

    let riskLevel: 'high' | 'moderate' | 'ontrack' = 'ontrack';
    let riskReason = 'إنجاز ممتاز ومعدل سريري متقدم';

    if (progressPct < 15) {
      riskLevel = 'high';
      riskReason = 'تأخر سريري حرج: نسبة إنجاز متدنية جداً تهدد متطلبات التخرج';
    } else if (progressPct < 40) {
      riskLevel = 'moderate';
      riskReason = 'تنبيه: سرعة استيفاء الكوتا أقل من المتوسط الفصلي المخطط';
    }

    return {
      student: std,
      completedUnits,
      progressPct,
      riskLevel,
      riskReason,
      approvedCount: stdApprovedCases.length,
      pendingCount: cases.filter(
        (c) => c.studentId === std.id && c.status === 'under_review'
      ).length,
    };
  });

  const filteredProfiles = studentRiskProfiles.filter((p) => {
    if (filterRisk !== 'all' && p.riskLevel !== filterRisk) return false;
    if (searchStudent.trim()) {
      const q = searchStudent.toLowerCase();
      if (!p.student.name.toLowerCase().includes(q) && !p.student.studentId?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const highRiskCount = studentRiskProfiles.filter((p) => p.riskLevel === 'high').length;
  const moderateRiskCount = studentRiskProfiles.filter((p) => p.riskLevel === 'moderate').length;

  return (
    <div className="space-y-6">
      {/* Executive Dean Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>عمادة كلية طب وجراحة الأسنان</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black">
              لوحة القيادة والرقابة التنفيذية للعميد 🏛️
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/80 mt-1 max-w-xl">
              إحصائيات النشاط السريري الشامل ومحرك الذكاء والإنذار المبكر للمخاطر الأكاديمية
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
            <div>
              <span className="text-2xl font-black font-mono block leading-none text-emerald-400">
                {approvalRate}%
              </span>
              <span className="text-[11px] text-emerald-200">معدل الاعتماد السريري</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">{t.clinicalThroughput}</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {totalSubmitted}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">حالة سريرية مسجلة وموثقة</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">الحالات المعتمدة للتخرج</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-emerald-600">
            {totalApproved}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">إجراء علاجي ناجح ومحتسب</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">حالات الإنذار الحرج</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-rose-600">
            {highRiskCount}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">طلاب بحاجة لتدخل وتوزيع حالات</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">هيئة التدريس والمشرفين</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-blue-600">
            {users.filter((u) => u.role === 'supervisor' || u.role === 'department_head').length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">أطباء واستشاريين سريريين</p>
        </div>
      </div>

      {/* Early Warning Risk Engine Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.earlyWarningTitle}
              </h3>
              <p className="text-xs text-slate-500">
                خوارزمية ذكية لاكتشاف الطلاب المتأخرين عن استيفاء كوتا التخرج وتوجيه التدخل الأكاديمي المبكر
              </p>
            </div>
          </div>

          {/* Risk Level Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="بحث عن طالب..."
                className="w-full pl-2.5 pr-8 py-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setFilterRisk('all')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                filterRisk === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              الكل ({studentRiskProfiles.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRisk('high')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                filterRisk === 'high'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700'
              }`}
            >
              حرجة ({highRiskCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterRisk('moderate')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                filterRisk === 'moderate'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 dark:bg-orange-950/50 text-orange-700'
              }`}
            >
              تنبيه ({moderateRiskCount})
            </button>
          </div>
        </div>

        {/* Student Risk Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((p) => {
            const isHigh = p.riskLevel === 'high';
            const isModerate = p.riskLevel === 'moderate';

            return (
              <div
                key={p.student.id}
                className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                  isHigh
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                    : isModerate
                    ? 'border-orange-300 dark:border-orange-900 bg-orange-50/40 dark:bg-orange-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.student.avatar}
                      alt={p.student.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {p.student.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        {p.student.studentId}
                      </span>
                    </div>
                  </div>

                  {isHigh && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                      إنذار حرج
                    </span>
                  )}
                  {isModerate && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
                      متابعة مطلوبة
                    </span>
                  )}
                  {p.riskLevel === 'ontrack' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      في المسار السليم
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500 font-sans">الكوتا المنجزة:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {p.completedUnits} / {totalRequiredUnits} ({p.progressPct}%)
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isHigh ? 'bg-rose-500' : isModerate ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${p.progressPct}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800 leading-tight">
                  {p.riskReason}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
