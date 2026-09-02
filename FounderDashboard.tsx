import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserAccount, DentalDepartment, TeachingAssistantAllocation } from '../../types';
import {
  ShieldAlert,
  UserPlus,
  Trash2,
  Edit,
  History,
  RotateCcw,
  Download,
  Upload,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Key,
  Database,
  X,
  FileSpreadsheet,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  ShieldCheck,
  KeyRound,
  Share2,
  Clock,
  Stethoscope,
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Plus,
  BookOpen,
  Award,
  Filter,
  Save,
} from 'lucide-react';

import { StudentSubjectGroupManager } from '../admin/StudentSubjectGroupManager';
import { ClinicalCase, DepartmentQuotaRequirement } from '../../types';

interface FounderDashboardProps {
  initialTab?: 'subject_groups' | 'accounts' | 'cases_quotas' | 'security' | 'audit' | 'system';
  onSelectCase?: (c: ClinicalCase) => void;
  onEditCase?: (c: ClinicalCase) => void;
}

export const FounderDashboard: React.FC<FounderDashboardProps> = ({
  initialTab = 'subject_groups',
  onSelectCase,
  onEditCase,
}) => {
  const {
    users,
    currentUser,
    cases,
    deleteCase,
    updateCase,
    quotas,
    updateQuota,
    deleteQuota,
    addQuota,
    auditLogs,
    taAllocations,
    addUser,
    updateUser,
    deleteUser,
    createTeachingAssistantAccount,
    addTaAllocation,
    deleteTaAllocation,
    resetToInitialData,
    clearAllDemoData,
    exportDataAsJson,
    importDataFromJson,
    t,
    language,
    updateFounderPassword,
    lockoutRemainingSeconds,
    failedLoginAttempts,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'subject_groups' | 'accounts' | 'cases_quotas' | 'security' | 'audit' | 'system'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [userSearch, setUserSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Cases & Quotas Tab State
  const [caseSearch, setCaseSearch] = useState('');
  const [caseDeptFilter, setCaseDeptFilter] = useState<string>('all');
  const [caseStatusFilter, setCaseStatusFilter] = useState<string>('all');
  const [casesSubTab, setCasesSubTab] = useState<'cases' | 'quotas'>('cases');

  // Quota Edit/Add State in Founder Tab
  const [editingQuota, setEditingQuota] = useState<DepartmentQuotaRequirement | null>(null);
  const [isAddingQuota, setIsAddingQuota] = useState(false);
  const [quotaFormDept, setQuotaFormDept] = useState<DentalDepartment>('operative');
  const [quotaFormUnits, setQuotaFormUnits] = useState(10);
  const [quotaFormDescAr, setQuotaFormDescAr] = useState('');

  // TA View Filters
  const [taFilterLevel, setTaFilterLevel] = useState<string>('all');
  const [taFilterSemester, setTaFilterSemester] = useState<string>('all');
  const [taFilterSubject, setTaFilterSubject] = useState<string>('all');
  const [taSearch, setTaSearch] = useState<string>('');

  // Sovereign Password Change State
  const [currentMasterPass, setCurrentMasterPass] = useState('');
  const [newMasterPass, setNewMasterPass] = useState('');
  const [confirmMasterPass, setConfirmMasterPass] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordInputs, setShowPasswordInputs] = useState(false);

  // Standard User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('123');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formDept, setFormDept] = useState<DentalDepartment>('operative');
  const [formStudentId, setFormStudentId] = useState('');
  const [formStaffId, setFormStaffId] = useState('');
  const [formAcademicLevel, setFormAcademicLevel] = useState<'level4' | 'level5'>('level4');
  const [formSemester, setFormSemester] = useState<'first' | 'second'>('first');
  const [formYear, setFormYear] = useState('السنة السريرية الرابعة (Level 4)');
  const [formGroup, setFormGroup] = useState('Group A1');

  const handleUpdateMasterPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg(null);

    if (newMasterPass !== confirmMasterPass) {
      setPasswordStatusMsg({
        type: 'error',
        text: language === 'ar' ? 'كلمة المرور الجديدة غير متطابقة مع التأكيد' : 'New password does not match confirmation',
      });
      return;
    }

    const res = updateFounderPassword(currentMasterPass, newMasterPass);
    if (res.success) {
      setPasswordStatusMsg({ type: 'success', text: res.message });
      setCurrentMasterPass('');
      setNewMasterPass('');
      setConfirmMasterPass('');
    } else {
      setPasswordStatusMsg({ type: 'error', text: res.message });
    }
  };

  const generateRandomPassword = (targetSetter: (p: string) => void) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    targetSetter(pass);
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyUserCredentials = (u: UserAccount) => {
    const credText = `بوابة ClinDent السريرية:\nالاسم: ${u.name}\nالبريد/المعرف: ${u.email}\nكلمة المرور: ${u.password || (u.role === 'founder' ? 'admin' : '123')}\nالدور: ${u.role}`;
    navigator.clipboard.writeText(credText);
    setCopiedUserId(u.id);
    setTimeout(() => setCopiedUserId(null), 2500);
  };

  const openNewUserModal = (defaultRole: UserRole = 'student', defaultLevel: 'level4' | 'level5' = 'level4') => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('123');
    setFormRole(defaultRole);
    setFormDept('operative');
    setFormStaffId(`STAFF-${Math.floor(100 + Math.random() * 900)}`);
    setFormStudentId(`DENT-2026-${Math.floor(100 + Math.random() * 900)}`);
    setFormAcademicLevel(defaultLevel);
    setFormSemester('first');
    setFormYear(defaultLevel === 'level4' ? 'السنة السريرية الرابعة (Level 4)' : 'السنة السريرية الخامسة (Level 5)');
    setFormGroup('Group A1');
    setShowAddUserModal(true);
  };

  const openEditUserModal = (user: UserAccount) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(user.password || (user.role === 'founder' ? 'admin' : '123'));
    setFormRole(user.role);
    setFormDept(user.department || 'operative');
    setFormStudentId(user.studentId || '');
    setFormStaffId(user.staffId || '');
    
    const derivedLevel: 'level4' | 'level5' =
      user.academicLevel === 'level4' ||
      user.academicYear?.includes('الرابعة') ||
      user.academicYear?.includes('4')
        ? 'level4'
        : 'level5';
    setFormAcademicLevel(derivedLevel);
    setFormSemester(user.semester || 'first');
    setFormYear(
      user.academicYear ||
        (derivedLevel === 'level4' ? 'السنة السريرية الرابعة (Level 4)' : 'السنة السريرية الخامسة (Level 5)')
    );
    setFormGroup(user.clinicalGroup || 'Group A1');
    setShowAddUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const isStudent = formRole === 'student';
    const computedYear =
      formAcademicLevel === 'level4'
        ? 'السنة السريرية الرابعة (Level 4)'
        : 'السنة السريرية الخامسة (Level 5)';

    if (editingUserId) {
      updateUser(editingUserId, {
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        department: isStudent ? undefined : formDept,
        studentId: isStudent ? formStudentId : undefined,
        staffId: !isStudent && formRole !== 'founder' ? formStaffId : undefined,
        academicLevel: isStudent ? formAcademicLevel : undefined,
        semester: isStudent ? formSemester : undefined,
        academicYear: isStudent ? computedYear : undefined,
        clinicalGroup: isStudent ? formGroup : undefined,
      });
    } else {
      addUser({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        department: isStudent ? undefined : formDept,
        studentId: isStudent ? formStudentId : undefined,
        staffId: !isStudent && formRole !== 'founder' ? formStaffId : undefined,
        academicLevel: isStudent ? formAcademicLevel : undefined,
        semester: isStudent ? formSemester : undefined,
        academicYear: isStudent ? computedYear : undefined,
        clinicalGroup: isStudent ? formGroup : undefined,
        avatar:
          formRole === 'teaching_assistant'
            ? 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200'
            : formRole === 'supervisor'
            ? 'https://images.unsplash.com/photo-1594824813597-392942468305?auto=format&fit=crop&q=80&w=200'
            : formRole === 'student'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
            : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
        isDemo: false,
      });
    }
    setShowAddUserModal(false);
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studentId && u.studentId.toLowerCase().includes(q)) ||
        (u.staffId && u.staffId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const taUsersList = users.filter((u) => u.role === 'teaching_assistant');

  const filteredTaAllocations = taAllocations.filter((alloc) => {
    if (taFilterLevel !== 'all' && alloc.academicLevel !== taFilterLevel) return false;
    if (taFilterSemester !== 'all' && alloc.semester !== taFilterSemester) return false;
    if (taFilterSubject !== 'all' && alloc.subjectId !== taFilterSubject) return false;
    if (taSearch.trim()) {
      const q = taSearch.toLowerCase();
      return (
        alloc.taName.toLowerCase().includes(q) ||
        alloc.subjectNameAr.toLowerCase().includes(q) ||
        alloc.groupCode.toLowerCase().includes(q) ||
        alloc.clinicRoom.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataFromJson(content);
      }
    };
    reader.readAsText(file);
  };

  const getRoleBadgeLabel = (role: UserRole) => {
    switch (role) {
      case 'founder':
        return t.founderBadge;
      case 'dean':
        return t.deanBadge;
      case 'department_head':
        return t.deptHeadBadge;
      case 'supervisor':
        return t.supervisorBadge;
      case 'teaching_assistant':
        return '🩺 قسم المعيدين الإكلينيكيين (TA)';
      case 'student':
      default:
        return t.studentBadge;
    }
  };

  const getDepartmentLabel = (dept?: DentalDepartment) => {
    if (!dept) return 'عام / غير محدد';
    switch (dept) {
      case 'operative':
        return 'العلاج التحفظي (Operative)';
      case 'endodontics':
        return 'علاج الجذور (Endodontics)';
      case 'prosthodontics':
        return 'الاستعاضة الثابتة والمتحركة (Prostho)';
      case 'periodontics':
        return 'طب وجراحة اللثة (Periodontics)';
      case 'pedodontics':
        return 'طب أسنان الأطفال (Pedodontics)';
      case 'oral_surgery':
        return 'جراحة الفم والخلع (Oral Surgery)';
      case 'orthodontics':
        return 'تقويم الأسنان (Orthodontics)';
      default:
        return dept;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Sovereign Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>لوحة تحكم وإدارة النظام الأكاديمي الشاملة 👑</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black">
              إدارة وتوزيع المجموعات السريرية، المشرفين والحسابات
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              المهمة الشاملة: إنشاء المجموعات السريرية، تكليف المعيدين والمشرفين، تسكين وتوزيع الطلاب، وإدارة الحسابات والرقابة
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Student Account Creation */}
            <button
              type="button"
              onClick={() => openNewUserModal('student', 'level4')}
              className="px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs md:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>+ إضافة حساب طالب جديد (م4 / م5)</span>
            </button>

            {/* General User Creation */}
            <button
              type="button"
              onClick={() => openNewUserModal('teaching_assistant', 'level4')}
              className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs md:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ إضافة كادر / مستخدم عام</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-1.5 gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('subject_groups')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'subject_groups'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>إدارة وتوزيع المجموعات السريرية التخصصية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>كافة الحسابات ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cases_quotas')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'cases_quotas'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>إدارة الحالات والكوتا السريرية ({cases.length}) 👑</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>الدرع الأمني وكلمة المرور 🔒</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل التدقيق الرقمي ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>قاعدة البيانات والنسخ</span>
        </button>
      </div>

      {/* Tab 0: SUBJECT GROUPS & SUPERVISOR ALLOCATION MANAGEMENT */}
      {activeTab === 'subject_groups' && (
        <StudentSubjectGroupManager />
      )}

      {/* Tab 1: All User Accounts Management */}
      {activeTab === 'accounts' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4">
          <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  قائمة جميع الحسابات وبيانات تسجيل الدخول
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                تصفح كافة المستخدمين، نسخ بيانات الاعتماد، أو إنشاء وتعديل الحسابات مع كلمات المرور المباشرة
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openNewUserModal('student', 'level4')}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                + إضافة حساب طالب (م4 / م5)
              </button>
              <button
                type="button"
                onClick={() => openNewUserModal('teaching_assistant', 'level4')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + إضافة كادر / موظف
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ابحث بالاسم، البريد الإلكتروني، الرقم الجامعي أو الوظيفي..."
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
              >
                <option value="all">جميع الأدوار والصلاحيات</option>
                <option value="student">{t.studentBadge} (طلاب المستوى الرابع والخامس)</option>
                <option value="teaching_assistant">🩺 قسم المعيدين (Teaching Assistant)</option>
                <option value="supervisor">{t.supervisorBadge}</option>
                <option value="department_head">{t.deptHeadBadge}</option>
                <option value="dean">{t.deanBadge}</option>
                <option value="founder">{t.founderBadge}</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">البريد الإلكتروني الجامعي</th>
                  <th className="p-3.5">كلمة المرور للحساب</th>
                  <th className="p-3.5">الدور والصلاحية</th>
                  <th className="p-3.5">الرقم التعريفي</th>
                  <th className="p-3.5">التخصص / المستوى الدراسي</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const isPasswordVisible = visiblePasswords[u.id];
                  const displayPassword = u.password || (u.role === 'founder' ? 'admin' : '123');
                  const isCopied = copiedUserId === u.id;
                  const isLevel4 =
                    u.academicLevel === 'level4' ||
                    u.academicYear?.includes('الرابعة') ||
                    u.academicYear?.includes('4');

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        u.role === 'founder' ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <strong className="block font-bold text-slate-900 dark:text-slate-100">{u.name}</strong>
                            {u.isDemo && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400">حساب تجريبي (Demo)</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>

                      <td className="p-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                            {isPasswordVisible ? displayPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.role === 'founder'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : u.role === 'teaching_assistant'
                              ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                              : u.role === 'dean'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : u.role === 'supervisor'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}
                        >
                          {getRoleBadgeLabel(u.role)}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {u.studentId || u.staffId || '—'}
                      </td>

                      <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-400">
                        {u.role === 'student' ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                isLevel4
                                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                              }`}
                            >
                              {isLevel4 ? (
                                <>
                                  <BookOpen className="w-3 h-3 text-teal-600" />
                                  <span>المستوى الرابع (م4)</span>
                                </>
                              ) : (
                                <>
                                  <GraduationCap className="w-3 h-3 text-indigo-600" />
                                  <span>المستوى الخامس (م5)</span>
                                </>
                              )}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {u.semester === 'second' ? 'الترم 2' : 'الترم 1'}
                            </span>
                            {u.clinicalGroup && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                {u.clinicalGroup}
                              </span>
                            )}
                          </div>
                        ) : u.assignedSubject ? (
                          getDepartmentLabel(u.assignedSubject as DentalDepartment)
                        ) : u.department ? (
                          getDepartmentLabel(u.department)
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyUserCredentials(u)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="نسخ بيانات الدخول"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditUserModal(u)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            title="تعديل الحساب"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {u.role !== 'founder' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من رغبتك في حذف حساب [${u.name}]؟`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="حذف الحساب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Sovereign Cases & Quotas Management */}
      {activeTab === 'cases_quotas' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي الحالات بالمنظومة</span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">{cases.length}</span>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 shadow-xs">
              <span className="text-xs text-teal-700 dark:text-teal-300 font-bold block mb-1">حالات معتمدة (Approved)</span>
              <span className="text-2xl font-black font-mono text-teal-700 dark:text-teal-300">
                {cases.filter((c) => c.status === 'approved').length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-xs">
              <span className="text-xs text-amber-700 dark:text-amber-300 font-bold block mb-1">قيد المراجعة والتقييم</span>
              <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">
                {cases.filter((c) => c.status === 'under_review').length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold block mb-1">لوائح الكوتا المعرفة</span>
              <span className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300">{quotas.length} أقسام</span>
            </div>
          </div>

          {/* Sub-Tabs Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setCasesSubTab('cases')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                casesSubTab === 'cases'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              📋 كافة الحالات السريرية في الجامعة ({cases.length})
            </button>
            <button
              type="button"
              onClick={() => setCasesSubTab('quotas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                casesSubTab === 'quotas'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ⚙️ لوائح ومتطلبات الكوتا لكافة الأقسام ({quotas.length})
            </button>
          </div>

          {/* SubTab 1: All Clinical Cases */}
          {casesSubTab === 'cases' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4">
              <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>الرقابة والتعديل والحذف السيادي لكافة الحالات السريرية</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    يمكن للمؤسس تعديل بيانات أي حالة، تغيير حالتها أو درجاتها، وفتحها أو حذفها نهائياً.
                  </p>
                </div>

                <div className="text-xs font-mono font-bold text-slate-500">
                  المعروض: {cases.filter((c) => {
                    if (caseDeptFilter !== 'all' && c.department !== caseDeptFilter) return false;
                    if (caseStatusFilter !== 'all' && c.status !== caseStatusFilter) return false;
                    if (caseSearch.trim()) {
                      const q = caseSearch.toLowerCase();
                      return (
                        c.patient?.name?.toLowerCase().includes(q) ||
                        c.patient?.fileNumber?.toLowerCase().includes(q) ||
                        c.studentName?.toLowerCase().includes(q) ||
                        c.caseNumber?.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  }).length} من {cases.length}
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    placeholder="بحث برقم الحالة، اسم المريض، اسم الطالب..."
                    className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                <div>
                  <select
                    value={caseDeptFilter}
                    onChange={(e) => setCaseDeptFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                  >
                    <option value="all">جميع الأقسام والتخصصات</option>
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
                  <select
                    value={caseStatusFilter}
                    onChange={(e) => setCaseStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                  >
                    <option value="all">جميع حالات الاعتماد</option>
                    <option value="approved">معتمدة (Approved)</option>
                    <option value="under_review">قيد المراجعة (Under Review)</option>
                    <option value="needs_correction">مطلوب تصويب (Needs Correction)</option>
                    <option value="rejected">مرفوضة (Rejected)</option>
                    <option value="draft">مسودة (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Cases Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">الحالة والمريض</th>
                      <th className="p-3.5">الطالب المنفذ</th>
                      <th className="p-3.5">القسم والإجراء</th>
                      <th className="p-3.5">الدرجة والنقاط</th>
                      <th className="p-3.5">حالة الاعتماد</th>
                      <th className="p-3.5 text-center">الإجراءات السيادية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cases
                      .filter((c) => {
                        if (caseDeptFilter !== 'all' && c.department !== caseDeptFilter) return false;
                        if (caseStatusFilter !== 'all' && c.status !== caseStatusFilter) return false;
                        if (caseSearch.trim()) {
                          const q = caseSearch.toLowerCase();
                          return (
                            c.patient?.name?.toLowerCase().includes(q) ||
                            c.patient?.fileNumber?.toLowerCase().includes(q) ||
                            c.studentName?.toLowerCase().includes(q) ||
                            c.caseNumber?.toLowerCase().includes(q) ||
                            c.patient?.chiefComplaint?.toLowerCase().includes(q) ||
                            (c.diagnosis && c.diagnosis.toLowerCase().includes(q))
                          );
                        }
                        return true;
                      })
                      .map((c) => {
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3.5">
                              <div>
                                <span className="font-mono font-bold text-teal-600 dark:text-teal-400 block">
                                  {c.caseNumber}
                                </span>
                                <strong className="text-slate-900 dark:text-slate-100 font-bold">{c.patient?.name || 'مريض غير مسجل'}</strong>
                                <span className="text-[10px] text-slate-400 block font-mono">ملف: {c.patient?.fileNumber || '—'}</span>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div>
                                <strong className="text-slate-900 dark:text-slate-100 block">{c.studentName}</strong>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {c.academicLevel === 'level4' ? 'مستوى رابع (م4)' : 'مستوى خامس (م5)'}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 inline-block mb-1">
                                  {t[c.department] || c.department}
                                </span>
                                <span className="block text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                                  {c.patient?.chiefComplaint || c.diagnosis || c.title}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5 font-mono">
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                  {c.evaluation?.grade !== undefined ? `${c.evaluation.grade}/100` : 'غير مقيم'}
                                </span>
                                <span className="text-[10px] text-teal-600 dark:text-teal-400">
                                  {c.quotaUnits || 1} وحدة كوتا
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <select
                                value={c.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as ClinicalCase['status'];
                                  updateCase(c.id, {
                                    status: newStatus,
                                    evaluation: {
                                      grade: c.evaluation?.grade ?? 85,
                                      criteria: c.evaluation?.criteria ?? {
                                        infectionControl: 18,
                                        anesthesiaCavityPrep: 22,
                                        restorationObturation: 22,
                                        patientManagement: 13,
                                        professionalEthics: 13,
                                      },
                                      feedbackNotes: c.evaluation?.feedbackNotes || 'تم تغيير حالة الاعتماد بتوجيه سيادي من المؤسس',
                                      evaluatedAt: new Date().toISOString(),
                                    },
                                  });
                                }}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl outline-none cursor-pointer border ${
                                  c.status === 'approved'
                                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300'
                                    : c.status === 'under_review'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
                                    : c.status === 'needs_correction'
                                    ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-300'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300'
                                }`}
                              >
                                <option value="approved">معتمدة (Approved)</option>
                                <option value="under_review">قيد المراجعة</option>
                                <option value="needs_correction">مطلوب تصويب</option>
                                <option value="rejected">مرفوضة</option>
                                <option value="draft">مسودة</option>
                              </select>
                            </td>

                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onSelectCase?.(c)}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-[11px] font-bold flex items-center gap-1"
                                  title="فتح ملف الحالة وتعديلها"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>عرض / تعديل</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onEditCase?.(c)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                  title="تعديل بالمعالج"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من الحذف النهائي للحالة [${c.caseNumber}] للمريض [${c.patient?.name || ''}]؟`)) {
                                      deleteCase(c.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100"
                                  title="حذف نهائي للحالة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab 2: Department Quotas Manager */}
          {casesSubTab === 'quotas' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>إدارة وتعديل وحذف لوائح الكوتا السريرية للأقسام الأكاديمية</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    تعديل عدد الحالات المطلوب إنجازها لكل قسم، والمواصفات السريرية المعتمدة
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingQuota(null);
                    setQuotaFormDept('operative');
                    setQuotaFormUnits(10);
                    setQuotaFormDescAr('');
                    setIsAddingQuota(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة متطلبات كوتا لقسم جديد</span>
                </button>
              </div>

              {/* Quota Modal / Form in Founder view */}
              {(editingQuota || isAddingQuota) && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const qData: DepartmentQuotaRequirement = {
                      department: quotaFormDept,
                      departmentNameAr: t[quotaFormDept] || quotaFormDept,
                      departmentNameEn: quotaFormDept,
                      requiredUnits: Number(quotaFormUnits) || 1,
                      descriptionAr: quotaFormDescAr.trim() || `متطلبات إنجاز حالات قسم ${t[quotaFormDept]} السريرية`,
                      descriptionEn: `Requirements for ${quotaFormDept}`,
                    };
                    if (editingQuota) {
                      updateQuota(editingQuota.department, qData);
                    } else {
                      addQuota(qData);
                    }
                    setEditingQuota(null);
                    setIsAddingQuota(false);
                  }}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-amber-500/30 space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Edit className="w-4 h-4 text-amber-600" />
                      <span>{editingQuota ? `تعديل كوتا (${editingQuota.departmentNameAr})` : 'إضافة متطلبات كوتا جديدة'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuota(null);
                        setIsAddingQuota(false);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">القسم السريري</label>
                      <select
                        value={quotaFormDept}
                        onChange={(e) => setQuotaFormDept(e.target.value as DentalDepartment)}
                        disabled={!!editingQuota}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-bold"
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
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">عدد الحالات الإلزامية المطلوبة</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={quotaFormUnits}
                        onChange={(e) => setQuotaFormUnits(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الوصف والشروط السريرية</label>
                      <input
                        type="text"
                        value={quotaFormDescAr}
                        onChange={(e) => setQuotaFormDescAr(e.target.value)}
                        placeholder="مثال: حشوات كمبوزيت وأملغم صنف أول وثانٍ"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuota(null);
                        setIsAddingQuota(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ متطلبات الكوتا</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quotas.map((q) => (
                  <div
                    key={q.department}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t[q.department] || q.departmentNameAr}</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-xl">
                          {q.requiredUnits} حالة معتمدة
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuota(q);
                            setQuotaFormDept(q.department);
                            setQuotaFormUnits(q.requiredUnits);
                            setQuotaFormDescAr(q.descriptionAr);
                            setIsAddingQuota(false);
                          }}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 hover:text-amber-600"
                          title="تعديل متطلبات الكوتا"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف متطلبات كوتا قسم [${q.department}]؟`)) {
                              deleteQuota(q.department);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-600"
                          title="حذف متطلبات الكوتا"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {q.descriptionAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Security & Password Shield */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  إدارة كلمة المرور السيادية للمؤسس وحماية النظام
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  حساب المؤسس يتمتع بصلاحيات الإشراف الشاملة وتغيير كلمة المرور يؤمن المنظومة ضد أي وصول غير مصرح به.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateMasterPassword} className="space-y-4 max-w-md text-xs">
              <div>
                <label className="block font-bold mb-1">كلمة المرور الحالية للمؤسس</label>
                <input
                  type="password"
                  required
                  value={currentMasterPass}
                  onChange={(e) => setCurrentMasterPass(e.target.value)}
                  placeholder="أدخل كلمة مرورك الحالية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={newMasterPass}
                  onChange={(e) => setNewMasterPass(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة القوية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={confirmMasterPass}
                  onChange={(e) => setConfirmMasterPass(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور الجديدة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono"
                />
              </div>

              {passwordStatusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    passwordStatusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                  }`}
                >
                  {passwordStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordStatusMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>حفظ وتحديث كلمة المرور</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Digital Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4">
          <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  سجل التدقيق الرقمي غير القابل للتعديل (Audit Trail)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                توثيق كامل لكافة عمليات إنشاء واعتماد الحالات، تسجيل خطوات العلاج، وتعديل المستخدمين
              </p>
            </div>
          </div>

          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="ابحث في سجلات التدقيق بالإجراء، اسم المستخدم، أو التفاصيل..."
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-[500px] overflow-y-auto">
            {filteredAuditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{log.actorName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                      {log.actorRole}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-mono text-[10px] font-bold">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{log.details}</p>
                </div>

                <div className="text-[11px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System Backup & Factory Reset */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              تصدير واستيراد قاعدة بيانات المنظومة (Backup & Restore)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-600" />
                  تصدير قاعدة بيانات المنصة بالكامل (Export Backup)
                </h4>
                <p className="text-xs text-slate-500">
                  تنزيل ملف JSON يحتوي على كافة الحالات الإكلينيكية، تكليفات قسم المعيدين، وبيانات التدقيق.
                </p>
                <button
                  type="button"
                  onClick={exportDataAsJson}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  تنزيل ملف النسخة الاحتياطية (.json)
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  استيراد واستعادة البيانات (Restore Backup)
                </h4>
                <p className="text-xs text-slate-500">
                  رفع واسترجاع نسخة احتياطية سابقة إلى النظام واستعادة السجلات.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  اختر ملف النسخة الاحتياطية لاستيراده
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              منطقة العمليات الحساسة وإعادة تعيين النظام (Danger Zone)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <strong className="text-xs text-slate-900 dark:text-slate-100 block">
                  حذف الحسابات والبيانات التجريبية
                </strong>
                <p className="text-xs text-slate-500">
                  حذف كافة الحسابات والحالات التجريبية والبدء ببيانات نظيفة كلياً.
                </p>
                <button
                  type="button"
                  onClick={clearAllDemoData}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold hover:bg-rose-200 transition-colors"
                >
                  تنفيذ حذف الحسابات التجريبية
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <strong className="text-xs text-slate-900 dark:text-slate-100 block">
                  {t.resetSystem}
                </strong>
                <p className="text-xs text-slate-500">
                  إعادة تعيين كافة السجلات والحالات والكوتا للحالة الافتراضية الأولية.
                </p>
                <button
                  type="button"
                  onClick={resetToInitialData}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  إعادة ضبط المصنع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standard Add / Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                {editingUserId ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: د. فيصل البقمي"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">البريد الإلكتروني الجامعي *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="مثال: f.albugami@clindent.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono"
                />
              </div>

              {/* Password Setting & Generator */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-teal-600" />
                    <span>كلمة المرور للحساب *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => generateRandomPassword(setFormPassword)}
                    className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>توليد كلمة مرور عشوائية</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور للمستخدم"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold mb-1">الدور والصلاحية *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-bold"
                  >
                    <option value="student">{t.studentBadge} (حساب طالب إكلينيكي)</option>
                    <option value="teaching_assistant">🩺 قسم المعيدين (Teaching Assistant)</option>
                    <option value="supervisor">🎖️ {t.supervisorBadge}</option>
                    <option value="department_head">🏢 {t.deptHeadBadge}</option>
                    <option value="dean">🎓 {t.deanBadge}</option>
                    <option value="founder">👑 {t.founderBadge}</option>
                  </select>
                </div>

                {/* If Student Role is Selected: Dedicated Academic Settings */}
                {formRole === 'student' && (
                  <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-teal-100 dark:border-teal-900 pb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                        <GraduationCap className="w-4 h-4 text-teal-600" />
                        <span>تخصيص المستوى والبيانات الأكاديمية للطالب *</span>
                      </span>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md">
                        تحديد الخطة والكوتا
                      </span>
                    </div>

                    {/* Academic Level Selector (Level 4 vs Level 5) */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        المستوى الدراسي الأكاديمي للطالب *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Level 4 Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setFormAcademicLevel('level4');
                            setFormYear('السنة السريرية الرابعة (Level 4)');
                          }}
                          className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                            formAcademicLevel === 'level4'
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-black text-xs flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>المستوى الرابع (Level 4)</span>
                            </span>
                            {formAcademicLevel === 'level4' && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <p
                            className={`text-[10px] leading-tight ${
                              formAcademicLevel === 'level4' ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            السنة السريرية الرابعة (7 مواد سريرية معتمدة)
                          </p>
                        </button>

                        {/* Level 5 Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setFormAcademicLevel('level5');
                            setFormYear('السنة السريرية الخامسة (Level 5)');
                          }}
                          className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                            formAcademicLevel === 'level5'
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-black text-xs flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>المستوى الخامس (Level 5)</span>
                            </span>
                            {formAcademicLevel === 'level5' && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <p
                            className={`text-[10px] leading-tight ${
                              formAcademicLevel === 'level5' ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            السنة السريرية الخامسة (سنة التخرج والحالات الشاملة)
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Semester Selection & University Student ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          الفصل الدراسي النشط *
                        </label>
                        <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setFormSemester('first')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              formSemester === 'first'
                                ? 'bg-teal-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            الترم الأول
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormSemester('second')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              formSemester === 'second'
                                ? 'bg-teal-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            الترم الثاني
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          الرقم الجامعي الأكاديمي للطالب *
                        </label>
                        <input
                          type="text"
                          required
                          value={formStudentId}
                          onChange={(e) => setFormStudentId(e.target.value)}
                          placeholder="DENT-2026-..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If Faculty / Staff Role is Selected */}
                {formRole !== 'student' && formRole !== 'founder' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">القسم والتخصص الأكاديمي *</label>
                        <select
                          value={formDept}
                          onChange={(e) => setFormDept(e.target.value as DentalDepartment)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-bold"
                        >
                          <option value="operative">العلاج التحفظي وحشو الأسنان</option>
                          <option value="endodontics">علاج الجذور وعصب الأسنان</option>
                          <option value="prosthodontics">الاستعاضة السنية والتركيبات</option>
                          <option value="periodontics">طب وجراحة اللثة</option>
                          <option value="pedodontics">طب أسنان الأطفال</option>
                          <option value="oral_surgery">جراحة الفم والوجه والفكين</option>
                          <option value="orthodontics">تقويم الأسنان والفكين</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">الرقم الوظيفي / الكود الأكاديمي *</label>
                        <input
                          type="text"
                          required
                          value={formStaffId}
                          onChange={(e) => setFormStaffId(e.target.value)}
                          placeholder="TA-101 / SUP-202..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingUserId ? 'تحديث الحساب' : 'إنشاء الحساب الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
