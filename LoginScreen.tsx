import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  BookOpen,
  Stethoscope,
  GraduationCap,
  Crown,
  Building2,
  Lock,
  ArrowRight,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  School,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { University } from './UniversitySelectionScreen';

interface RolePortalConfig {
  id: UserRole;
  titleAr: string;
  titleEn: string;
  tagAr: string;
  tagEn: string;
  icon: React.ElementType;
  color: string;
  accentGradient: string;
  buttonBg: string;
  placeholderAr: string;
  placeholderEn: string;
}

const ROLE_PORTALS: RolePortalConfig[] = [
  {
    id: 'student',
    titleAr: 'بوابة الطلاب',
    titleEn: 'Student Portal',
    tagAr: 'سجل الحالات والكوتا',
    tagEn: 'Logbook & Quota',
    icon: GraduationCap,
    color: 'teal',
    accentGradient: 'from-teal-600 to-emerald-600',
    buttonBg: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25',
    placeholderAr: 'الرقم الجامعي للطالب أو البريد الأكاديمي',
    placeholderEn: 'Student ID or Academic Email',
  },
  {
    id: 'teaching_assistant',
    titleAr: 'قسم المعيدين',
    titleEn: 'Teaching Assistants',
    tagAr: 'مراجعة واعتماد خطوات المجموعة والمادة',
    tagEn: 'Group Step Approvals',
    icon: Stethoscope,
    color: 'cyan',
    accentGradient: 'from-cyan-600 to-teal-600',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/25',
    placeholderAr: 'البريد الأكاديمي للمعيد أو الرقم الوظيفي',
    placeholderEn: 'TA Academic Email or Staff ID',
  },
  {
    id: 'supervisor',
    titleAr: 'المشرفون الإكلينيكيون',
    titleEn: 'Clinical Supervisors',
    tagAr: 'لوج بوك الحالات المكتملة ورصد الدرجات',
    tagEn: 'Logbook & Clinical Grading',
    icon: Award,
    color: 'blue',
    accentGradient: 'from-blue-600 to-indigo-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25',
    placeholderAr: 'البريد الأكاديمي للمشرف أو الرقم الوظيفي',
    placeholderEn: 'Supervisor Email or Staff ID',
  },
  {
    id: 'department_head',
    titleAr: 'رؤساء الأقسام',
    titleEn: 'Department Heads',
    tagAr: 'الدرجات ومعايير الكوتا',
    tagEn: 'Grading & Quotas',
    icon: Award,
    color: 'amber',
    accentGradient: 'from-amber-600 to-orange-600',
    buttonBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25',
    placeholderAr: 'البريد الأكاديمي لرئيس القسم',
    placeholderEn: 'Department Head Email',
  },
  {
    id: 'dean',
    titleAr: 'عمادة الكلية',
    titleEn: 'College Dean',
    tagAr: 'مؤشرات الأداء الشاملة',
    tagEn: 'Executive Dashboard',
    icon: Building2,
    color: 'indigo',
    accentGradient: 'from-indigo-600 to-violet-600',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25',
    placeholderAr: 'البريد الأكاديمي للعمادة',
    placeholderEn: 'Dean Academic Email',
  },
  {
    id: 'founder',
    titleAr: 'مؤسس المنظومة',
    titleEn: 'System Founder',
    tagAr: 'الإدارة والحسابات المركزية',
    tagEn: 'Central Management',
    icon: Crown,
    color: 'purple',
    accentGradient: 'from-purple-600 to-pink-600',
    buttonBg: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25',
    placeholderAr: 'البريد السيادي للمؤسس',
    placeholderEn: 'Founder Sovereign Email',
  },
];

