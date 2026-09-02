import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Sun,
  Moon,
  School,
  Lock,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface University {
  id: string;
  nameAr: string;
  nameEn: string;
  shortNameAr: string;
  shortNameEn: string;
  logoText: string;
  countryAr: string;
  countryEn: string;
  cityAr: string;
  cityEn: string;
  facultyAr: string;
  facultyEn: string;
  isAvailable: boolean;
  badgeAr?: string;
  badgeEn?: string;
}

export const UNIVERSITIES: University[] = [
  {
    id: 'eiu',
    nameAr: 'الجامعة الإماراتية الدولية',
    nameEn: 'Emirates International University',
    shortNameAr: 'EIU',
    shortNameEn: 'EIU',
    logoText: 'EIU',
    countryAr: 'اليمن',
    countryEn: 'Yemen',
    cityAr: 'صنعاء',
    cityEn: 'Sanaa',
    facultyAr: 'كلية طب الأسنان — التدريب الإكلينيكي',
    facultyEn: 'Faculty of Dentistry — Clinical Training',
    isAvailable: true,
    badgeAr: 'المنظومة المعتمدة نشطة',
    badgeEn: 'Active System',
  },
  {
    id: 'sanaa_univ',
    nameAr: 'جامعة صنعاء',
    nameEn: 'Sanaa University',
    shortNameAr: 'جامعة صنعاء',
    shortNameEn: 'SU',
    logoText: 'SU',
    countryAr: 'اليمن',
    countryEn: 'Yemen',
    cityAr: 'صنعاء',
    cityEn: 'Sanaa',
    facultyAr: 'كلية طب الأسنان',
    facultyEn: 'Faculty of Dentistry',
    isAvailable: false,
    badgeAr: 'قريباً',
    badgeEn: 'Coming Soon',
  },
  {
    id: 'ust_univ',
    nameAr: 'جامعة العلوم والتكنولوجيا',
    nameEn: 'University of Science & Technology',
    shortNameAr: 'UST',
    shortNameEn: 'UST',
    logoText: 'UST',
    countryAr: 'اليمن',
    countryEn: 'Yemen',
    cityAr: 'صنعاء',
    cityEn: 'Sanaa',
    facultyAr: 'كلية طب الأسنان',
    facultyEn: 'Faculty of Dentistry',
    isAvailable: false,
    badgeAr: 'قريباً',
    badgeEn: 'Coming Soon',
  },
];

interface UniversitySelectionScreenProps {
  onSelectUniversity: (uni: University) => void;
}

export const UniversitySelectionScreen: React.FC<UniversitySelectionScreenProps> = ({
  onSelectUniversity,
}) => {
  const { language, toggleLanguage, theme, toggleTheme } = useApp();
  const [selectedId, setSelectedId] = useState<string>('eiu');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredUniversities = UNIVERSITIES.filter((uni) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      uni.nameAr.toLowerCase().includes(q) ||
      uni.nameEn.toLowerCase().includes(q) ||
      uni.shortNameEn.toLowerCase().includes(q)
    );
  });

  const selectedUni = UNIVERSITIES.find((u) => u.id === selectedId) || UNIVERSITIES[0];

  const handleProceed = () => {
    if (selectedUni && selectedUni.isAvailable) {
      onSelectUniversity(selectedUni);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">ClinDent</span>
              <span className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full border border-teal-500/20">
                PORTAL ACCESS
              </span>
            </div>
          </div>
        </div>

        {/* Language & Theme Controls */}
        <div className="flex items-center gap-2">
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
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl w-full mx-auto space-y-6">
        {/* Title & Prompt */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-bold border border-teal-500/20 mb-1">
            <School className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بوابة الكليات الطبية' : 'Dental Faculties Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'ar' ? 'حدد الجامعة التابع لها' : 'Select Your University'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {language === 'ar'
              ? 'اختر جامعتك للوصول إلى الخطة الإكلينيكية وبوابات تسجيل الدخول المعتمدة'
              : 'Choose your academic institution to access verified clinical portals'}
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث عن اسم الجامعة...' : 'Search university name...'}
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 shadow-xs text-slate-900 dark:text-white transition-all"
          />
        </div>

        {/* Universities List Card */}
        <div className="w-full space-y-2.5">
          {filteredUniversities.map((uni) => {
            const isSelected = selectedId === uni.id;
            const isAvailable = uni.isAvailable;

            return (
              <div
                key={uni.id}
                onClick={() => isAvailable && setSelectedId(uni.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer relative overflow-hidden ${
                  !isAvailable
                    ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-white dark:bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 shadow-md scale-[1.01]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Active Indicator Strip */}
                {isSelected && isAvailable && (
                  <div className="absolute start-0 top-0 bottom-0 w-1.5 bg-teal-500" />
                )}

                <div className="flex items-center gap-3.5 flex-1">
                  {/* University Logo / Badge Placeholder */}
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                      isSelected && isAvailable
                        ? 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-teal-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-mono leading-none">{uni.logoText}</span>
                  </div>

                  {/* Info */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {language === 'ar' ? uni.nameAr : uni.nameEn}
                      </h3>
                      {isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {language === 'ar' ? uni.badgeAr : uni.badgeEn}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {language === 'ar' ? uni.badgeAr : uni.badgeEn}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {language === 'ar' ? uni.facultyAr : uni.facultyEn}
                    </p>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      📍 {language === 'ar' ? `${uni.cityAr}، ${uni.countryAr}` : `${uni.cityEn}, ${uni.countryEn}`}
                    </span>
                  </div>
                </div>

                {/* Selection Radio / Action Icon */}
                <div className="shrink-0">
                  {isAvailable ? (
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="w-full pt-2">
          <button
            type="button"
            id="proceed-to-login-btn"
            onClick={handleProceed}
            disabled={!selectedUni || !selectedUni.isAvailable}
            className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-black text-sm shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {language === 'ar'
                ? `المتابعة إلى بوابات ${selectedUni.shortNameAr}`
                : `Proceed to ${selectedUni.shortNameEn} Portals`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {language === 'ar'
              ? '💡 سيتم تفعيل اعتمادات الجامعات الأخرى تباعاً بالتنسيق مع الكليات'
              : '💡 Additional universities will be onboarded gradually'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-3.5 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
        ClinDent • Dental Clinical Training & Education System
      </footer>
    </div>
  );
};
