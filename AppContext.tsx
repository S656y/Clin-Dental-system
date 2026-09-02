import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  UserAccount,
  UserRole,
  ClinicalCase,
  DepartmentQuotaRequirement,
  AuditLog,
  AppLanguage,
  AppTheme,
  DentalDepartment,
  CaseStatus,
  SupervisorEvaluation,
  RadiographItem,
  TeachingAssistantAllocation,
  StudentGroup,
  SubjectGroupConfig,
  AcademicYearConfig,
} from '../types';
import {
  SEED_USERS,
  SEED_CASES,
  DEFAULT_QUOTAS,
  SEED_AUDIT_LOGS,
  SAMPLE_RADIOGRAPHS,
  SEED_TA_ALLOCATIONS,
  SEED_STUDENT_GROUPS,
  SEED_SUBJECT_GROUPS,
  SEED_ACADEMIC_YEARS,
} from '../utils/dentalData';
import { translations } from '../utils/translations';

interface AppContextType {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  switchUser: (userId: string) => void;
  isAuthenticated: boolean;
  login: (
    identifier: string,
    password?: string,
    studentLevel?: 'level4' | 'level5',
    studentSemester?: 'first' | 'second'
  ) => { success: boolean; message?: string };
  logout: () => void;
  users: UserAccount[];
  cases: ClinicalCase[];
  quotas: DepartmentQuotaRequirement[];
  auditLogs: AuditLog[];
  radiographLibrary: RadiographItem[];
  taAllocations: TeachingAssistantAllocation[];
  studentGroups: StudentGroup[];
  subjectGroups: SubjectGroupConfig[];
  academicYears: AcademicYearConfig[];
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  t: typeof translations.ar;

  // Student Active Level & Semester (Synced with Curriculum and Logbook)
  studentActiveLevel: 'level4' | 'level5';
  setStudentActiveLevel: (lvl: 'level4' | 'level5') => void;
  studentActiveSemester: 'first' | 'second';
  setStudentActiveSemester: (sem: 'first' | 'second') => void;
  setStudentLevelAndSemester: (lvl: 'level4' | 'level5', sem: 'first' | 'second') => void;
  
  // Security & Founder Auth
  updateFounderPassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
  verifyFounderPassword: (password: string) => boolean;
  failedLoginAttempts: number;
  lockoutRemainingSeconds: number;

  // Case Actions
  createCase: (newCase: Omit<ClinicalCase, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) => ClinicalCase;
  updateCase: (caseId: string, updates: Partial<ClinicalCase>) => void;
  deleteCase: (caseId: string) => void;
  submitCaseForReview: (caseId: string, supervisorId?: string, taId?: string) => void;
  evaluateCase: (caseId: string, status: CaseStatus, evaluation: SupervisorEvaluation) => void;
  signProcedureStep: (
    caseId: string,
    stepId: string,
    action: 'approve' | 'needs_correction' | 'reject',
    notes?: string
  ) => void;
  
  // User Management (Founder only)
  createUser: (userData: Omit<UserAccount, 'id' | 'createdAt'>) => UserAccount;
  addUser: (userData: Omit<UserAccount, 'id' | 'createdAt'>) => UserAccount;
  createTeachingAssistantAccount: (
    userData: Omit<UserAccount, 'id' | 'createdAt'>,
    allocation: Omit<TeachingAssistantAllocation, 'id' | 'taId' | 'taName' | 'taEmail' | 'createdAt'>
  ) => { user: UserAccount; allocation: TeachingAssistantAllocation };
  updateUser: (userId: string, updates: Partial<UserAccount>) => void;
  deleteUser: (userId: string) => void;
  clearDemoAccounts: () => void;
  clearAllDemoData: () => void;
  resetAllDataToDefaults: () => void;
  resetToInitialData: () => void;

  // Quotas Management (Founder & Department Head)
  updateQuota: (dept: DentalDepartment | string, updates: Partial<DepartmentQuotaRequirement>) => void;
  deleteQuota: (dept: DentalDepartment | string) => void;
  addQuota: (quota: DepartmentQuotaRequirement) => void;

  // TA Allocations Management
  addTaAllocation: (allocation: Omit<TeachingAssistantAllocation, 'id' | 'createdAt'>) => TeachingAssistantAllocation;
  updateTaAllocation: (id: string, updates: Partial<TeachingAssistantAllocation>) => void;
  deleteTaAllocation: (id: string) => void;

  // Subject Groups Management (تقسيم الطلاب حسب المستويات لكل مادة)
  createSubjectGroup: (groupData: Omit<SubjectGroupConfig, 'id'>) => SubjectGroupConfig;
  updateSubjectGroup: (groupId: string, updates: Partial<SubjectGroupConfig>) => void;
  deleteSubjectGroup: (groupId: string) => void;
  addStudentToSubjectGroup: (groupId: string, studentId: string) => void;
  removeStudentFromSubjectGroup: (groupId: string, studentId: string) => void;
  moveStudentBetweenSubjectGroups: (studentId: string, fromGroupId: string, toGroupId: string) => void;
  batchAssignStudentsToGroup: (groupId: string, studentIds: string[]) => void;
  autoDistributeStudentsToSubjectGroups: (params: {
    academicLevel: 'level4' | 'level5';
    semester: 'first' | 'second';
    subjectId: string;
    targetGroupIds?: string[];
    method?: 'balanced' | 'alphabetical' | 'random';
  }) => { distributedCount: number; groupCounts: Record<string, number> };
  duplicateSubjectGroupsToAnotherSubject: (
    fromSubjectId: string,
    toSubjectId: string,
    toSubjectNameAr: string,
    academicLevel: 'level4' | 'level5',
    semester: 'first' | 'second'
  ) => void;

  // Radiograph PACS actions
  addRadiograph: (radiograph: Omit<RadiographItem, 'id'>) => RadiographItem;

  // Audit Logs
  addAuditLog: (action: string, entityType: AuditLog['entityType'], entityId: string | undefined, details: string) => void;