// Quick demo access accounts for testing
const DEMO_ACCOUNTS = [
  { role: 'student', level: 'level4', semester: 'first', labelAr: 'طالب (المستوى 4 - الترم الأول)', labelEn: 'Student (Level 4 - Term 1)', email: 'student.ahmed@clindent.edu', pass: 'demo123' },
  { role: 'student', level: 'level4', semester: 'second', labelAr: 'طالب (المستوى 4 - الترم الثاني)', labelEn: 'Student (Level 4 - Term 2)', email: 'student.ahmed@clindent.edu', pass: 'demo123' },
  { role: 'student', level: 'level5', semester: 'first', labelAr: 'طالب (المستوى 5 - الترم الأول)', labelEn: 'Student (Level 5 - Term 1)', email: 'student.ahmed@clindent.edu', pass: 'demo123' },
  { role: 'student', level: 'level5', semester: 'second', labelAr: 'طالب (المستوى 5 - الترم الثاني)', labelEn: 'Student (Level 5 - Term 2)', email: 'student.ahmed@clindent.edu', pass: 'demo123' },
  { role: 'teaching_assistant', labelAr: 'معيد (العلاج التحفظي - المجموعة A)', labelEn: 'TA (Operative - Group A)', email: 'ta.omar@clindent.edu', pass: 'demo123' },
  { role: 'supervisor', labelAr: 'مشرفة علاج تحفظي', labelEn: 'Operative Tutor', email: 'supervisor.sarah@clindent.edu', pass: 'demo123' },
  { role: 'department_head', labelAr: 'رئيس قسم الجذور', labelEn: 'Endo Head', email: 'head.endo@clindent.edu', pass: 'demo123' },
  { role: 'dean', labelAr: 'عميد الكلية', labelEn: 'Dean', email: 'dean@clindent.edu', pass: 'demo123' },
  { role: 'founder', labelAr: 'المؤسس (رئيسي)', labelEn: 'Founder', email: 'founder@clindent.edu', pass: 'founder2025' },
];

