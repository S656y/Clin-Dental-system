import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserAccount } from '../../types';
import {
  Moon,
  Sun,
  Globe,
  UserCheck,
  Stethoscope,
  Sparkles,
  ChevronDown,
  ShieldAlert,
  GraduationCap,
  Building2,
  FolderPlus,
  Users,
  LogOut,
  Lock,
  KeyRound,
  ShieldCheck,
  X,
  Crown,
} from 'lucide-react';

interface HeaderProps {
  onOpenCaseBuilder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCaseBuilder }) => {
  const {
    currentUser,
    users,
    switchUser,
    logout,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    t,
    verifyFounderPassword,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showFounderModal, setShowFounderModal] = useState(false);
  const [founderPasswordInput, setFounderPasswordInput] = useState('');
  const [founderError, setFounderError] = useState('');
  const [targetFounderId, setTargetFounderId] = useState<string | null>(null);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'founder':
        return <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'dean':
        return <Building2 className="w-4 h-4 text-emerald-500" />;
      case 'department_head':
        return <GraduationCap className="w-4 h-4 text-indigo-500" />;
      case 'supervisor':
        return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case 'teaching_assistant':
        return <Stethoscope className="w-4 h-4 text-cyan-500" />;
      case 'student':
      default:
        return <Sparkles className="w-4 h-4 text-teal-500" />;
    }
  };

  const handleUserSelect = (targetUser: UserAccount) => {
    setShowRoleDropdown(false);
    if (targetUser.id === currentUser.id) return;

    // If switching to founder from a non-founder role, require sovereign password
    if (targetUser.role === 'founder' && currentUser.role !== 'founder') {
      setTargetFounderId(targetUser.id);
      setFounderPasswordInput('');
      setFounderError('');
      setShowFounderModal(true);
      return;
    }

    switchUser(targetUser.id);
  };

  const handleVerifyFounderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyFounderPassword(founderPasswordInput)) {
      setFounderError(
        language === 'ar'
          ? 'كلمة المرور السيادية غير صحيحة. لا يمكن الدخول لحساب المؤسس.'
          : 'Invalid sovereign password. Access to Founder account denied.'
      );
      return;
    }

    if (targetFounderId) {
      switchUser(targetFounderId);
    }
    setShowFounderModal(false);
    setFounderPasswordInput('');
    setFounderError('');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2C7.5 2 4 4.5 4 8c0 3.5 1.5 6 3 9.5s2 4.5 5 4.5 3.5-1 5-4.5 3-6 3-9.5c0-3.5-3.5-6-8-6z" />
                <path d="M12 2v10" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                  ClinDent
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  PRO LMS
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.appTitle}
              </span>
            </div>
          </div>

          {/* Action Controls & Fast Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Case Builder for Students */}
            {currentUser.role === 'student' && onOpenCaseBuilder && (
              <button
                type="button"
                id="header-create-case-btn"
                onClick={onOpenCaseBuilder}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{t.createNewCase}</span>
              </button>
            )}

            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="role-switcher-btn"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  currentUser.role === 'founder'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black'
                    : 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400'
                }`}>
                  {t[currentUser.role]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showRoleDropdown && (
                <div
                  className="absolute start-0 sm:end-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1"
                  onMouseLeave={() => setShowRoleDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">
                        {t.switchRole}:
                      </span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold block truncate">
                        {currentUser.name} ({t[currentUser.role]})
                      </span>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 p-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleUserSelect(u)}
                        className={`w-full text-start p-2 rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          u.id === currentUser.id
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                            : u.role === 'founder'
                            ? 'hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="truncate text-start">
                            <div className="flex items-center gap-1.5">
                              <span className="block truncate text-xs font-bold">{u.name}</span>
                              {u.role === 'founder' && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-600 text-white font-mono">
                                  🔒 محمي
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t[u.role]} {u.department ? `• ${t[u.department]}` : ''}
                            </span>
                          </div>
                        </div>
                        {getRoleIcon(u.role)}
                      </button>
                    ))}
                  </div>

                  {/* Logout Option in dropdown */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Toggle (AR / EN) */}
            <button
              type="button"
              id="lang-toggle-btn"
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
              title="تبديل اللغة (Arabic / English)"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Direct Logout Button in Header */}
            <button
              type="button"
              id="header-logout-btn"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all cursor-pointer"
              title={t.logout}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sovereign Founder Verification Modal */}
      {showFounderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-200 dark:border-purple-900 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{language === 'ar' ? 'التحقق الأمني السيادي للمؤسس' : 'Sovereign Founder Verification'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'ar' ? 'حساب المؤسس محمي ببروتوكول عزل أمني' : 'Founder account is protected by sovereign isolation'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFounderModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-purple-50 dark:bg-purple-950/40 p-3.5 rounded-2xl border border-purple-200/80 dark:border-purple-800/60">
              {language === 'ar'
                ? 'لحماية المنظومة عند مشاركة الرابط مع الكادر أو الطلاب، يتطلب الدخول لصلاحيات المؤسس إدخال كلمة المرور الرئيسية الخاصة بك.'
                : 'To protect system integrity when sharing the link, entering Founder mode requires your master sovereign password.'}
            </p>

            {founderError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{founderError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyFounderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'كلمة مرور المؤسس السيادية' : 'Founder Sovereign Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    autoFocus
                    value={founderPasswordInput}
                    onChange={(e) => setFounderPasswordInput(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور السيادية...' : 'Enter sovereign password...'}
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'تأكيد الدخول السيادي' : 'Verify & Enter'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFounderModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