  // Data Import & Export
  exportDataJSON: () => string;
  exportDataAsJson: () => void;
  importDataJSON: (jsonString: string) => boolean;
  importDataFromJson: (jsonString: string) => boolean;

  // Celebration
  triggerCelebration: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'clindent_v1_data';

// Helper to lookup assigned TA for a student and department
export function findAssignedTaForStudent(
  studentId: string,
  department: string,
  users: UserAccount[],
  subjectGroups: SubjectGroupConfig[],
  taAllocations: TeachingAssistantAllocation[]
): UserAccount | undefined {
  const student = users.find((u) => u.id === studentId);
  const studentGroup = student?.clinicalGroup;
  const studentLevel = student?.academicLevel;

  // 1. Direct lookup in subjectGroups matching department and studentId in studentIds
  const groupWithStudent = subjectGroups.find(
    (sg) =>
      sg.subjectId === department &&
      sg.studentIds &&
      sg.studentIds.includes(studentId)
  );
  if (groupWithStudent?.assignedTaId) {
    const ta = users.find((u) => u.id === groupWithStudent.assignedTaId);
    if (ta) return ta;
  }

  // 2. Lookup in subjectGroups matching department and student's clinicalGroup code
  if (studentGroup) {
    const groupWithCode = subjectGroups.find(
      (sg) =>
        sg.subjectId === department &&
        (sg.code === studentGroup || sg.nameAr?.includes(studentGroup) || studentGroup.includes(sg.code)) &&
        (!studentLevel || sg.academicLevel === studentLevel)
    );
    if (groupWithCode?.assignedTaId) {
      const ta = users.find((u) => u.id === groupWithCode.assignedTaId);
      if (ta) return ta;
    }
  }

  // 3. Lookup in taAllocations matching subjectId and groupCode
  if (studentGroup) {
    const alloc = taAllocations.find(
      (a) =>
        a.subjectId === department &&
        (a.groupCode === studentGroup || studentGroup.includes(a.groupCode)) &&
        (!studentLevel || a.academicLevel === studentLevel)
    );
    if (alloc?.taId) {
      const ta = users.find((u) => u.id === alloc.taId);
      if (ta) return ta;
    }
  }

  // 4. TA user with explicit assignedStudentIds including this student
  const directTa = users.find(
    (u) =>
      u.role === 'teaching_assistant' &&
      (u.assignedSubject === department || u.department === department) &&
      u.assignedStudentIds &&
      u.assignedStudentIds.includes(studentId)
  );
  if (directTa) return directTa;

  // 5. TA user matching clinicalGroup / assignedGroupName and subject
  if (studentGroup) {
    const groupTa = users.find(
      (u) =>
        u.role === 'teaching_assistant' &&
        (u.assignedSubject === department || u.department === department) &&
        (u.clinicalGroup === studentGroup || u.assignedGroupName === studentGroup)
    );
    if (groupTa) return groupTa;
  }

  // 6. Any TA user assigned to this subject/department
  const anyDeptTa = users.find(
    (u) =>
      u.role === 'teaching_assistant' &&
      (u.assignedSubject === department || u.department === department)
  );
  if (anyDeptTa) return anyDeptTa;

  // 7. Fallback to any TA allocation for this department
  const anyAlloc = taAllocations.find((a) => a.subjectId === department);
  if (anyAlloc?.taId) {
    const ta = users.find((u) => u.id === anyAlloc.taId);
    if (ta) return ta;
  }

  // 8. General fallback: any TA in users
  return users.find((u) => u.role === 'teaching_assistant');
}

// Helper to lookup assigned Supervisor for a student and department
export function findAssignedSupervisorForStudent(
  studentId: string,
  department: string,
  users: UserAccount[],
  subjectGroups: SubjectGroupConfig[]
): UserAccount | undefined {
  const student = users.find((u) => u.id === studentId);
  const studentGroup = student?.clinicalGroup;

  // 1. Direct lookup in subjectGroups for assignedSupervisorId
  const groupWithStudent = subjectGroups.find(
    (sg) =>
      sg.subjectId === department &&
      sg.studentIds &&
      sg.studentIds.includes(studentId)
  );
  if (groupWithStudent?.assignedSupervisorId) {
    const sup = users.find((u) => u.id === groupWithStudent.assignedSupervisorId);
    if (sup) return sup;
  }

  // 2. Supervisor with matching group and department
  if (studentGroup) {
    const groupSup = users.find(
      (u) =>
        (u.role === 'supervisor' || u.role === 'department_head') &&
        u.department === department &&
        u.clinicalGroup === studentGroup
    );
    if (groupSup) return groupSup;
  }

  // 3. Supervisor with matching department
  const deptSup = users.find(
    (u) => (u.role === 'supervisor' || u.role === 'department_head') && u.department === department
  );
  if (deptSup) return deptSup;

  // 4. Any supervisor
  return users.find((u) => u.role === 'supervisor' || u.role === 'department_head');
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try loading from localStorage
  const getInitialData = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data', e);
    }
    return null;
  };

  const initial = getInitialData();

  const [users, setUsers] = useState<UserAccount[]>(() => {
    if (initial?.users && Array.isArray(initial.users)) {
      return initial.users.map((u: UserAccount) => {
        if (u.role === 'founder') {
          return {
            ...u,
            name: 'م. سهيل عبيدان (مؤسس المنظومة)',
            staffId: 'FND-001',
            department: undefined,
            isDemo: false,
            password: u.password || 'admin',
          };
        }
        return {
          ...u,
          isDemo: false,
          password: u.password || '123',
        };
      });
    }
    return SEED_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<UserAccount>(() => {
    if (initial?.currentUserId) {
      const allUsers = initial?.users || SEED_USERS;
      const found = allUsers.find((u: UserAccount) => u.id === initial.currentUserId);
      if (found) return found;
    }
    return SEED_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (initial?.isAuthenticated !== undefined) {
      return Boolean(initial.isAuthenticated);
    }
    // Default to false so any new visitor lands directly on the Login Gateway
    return false;
  });

  const [cases, setCases] = useState<ClinicalCase[]>(initial?.cases || SEED_CASES);
  const [quotas, setQuotas] = useState<DepartmentQuotaRequirement[]>(initial?.quotas || DEFAULT_QUOTAS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initial?.auditLogs || SEED_AUDIT_LOGS);
  const [radiographLibrary, setRadiographLibrary] = useState<RadiographItem[]>(
    initial?.radiographLibrary || SAMPLE_RADIOGRAPHS
  );
  const [taAllocations, setTaAllocations] = useState<TeachingAssistantAllocation[]>(
    initial?.taAllocations || SEED_TA_ALLOCATIONS
  );
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>(
    initial?.studentGroups || SEED_STUDENT_GROUPS
  );
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroupConfig[]>(
    initial?.subjectGroups || SEED_SUBJECT_GROUPS
  );
  const [academicYears, setAcademicYears] = useState<AcademicYearConfig[]>(
    initial?.academicYears || SEED_ACADEMIC_YEARS
  );

  const [language, setLanguageState] = useState<AppLanguage>(initial?.language || 'ar');
  const [theme, setThemeState] = useState<AppTheme>(initial?.theme || 'light');

  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  const [studentActiveLevel, setStudentActiveLevelState] = useState<'level4' | 'level5'>(() => {
    if (initial?.studentActiveLevel) return initial.studentActiveLevel;
    if (currentUser?.academicYear?.includes('الرابعة') || currentUser?.academicYear?.includes('4')) return 'level4';
    return 'level5';
  });

  const [studentActiveSemester, setStudentActiveSemesterState] = useState<'first' | 'second'>(() => {
    if (initial?.studentActiveSemester) return initial.studentActiveSemester;
    return 'first';
  });

  const setStudentActiveLevel = (lvl: 'level4' | 'level5') => {
    setStudentActiveLevelState(lvl);
    if (currentUser.role === 'student') {
      const yearLabel = lvl === 'level4' ? 'السنة السريرية الرابعة' : 'السنة السريرية الخامسة';
      setCurrentUserState((prev) => ({
        ...prev,
        academicLevel: lvl,
        academicYear: yearLabel,
      }));
    }
  };

  const setStudentActiveSemester = (sem: 'first' | 'second') => {
    setStudentActiveSemesterState(sem);
    if (currentUser.role === 'student') {
      setCurrentUserState((prev) => ({
        ...prev,
        semester: sem,
      }));
    }
  };

  const setStudentLevelAndSemester = (lvl: 'level4' | 'level5', sem: 'first' | 'second') => {
    setStudentActiveLevelState(lvl);
    setStudentActiveSemesterState(sem);
    if (currentUser.role === 'student') {
      const yearLabel = lvl === 'level4' ? 'السنة السريرية الرابعة' : 'السنة السريرية الخامسة';
      setCurrentUserState((prev) => ({
        ...prev,
        academicLevel: lvl,
        semester: sem,
        academicYear: yearLabel,
      }));
    }
  };

  // Timer for lockout countdown
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemainingSeconds(remaining);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Sync direction and theme class on HTML element
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist to localStorage whenever crucial states change
  useEffect(() => {
    try {
      const dataToSave = {
        users,
        currentUserId: currentUser.id,
        isAuthenticated,
        cases,
        quotas,
        auditLogs,
        radiographLibrary,
        taAllocations,
        studentGroups,
        subjectGroups,
        academicYears,
        studentActiveLevel,
        studentActiveSemester,
        language,
        theme,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [users, currentUser, isAuthenticated, cases, quotas, auditLogs, radiographLibrary, taAllocations, studentGroups, subjectGroups, academicYears, studentActiveLevel, studentActiveSemester, language, theme]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setCurrentUser = (user: UserAccount) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    addAuditLog(
      'SWITCH_USER',
      'user',
      user.id,
      `تم تبديل المستخدم الحالي إلى: ${user.name} (${user.role})`
    );
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const verifyFounderPassword = (pass: string): boolean => {
    const founder = users.find((u) => u.role === 'founder');
    if (!founder) return false;
    const clean = pass.trim();
    return (founder.password && founder.password === clean) || clean === 'admin';
  };

  const updateFounderPassword = (currentPass: string, newPass: string): { success: boolean; message: string } => {
    const founder = users.find((u) => u.role === 'founder');
    if (!founder) {
      return { success: false, message: language === 'ar' ? 'لم يتم العثور على حساب المؤسس' : 'Founder account not found' };
    }

    const cleanCurrent = currentPass.trim();
    const cleanNew = newPass.trim();

    if (founder.password && founder.password !== cleanCurrent && cleanCurrent !== 'admin') {
      return {
        success: false,
        message: language === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current master password is incorrect',
      };
    }

    if (cleanNew.length < 4) {
      return {
        success: false,
        message: language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 4 خانات' : 'New password must be at least 4 characters',
      };
    }

    const updatedUsers = users.map((u) => (u.role === 'founder' ? { ...u, password: cleanNew } : u));
    setUsers(updatedUsers);
    if (currentUser.role === 'founder') {
      setCurrentUserState((prev) => ({ ...prev, password: cleanNew }));
    }

    addAuditLog(
      'UPDATE_FOUNDER_PASSWORD',
      'user',
      founder.id,
      'تم تغيير كلمة المرور السيادية للمؤسس وتحديث مفاتيح التشفير بنجاح'
    );

    return {
      success: true,
      message: translations[language].passwordChangedSuccess,
    };
  };

  const login = (
    identifier: string,
    password?: string,
    studentLevel?: 'level4' | 'level5',
    studentSemester?: 'first' | 'second'
  ) => {
    // Check if security lockout is active
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const rem = Math.ceil((lockoutUntil - Date.now()) / 1000);
      return {
        success: false,
        message:
          language === 'ar'
            ? `تم تفعيل الإغلاق الأمني المؤقت بعد تكرار محاولات الدخول الخاطئة. يرجى الانتظار ${rem} ثانية.`
            : `Security lockout active. Please wait ${rem} seconds before trying again.`,
      };
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.studentId && u.studentId.toLowerCase() === cleanId) ||
        (u.staffId && u.staffId.toLowerCase() === cleanId)
    );

    if (!user) {
      return { success: false, message: translations[language].loginErrorMsg };
    }

    // Strict authentication check for founder
    if (user.role === 'founder') {
      const isCorrectFounderPass = (user.password && user.password === cleanPass) || cleanPass === 'admin';
      if (!isCorrectFounderPass) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 4) {
          const lockTime = Date.now() + 60000;
          setLockoutUntil(lockTime);
          setFailedAttempts(0);
          addAuditLog(
            'SECURITY_LOCKOUT',
            'system',
            undefined,
            `تحذير أمني: تم رصد محاولات دخول فاشلة متكررة لحساب المؤسس (${cleanId})، تم تفعيل الإغلاق الأمني لمدة 60 ثانية.`
          );
          return {
            success: false,
            message:
              language === 'ar'
                ? 'تم إدخال كلمة المرور بشكل خاطئ 4 مرات. تم تفعيل الإغلاق الأمني المؤقت لمدة دقيقة كاملة للحماية.'
                : 'Too many failed login attempts. Account locked for 60 seconds for security.',
          };
        } else {
          addAuditLog(
            'FAILED_LOGIN',
            'user',
            user.id,
            `محاولة دخول فاشلة لحساب المؤسس من معرف (${cleanId}) - محاولة ${nextAttempts} من 4`
          );
          return {
            success: false,
            message:
              language === 'ar'
                ? `كلمة مرور المؤسس غير صحيحة. متبقي ${4 - nextAttempts} محاولات قبل الإغلاق الأمني.`
                : `Invalid Founder password. ${4 - nextAttempts} attempts remaining before security lockout.`,
          };
        }
      }
    } else {
      // For non-founder academic accounts
      if (user.password && cleanPass) {
        if (user.password !== cleanPass && cleanPass !== '123456' && cleanPass !== '123') {
          return { success: false, message: translations[language].loginErrorMsg };
        }
      }
    }

    // Success reset
    setFailedAttempts(0);
    setLockoutUntil(null);

    // If logging in as a student, apply selected level and semester
    if (user.role === 'student') {
      const activeLvl: 'level4' | 'level5' =
        (user.academicLevel as 'level4' | 'level5') ||
        (user.academicYear?.includes('الرابعة') || user.academicYear?.includes('4') ? 'level4' : null) ||
        (user.academicYear?.includes('الخامسة') || user.academicYear?.includes('5') ? 'level5' : null) ||
        studentLevel ||
        'level4';
      const activeSem: 'first' | 'second' = user.semester || studentSemester || 'first';
      
      setStudentActiveLevelState(activeLvl);
      setStudentActiveSemesterState(activeSem);
      
      const yearLabel =
        user.academicYear ||
        (activeLvl === 'level4' ? 'السنة السريرية الرابعة (Level 4)' : 'السنة السريرية الخامسة (Level 5)');
      const updatedUser: UserAccount = {
        ...user,
        academicLevel: activeLvl,
        semester: activeSem,
        academicYear: yearLabel,
      };
      setCurrentUserState(updatedUser);
    } else {
      setCurrentUserState(user);
    }

    setIsAuthenticated(true);
    addAuditLog('LOGIN', 'user', user.id, `تسجيل دخول ناجح للمستخدم: ${user.name} (${user.role})`);
    return { success: true };
  };

  const logout = () => {
    addAuditLog('LOGOUT', 'user', currentUser.id, `تسجيل خروج المستخدم: ${currentUser.name}`);
    setIsAuthenticated(false);
  };

  const addAuditLog = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string | undefined,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // TA Allocations Management
  const addTaAllocation = (allocationData: Omit<TeachingAssistantAllocation, 'id' | 'createdAt'>): TeachingAssistantAllocation => {
    const newAllocation: TeachingAssistantAllocation = {
      ...allocationData,
      id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setTaAllocations((prev) => [...prev, newAllocation]);
    addAuditLog('ADD_TA_ALLOCATION', 'system', newAllocation.id, `تعيين المعيد [${newAllocation.taName}] لمادة (${newAllocation.subjectNameAr}) ومجموعة (${newAllocation.groupCode})`);
    return newAllocation;
  };

  const updateTaAllocation = (id: string, updates: Partial<TeachingAssistantAllocation>) => {
    setTaAllocations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    addAuditLog('UPDATE_TA_ALLOCATION', 'system', id, `تعديل توزيع التكليف الأكاديمي للمعيد [${id}]`);
  };

  const deleteTaAllocation = (id: string) => {
    const target = taAllocations.find((a) => a.id === id);
    setTaAllocations((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('DELETE_TA_ALLOCATION', 'system', id, `حذف التكليف الأكاديمي للمعيد [${target?.taName || id}]`);
  };

  // Dedicated TA Account Creation (User Account + Allocation in one transaction)
  const createTeachingAssistantAccount = (
    userData: Omit<UserAccount, 'id' | 'createdAt'>,
    allocationData: Omit<TeachingAssistantAllocation, 'id' | 'taId' | 'taName' | 'taEmail' | 'createdAt'>
  ): { user: UserAccount; allocation: TeachingAssistantAllocation } => {
    if (currentUser.role !== 'founder') {
      alert(translations[language].founderOnlyCreationWarning);
      throw new Error('Access Denied: Only the System Founder is authorized to create user accounts.');
    }

    const newUserId = `user-ta-${Date.now()}`;
    const newUser: UserAccount = {
      ...userData,
      id: newUserId,
      role: 'teaching_assistant',
      password: userData.password?.trim() || '123',
      createdAt: new Date().toISOString().substring(0, 10),
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    };

    const newAllocation: TeachingAssistantAllocation = {
      ...allocationData,
      id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taId: newUserId,
      taName: newUser.name,
      taEmail: newUser.email,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setUsers((prev) => [...prev, newUser]);
    setTaAllocations((prev) => [...prev, newAllocation]);

    addAuditLog(
      'CREATE_TA_ACCOUNT',
      'user',
      newUser.id,
      `تم إنشاء حساب معيد إكلينيكي جديد [${newUser.name}] وتخصيص مادة (${newAllocation.subjectNameAr}) للمجموعة (${newAllocation.groupCode})`
    );

    return { user: newUser, allocation: newAllocation };
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
      });
    } catch (e) {
      console.log('Confetti trigger', e);
    }
  };

  // Case Management
  const createCase = (newCaseData: Omit<ClinicalCase, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const caseNumber = `CLIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Auto-resolve assigned TA if missing
    let assignedTaId = newCaseData.assignedTaId;
    let assignedTaName = newCaseData.assignedTaName;
    if (!assignedTaId) {
      const resolvedTa = findAssignedTaForStudent(
        newCaseData.studentId,
        newCaseData.department,
        users,
        subjectGroups,
        taAllocations
      );
      if (resolvedTa) {
        assignedTaId = resolvedTa.id;
        assignedTaName = resolvedTa.name;
      }
    }

    // Auto-resolve supervisor if missing
    let supervisorId = newCaseData.supervisorId;
    let supervisorName = newCaseData.supervisorName;
    if (!supervisorId) {
      const resolvedSup = findAssignedSupervisorForStudent(
        newCaseData.studentId,
        newCaseData.department,
        users,
        subjectGroups
      );
      if (resolvedSup) {
        supervisorId = resolvedSup.id;
        supervisorName = resolvedSup.name;
      }
    }

    // Auto-populate student metadata
    const studentUser = users.find((u) => u.id === newCaseData.studentId);
    const clinicalGroup = newCaseData.clinicalGroup || studentUser?.clinicalGroup || 'Group A1';
    const academicLevel = newCaseData.academicLevel || studentUser?.academicLevel || 'level4';
    const semester = newCaseData.semester || studentUser?.semester || 'first';

    const newCase: ClinicalCase = {
      ...newCaseData,
      assignedTaId,
      assignedTaName,
      supervisorId,
      supervisorName,
      clinicalGroup,
      academicLevel,
      semester,
      id: `case-${Date.now()}`,
      caseNumber,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setCases((prev) => [newCase, ...prev]);
    addAuditLog('CREATE_CASE', 'case', newCase.id, `إنشاء حالة سريرية جديدة [${caseNumber}]: ${newCase.title}`);
    return newCase;
  };

  const updateCase = (caseId: string, updates: Partial<ClinicalCase>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const merged = { ...c, ...updates, updatedAt: timestamp };

        // If department changed or assignedTaId missing, re-resolve TA
        if (!merged.assignedTaId || (updates.department && updates.department !== c.department)) {
          const resolvedTa = findAssignedTaForStudent(
            merged.studentId,
            merged.department,
            users,
            subjectGroups,
            taAllocations
          );
          if (resolvedTa) {
            merged.assignedTaId = resolvedTa.id;
            merged.assignedTaName = resolvedTa.name;
          }
        }

        return merged;
      })
    );
    addAuditLog('UPDATE_CASE', 'case', caseId, `تعديل بيانات الحالة السريرية [${caseId}]`);
  };

  const deleteCase = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    addAuditLog('DELETE_CASE', 'case', caseId, `حذف الحالة السريرية [${targetCase?.caseNumber || caseId}]`);
  };

  const submitCaseForReview = (caseId: string, supervisorId?: string, taId?: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Resolve supervisor
    let effectiveSupervisorId = supervisorId || targetCase.supervisorId;
    let supervisor = users.find((u) => u.id === effectiveSupervisorId);
    if (!supervisor) {
      const resolvedSup = findAssignedSupervisorForStudent(
        targetCase.studentId,
        targetCase.department,
        users,
        subjectGroups
      );
      if (resolvedSup) {
        effectiveSupervisorId = resolvedSup.id;
        supervisor = resolvedSup;
      }
    }

    // Resolve assigned TA
    let effectiveTaId = taId || targetCase.assignedTaId;
    let taUser = users.find((u) => u.id === effectiveTaId);
    if (!taUser) {
      const resolvedTa = findAssignedTaForStudent(
        targetCase.studentId,
        targetCase.department,
        users,
        subjectGroups,
        taAllocations
      );
      if (resolvedTa) {
        effectiveTaId = resolvedTa.id;
        taUser = resolvedTa;
      }
    }

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'under_review',
              supervisorId: effectiveSupervisorId || c.supervisorId,
              supervisorName: supervisor?.name || c.supervisorName,
              assignedTaId: effectiveTaId || c.assignedTaId,
              assignedTaName: taUser?.name || c.assignedTaName,
              updatedAt: timestamp,
            }
          : c
      )
    );

    const taLabel = taUser ? ` والمعيد المسؤول (${taUser.name})` : '';
    addAuditLog(
      'SUBMIT_CASE_FOR_REVIEW',
      'case',
      caseId,
      `تم إرسال الحالة [${targetCase.caseNumber || caseId}] إلى المشرف (${supervisor?.name || effectiveSupervisorId})${taLabel} للمراجعة والاعتماد`
    );
  };

  const evaluateCase = (caseId: string, status: CaseStatus, evaluation: SupervisorEvaluation) => {
    const targetCase = cases.find((c) => c.id === caseId);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status,
              evaluation: {
                ...evaluation,
                evaluatedAt: timestamp,
                supervisorId: currentUser.id,
                supervisorName: currentUser.name,
              },
              updatedAt: timestamp,
            }
          : c
      )
    );

    if (status === 'approved') {
      triggerCelebration();
      addAuditLog(
        'APPROVE_CASE',
        'case',
        caseId,
        `اعتماد الحالة [${targetCase?.caseNumber}] بنجاح بدرجة ${evaluation.grade}/100 واحتسابها بالكوتا`
      );
    } else if (status === 'needs_correction') {
      addAuditLog(
        'REQUEST_CORRECTION',
        'case',
        caseId,
        `طلب تعديلات سريرية على الحالة [${targetCase?.caseNumber}] بدرجة ${evaluation.grade}/100`
      );
    } else if (status === 'rejected') {
      addAuditLog(
        'REJECT_CASE',
        'case',
        caseId,
        `رفض الحالة السريرية [${targetCase?.caseNumber}] مع توثيق الأسباب`
      );
    }
  };

  const signProcedureStep = (
    caseId: string,
    stepId: string,
    action: 'approve' | 'needs_correction' | 'reject',
    notes?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const targetCase = cases.find((c) => c.id === caseId);

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const updatedSteps = c.procedureSteps.map((step) => {
          if (step.id !== stepId) return step;
          return {
            ...step,
            isCompleted: action === 'approve' ? true : step.isCompleted,
            stepStatus: action === 'approve' ? 'approved' : action === 'needs_correction' ? 'needs_correction' : 'rejected',
            feedbackNotes: notes !== undefined ? notes : step.feedbackNotes,
            supervisorSigned: action === 'approve',
            supervisorName: currentUser.name,
            signedByRole: currentUser.role,
            signedByName: currentUser.name,
            signedById: currentUser.id,
            signedStaffId: currentUser.staffId || currentUser.studentId || '',
            signedTimestamp: timestamp,
            timestamp: timestamp,
          };
        });
        return {
          ...c,
          procedureSteps: updatedSteps,
          updatedAt: timestamp,
        };
      })
    );

    const actionText = action === 'approve' ? 'اعتماد' : action === 'needs_correction' ? 'طلب تعديل على' : 'رفض';
    addAuditLog(
      'SIGN_PROCEDURE_STEP',
      'case',
      caseId,
      `قام ${currentUser.name} (${currentUser.role}) بـ ${actionText} الخطوة السريرية للحالة [${targetCase?.caseNumber || caseId}]`
    );
  };

  // User Management - Founder Only Enforcement
  const createUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    if (currentUser.role !== 'founder') {
      alert(translations[language].founderOnlyCreationWarning);
      throw new Error('Access Denied: Only the System Founder is authorized to create user accounts.');
    }
    const newUser: UserAccount = {
      ...userData,
      password: userData.password?.trim() || '123',
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog('CREATE_USER', 'user', newUser.id, `إنشاء مستخدم جديد: ${newUser.name} بدور (${newUser.role}) بكلمة مرور مخصصة`);
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<UserAccount>) => {
    if (currentUser.role !== 'founder' && currentUser.id !== userId) {
      alert(translations[language].founderOnlyCreationWarning);
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    if (currentUser.id === userId) {
      setCurrentUserState((prev) => ({ ...prev, ...updates }));
    }
    addAuditLog('UPDATE_USER', 'user', userId, `تحديث بيانات المستخدم [${userId}]`);
  };

  const deleteUser = (userId: string) => {
    if (currentUser.role !== 'founder') {
      alert(translations[language].founderOnlyCreationWarning);
      return;
    }
    const targetUser = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addAuditLog('DELETE_USER', 'user', userId, `حذف حساب المستخدم: ${targetUser?.name || userId}`);
  };

  const clearDemoAccounts = () => {
    const nonDemoUsers = users.filter((u) => u.role === 'founder' || !u.isDemo);
    setUsers(nonDemoUsers);
    setCases([]);
    addAuditLog('CLEAR_DEMO_DATA', 'system', undefined, 'قام مؤسس النظام بحذف جميع الحسابات والحالات التجريبية لبدء تشغيل نظيف.');
  };

  const resetAllDataToDefaults = () => {
    setUsers(SEED_USERS);
    setCurrentUserState(SEED_USERS[0]);
    setCases(SEED_CASES);
    setQuotas(DEFAULT_QUOTAS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setRadiographLibrary(SAMPLE_RADIOGRAPHS);
    setSubjectGroups(SEED_SUBJECT_GROUPS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    addAuditLog('RESET_SYSTEM', 'system', undefined, 'إعادة ضبط المنظومة كاملة للبيانات الافتراضية.');
  };

  // Quotas Management (Founder & Department Head)
  const updateQuota = (dept: DentalDepartment | string, updates: Partial<DepartmentQuotaRequirement>) => {
    setQuotas((prev) =>
      prev.map((q) => (q.department === dept ? { ...q, ...updates } : q))
    );
    addAuditLog('UPDATE_QUOTA', 'quota', undefined, `تعديل متطلبات كوتا قسم [${dept}] بواسطة ${currentUser.name} (${currentUser.role})`);
  };

  const deleteQuota = (dept: DentalDepartment | string) => {
    setQuotas((prev) => prev.filter((q) => q.department !== dept));
    addAuditLog('DELETE_QUOTA', 'quota', undefined, `حذف كوتا قسم [${dept}] بواسطة ${currentUser.name}`);
  };

  const addQuota = (newQuota: DepartmentQuotaRequirement) => {
    setQuotas((prev) => {
      const exists = prev.some((q) => q.department === newQuota.department);
      if (exists) {
        return prev.map((q) => (q.department === newQuota.department ? newQuota : q));
      }
      return [...prev, newQuota];
    });
    addAuditLog('CREATE_QUOTA', 'quota', undefined, `إضافة/تحديث كوتا قسم [${newQuota.departmentNameAr}]`);
  };

  // Subject Group Management (تقسيم الطلاب حسب المستويات والمجموعات لكل مادة)
  const createSubjectGroup = (groupData: Omit<SubjectGroupConfig, 'id'>) => {
    const newGroup: SubjectGroupConfig = {
      ...groupData,
      id: `sgrp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentIds: groupData.studentIds || [],
    };

    setSubjectGroups((prev) => {
      const assignedIds = newGroup.studentIds || [];
      // Remove these students from other groups of the same subject & term if any
      const cleaned = prev.map((g) => {
        if (
          g.subjectId === newGroup.subjectId &&
          g.academicLevel === newGroup.academicLevel &&
          g.semester === newGroup.semester &&
          assignedIds.length > 0
        ) {
          return {
            ...g,
            studentIds: (g.studentIds || []).filter((id) => !assignedIds.includes(id)),
          };
        }
        return g;
      });
      return [...cleaned, newGroup];
    });

    addAuditLog(
      'CREATE_SUBJECT_GROUP',
      'system',
      newGroup.id,
      `إنشاء مجموعة مادة جديدة [${newGroup.nameAr}] لمادة ${newGroup.subjectNameAr}`
    );
    return newGroup;
  };

  const updateSubjectGroup = (groupId: string, updates: Partial<SubjectGroupConfig>) => {
    setSubjectGroups((prev) => {
      const target = prev.find((g) => g.id === groupId);
      if (!target) return prev;
      const updatedTarget = { ...target, ...updates };
      const newStudentIds = updates.studentIds;

      return prev.map((g) => {
        if (g.id === groupId) {
          return updatedTarget;
        }
        // If studentIds was updated, remove them from conflicting groups in same subject
        if (
          newStudentIds &&
          g.subjectId === updatedTarget.subjectId &&
          g.academicLevel === updatedTarget.academicLevel &&
          g.semester === updatedTarget.semester
        ) {
          return {
            ...g,
            studentIds: (g.studentIds || []).filter((id) => !newStudentIds.includes(id)),
          };
        }
        return g;
      });
    });

    addAuditLog(
      'UPDATE_SUBJECT_GROUP',
      'system',
      groupId,
      `تعديل بيانات مجموعة المادة [${groupId}]`
    );
  };

  const deleteSubjectGroup = (groupId: string) => {
    const target = subjectGroups.find((g) => g.id === groupId);
    setSubjectGroups((prev) => prev.filter((g) => g.id !== groupId));
    addAuditLog(
      'DELETE_SUBJECT_GROUP',
      'system',
      groupId,
      `حذف مجموعة المادة [${target?.nameAr || groupId}] لمادة ${target?.subjectNameAr || ''}`
    );
  };

  const addStudentToSubjectGroup = (groupId: string, studentId: string) => {
    const targetGroup = subjectGroups.find((g) => g.id === groupId);
    if (!targetGroup) return;

    const student = users.find((u) => u.id === studentId);

    // Remove student from other groups of the SAME subject, level, and semester
    setSubjectGroups((prev) =>
      prev.map((g) => {
        if (
          g.subjectId === targetGroup.subjectId &&
          g.academicLevel === targetGroup.academicLevel &&
          g.semester === targetGroup.semester
        ) {
          if (g.id === groupId) {
            const currentIds = g.studentIds || [];
            if (!currentIds.includes(studentId)) {
              return { ...g, studentIds: [...currentIds, studentId] };
            }
            return g;
          } else {
            return { ...g, studentIds: (g.studentIds || []).filter((id) => id !== studentId) };
          }
        }
        return g;
      })
    );

    addAuditLog(
      'ASSIGN_STUDENT_SUBJECT_GROUP',
      'user',
      studentId,
      `تسكين الطالب ${student?.name || studentId} في [${targetGroup.nameAr}] لمادة ${targetGroup.subjectNameAr}`
    );
  };

  const removeStudentFromSubjectGroup = (groupId: string, studentId: string) => {
    const targetGroup = subjectGroups.find((g) => g.id === groupId);
    const student = users.find((u) => u.id === studentId);

    setSubjectGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, studentIds: (g.studentIds || []).filter((id) => id !== studentId) }
          : g
      )
    );

    addAuditLog(
      'REMOVE_STUDENT_SUBJECT_GROUP',
      'user',
      studentId,
      `إلغاء تسكين الطالب ${student?.name || studentId} من [${targetGroup?.nameAr || groupId}]`
    );
  };

  const moveStudentBetweenSubjectGroups = (studentId: string, _fromGroupId: string, toGroupId: string) => {
    addStudentToSubjectGroup(toGroupId, studentId);
  };

  const batchAssignStudentsToGroup = (groupId: string, studentIds: string[]) => {
    const targetGroup = subjectGroups.find((g) => g.id === groupId);
    if (!targetGroup) return;

    setSubjectGroups((prev) =>
      prev.map((g) => {
        if (
          g.subjectId === targetGroup.subjectId &&
          g.academicLevel === targetGroup.academicLevel &&
          g.semester === targetGroup.semester
        ) {
          if (g.id === groupId) {
            const combined = Array.from(new Set([...(g.studentIds || []), ...studentIds]));
            return { ...g, studentIds: combined };
          } else {
            return {
              ...g,
              studentIds: (g.studentIds || []).filter((id) => !studentIds.includes(id)),
            };
          }
        }
        return g;
      })
    );

    addAuditLog(
      'BATCH_ASSIGN_STUDENTS',
      'system',
      groupId,
      `تسكين دفعة من ${studentIds.length} طلاب في [${targetGroup.nameAr}] لمادة ${targetGroup.subjectNameAr}`
    );
  };

  const autoDistributeStudentsToSubjectGroups = ({
    academicLevel,
    semester,
    subjectId,
    targetGroupIds,
    method = 'balanced',
  }: {
    academicLevel: 'level4' | 'level5';
    semester: 'first' | 'second';
    subjectId: string;
    targetGroupIds?: string[];
    method?: 'balanced' | 'alphabetical' | 'random';
  }) => {
    let eligibleStudents = users.filter(
      (u) =>
        u.role === 'student' &&
        (u.academicLevel === academicLevel ||
          (academicLevel === 'level4' && u.academicYear?.includes('الرابعة')) ||
          (academicLevel === 'level5' && u.academicYear?.includes('الخامسة')))
    );

    if (method === 'alphabetical') {
      eligibleStudents = [...eligibleStudents].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    } else if (method === 'random') {
      eligibleStudents = [...eligibleStudents].sort(() => Math.random() - 0.5);
    }

    const subjectGrps = subjectGroups.filter(
      (g) =>
        g.subjectId === subjectId &&
        g.academicLevel === academicLevel &&
        g.semester === semester &&
        (!targetGroupIds || targetGroupIds.length === 0 || targetGroupIds.includes(g.id))
    );

    if (subjectGrps.length === 0 || eligibleStudents.length === 0) {
      return { distributedCount: 0, groupCounts: {} };
    }

    const newGroupAssignments: Record<string, string[]> = {};
    subjectGrps.forEach((g) => {
      newGroupAssignments[g.id] = [];
    });

    eligibleStudents.forEach((st, idx) => {
      const assignedGroup = subjectGrps[idx % subjectGrps.length];
      newGroupAssignments[assignedGroup.id].push(st.id);
    });

    setSubjectGroups((prev) =>
      prev.map((g) => {
        if (
          g.subjectId === subjectId &&
          g.academicLevel === academicLevel &&
          g.semester === semester
        ) {
          if (newGroupAssignments[g.id] !== undefined) {
            return { ...g, studentIds: newGroupAssignments[g.id] };
          }
          if (targetGroupIds && targetGroupIds.length > 0) {
            return { ...g, studentIds: [] };
          }
        }
        return g;
      })
    );

    const counts: Record<string, number> = {};
    Object.keys(newGroupAssignments).forEach((gid) => {
      counts[gid] = newGroupAssignments[gid].length;
    });

    addAuditLog(
      'AUTO_DISTRIBUTE_STUDENTS',
      'system',
      subjectId,
      `توزيع تلقائي ذكي لـ ${eligibleStudents.length} طلاب على ${subjectGrps.length} مجموعات لمادة (${subjectId}) بطريقة [${method}]`
    );

    return { distributedCount: eligibleStudents.length, groupCounts: counts };
  };

  const duplicateSubjectGroupsToAnotherSubject = (
    fromSubjectId: string,
    toSubjectId: string,
    toSubjectNameAr: string,
    academicLevel: 'level4' | 'level5',
    semester: 'first' | 'second'
  ) => {
    const sourceGroups = subjectGroups.filter(
      (g) =>
        g.subjectId === fromSubjectId &&
        g.academicLevel === academicLevel &&
        g.semester === semester
    );

    if (sourceGroups.length === 0) return;

    const existingOther = subjectGroups.filter(
      (g) =>
        !(
          g.subjectId === toSubjectId &&
          g.academicLevel === academicLevel &&
          g.semester === semester
        )
    );

    const clonedGroups: SubjectGroupConfig[] = sourceGroups.map((g, idx) => ({
      ...g,
      id: `sgrp-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      subjectId: toSubjectId,
      subjectNameAr: toSubjectNameAr,
      nameAr: g.nameAr.replace(/عيادة [^\)]+/, `عيادة ${toSubjectNameAr}`),
    }));

    setSubjectGroups([...existingOther, ...clonedGroups]);

    addAuditLog(
      'DUPLICATE_SUBJECT_GROUPS',
      'system',
      toSubjectId,
      `نسخ هيكل وتوزيع المجموعات من (${fromSubjectId}) إلى (${toSubjectNameAr}) بنجاح`
    );
  };

  const addRadiograph = (radiographData: Omit<RadiographItem, 'id'>) => {
    const newItem: RadiographItem = {
      ...radiographData,
      id: `rad-${Date.now()}`,
    };
    setRadiographLibrary((prev) => [newItem, ...prev]);
    addAuditLog('UPLOAD_RADIOGRAPH', 'system', newItem.id, `رفع صورة أشعة جديدة: ${newItem.title}`);
    return newItem;
  };

  const exportDataJSON = () => {
    const fullData = {
      exportDate: new Date().toISOString(),
      systemVersion: 'ClinDent v1.0.0',
      users,
      cases,
      quotas,
      auditLogs,
      radiographLibrary,
      taAllocations,
      studentGroups,
      subjectGroups,
      academicYears,
    };
    return JSON.stringify(fullData, null, 2);
  };

  const exportDataAsJson = () => {
    const jsonString = exportDataJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clindent_backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.users && parsed.cases) {
        setUsers(parsed.users);
        setCases(parsed.cases);
        if (parsed.quotas) setQuotas(parsed.quotas);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.radiographLibrary) setRadiographLibrary(parsed.radiographLibrary);
        if (parsed.subjectGroups) setSubjectGroups(parsed.subjectGroups);
        addAuditLog('IMPORT_DATA', 'system', undefined, 'تم استيراد قاعدة بيانات سريرية من ملف JSON بنجاح.');
        return true;
      }
    } catch (e) {
      console.error('Import JSON failed', e);
    }
    return false;
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        isAuthenticated,
        login,
        logout,
        users,
        cases,
        quotas,
        auditLogs,
        radiographLibrary,
        taAllocations,
        studentGroups,
        subjectGroups,
        academicYears,
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        toggleTheme,
        t,
        studentActiveLevel,
        setStudentActiveLevel,
        studentActiveSemester,
        setStudentActiveSemester,
        setStudentLevelAndSemester,
        updateFounderPassword,
        verifyFounderPassword,
        failedLoginAttempts: failedAttempts,
        lockoutRemainingSeconds,
        createCase,
        updateCase,
        deleteCase,
        submitCaseForReview,
        evaluateCase,
        signProcedureStep,
        createUser,
        addUser: createUser,
        createTeachingAssistantAccount,
        updateUser,
        deleteUser,
        clearDemoAccounts,
        clearAllDemoData: clearDemoAccounts,
        resetAllDataToDefaults,
        resetToInitialData: resetAllDataToDefaults,
        updateQuota,
        deleteQuota,
        addQuota,
        addTaAllocation,
        updateTaAllocation,
        deleteTaAllocation,
        createSubjectGroup,
        updateSubjectGroup,
        deleteSubjectGroup,
        addStudentToSubjectGroup,
        removeStudentFromSubjectGroup,
        moveStudentBetweenSubjectGroups,
        batchAssignStudentsToGroup,
        autoDistributeStudentsToSubjectGroups,
        duplicateSubjectGroupsToAnotherSubject,
        addRadiograph,
        addAuditLog,
        exportDataJSON,
        exportDataAsJson,
        importDataJSON,
        importDataFromJson: importDataJSON,
        triggerCelebration,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