interface LoginScreenProps {
  selectedUniversity?: University | null;
  onChangeUniversity?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  selectedUniversity,
  onChangeUniversity,
}) => {
  const {
    login,
    studentActiveLevel,
    studentActiveSemester,
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    t,
    lockoutRemainingSeconds,
  } = useApp();

  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Student specific level & semester selection upon login
  const [studentLevel, setStudentLevel] = useState<'level4' | 'level5'>(studentActiveLevel || 'level5');
  const [studentSemester, setStudentSemester] = useState<'first' | 'second'>(studentActiveSemester || 'first');

  const currentPortal = ROLE_PORTALS.find((p) => p.id === activeRole) || ROLE_PORTALS[0];
  const CurrentIcon = currentPortal.icon;

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    setErrorMessage('');
    setIdentifier('');
    setPassword('');
  };

  const handleQuickFill = (
    email: string,
    pass: string,
    role: UserRole,
    lvl?: 'level4' | 'level5',
    sem?: 'first' | 'second'
  ) => {
    setActiveRole(role);
    setIdentifier(email);
    setPassword(pass);
    if (lvl) setStudentLevel(lvl);
    if (sem) setStudentSemester(sem);
    setErrorMessage('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (lockoutRemainingSeconds > 0) {
      setErrorMessage(
        language === 'ar'
          ? `تم تفعيل القفل الأمني المؤقت. يرجى الانتظار ${lockoutRemainingSeconds} ثانية.`
          : `Security lockout active. Please wait ${lockoutRemainingSeconds}s.`
      );
      return;
    }

    if (!identifier.trim()) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني أو الرقم الأكاديمي.'
          : 'Please enter your email or ID.'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage(
        language === 'ar' ? 'يرجى إدخال كلمة المرور.' : 'Please enter your password.'
      );
      return;
    }

    const result = login(
      identifier,
      password,
      activeRole === 'student' ? studentLevel : undefined,
      activeRole === 'student' ? studentSemester : undefined
    );
    if (!result.success) {
      setErrorMessage(result.message || (language === 'ar' ? 'بيانات الدخول غير صحيحة.' : 'Invalid credentials.'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Sleek Top Navbar */}
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">ClinDent</span>
              <span className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full border border-teal-500/20">
                CLINICAL PORTALS
              </span>
            </div>
          </div>
        </div>

        {/* Selected University Badge & Language/Theme */}
        <div className="flex items-center gap-2">
          {selectedUniversity && onChangeUniversity && (
            <button
              type="button"
              onClick={onChangeUniversity}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors cursor-pointer"
              title="تغيير الجامعة"
            >
              <School className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? selectedUniversity.nameAr : selectedUniversity.shortNameEn}</span>
              <span className="text-[10px] text-teal-500 font-normal">({language === 'ar' ? 'تغيير' : 'Change'})</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={t.theme}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl w-full mx-auto space-y-6">
        
        {/* Mobile change university bar */}
        {selectedUniversity && onChangeUniversity && (
          <div className="w-full sm:hidden flex items-center justify-between p-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-xs">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="font-bold text-teal-900 dark:text-teal-200 truncate max-w-[200px]">
                {language === 'ar' ? selectedUniversity.nameAr : selectedUniversity.nameEn}
              </span>
            </div>
            <button
              type="button"
              onClick={onChangeUniversity}
              className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
            >
              {language === 'ar' ? 'تغيير' : 'Change'}
            </button>
          </div>
        )}

        {/* Role Selector Tabs (Clean & Responsive) */}
        <div className="w-full space-y-3">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'ar' ? 'تسجيل الدخول الموحد' : 'Unified Clinical Portal'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedUniversity
                ? language === 'ar'
                  ? `بوابات ${selectedUniversity.nameAr} — اختر دورك الأكاديمي`
                  : `${selectedUniversity.nameEn} Portals — Select Role`
                : language === 'ar'
                ? 'اختر البوابة المخصصة لمتابعة المهام السريرية والأكاديمية'
                : 'Select your academic role to proceed'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {ROLE_PORTALS.map((portal) => {
              const Icon = portal.icon;
              const isSelected = portal.id === activeRole;

              return (
                <button
                  key={portal.id}
                  type="button"
                  id={`portal-tab-${portal.id}`}
                  onClick={() => handleRoleSelect(portal.id)}
                  className={`p-3 rounded-xl transition-all flex flex-col items-center text-center gap-1.5 cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">
                      {language === 'ar' ? portal.titleAr : portal.titleEn}
                    </span>
                    <span className="text-[10px] opacity-75 block font-medium">
                      {language === 'ar' ? portal.tagAr : portal.tagEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimalist Login Card */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div
            className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${currentPortal.accentGradient} opacity-15 blur-2xl pointer-events-none`}
          />

          {/* Form Header */}
          <div className="flex items-center gap-3 mb-6 relative">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${currentPortal.accentGradient} flex items-center justify-center text-white shadow-md`}>
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {language === 'ar' ? currentPortal.titleAr : currentPortal.titleEn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'أدخل بيانات الاعتماد للمتابعة' : 'Enter your credentials to continue'}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'البريد أو الرقم الأكاديمي' : 'Email or ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="login-identifier-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={language === 'ar' ? currentPortal.placeholderAr : currentPortal.placeholderEn}
                  className="w-full ps-9 pe-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-9 pe-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {lockoutRemainingSeconds > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {language === 'ar' ? `قفل أمني: انتظر ${lockoutRemainingSeconds} ثانية` : `Locked: wait ${lockoutRemainingSeconds}s`}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700"
                />
                <span>{language === 'ar' ? 'تذكر بياناتي' : 'Remember me'}</span>
              </label>

              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>{language === 'ar' ? 'دخول مشفر' : 'Encrypted'}</span>
              </span>
            </div>

            <button
              type="submit"
              id="portal-login-submit-btn"
              disabled={lockoutRemainingSeconds > 0}
              className={`w-full py-3 px-4 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm transition-all transform active:scale-[0.99] cursor-pointer ${currentPortal.buttonBg} ${
                lockoutRemainingSeconds > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{language === 'ar' ? 'دخول' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Accordion (Clean & Unobtrusive) */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
            >
              <span>{language === 'ar' ? '⚡ حسابات تجريبية للاختبار السريع' : '⚡ Quick Demo Accounts'}</span>
              {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoAccounts && (
              <div className="mt-2.5 space-y-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickFill(acc.email, acc.pass, acc.role as UserRole)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <span className="font-bold">{language === 'ar' ? acc.labelAr : acc.labelEn}</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">تعبئة فورية ←</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Clean Footer */}
      <footer className="w-full px-6 py-3 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
        ClinDent • Dental Clinical Training & Education System
      </footer>
    </div>
  );
};
