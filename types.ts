export type UserRole =
  | 'founder'
  | 'student'
  | 'supervisor'
  | 'teaching_assistant'
  | 'department_head'
  | 'dean';

export type DentalDepartment =
  | 'operative' // طب الأسنان التحفظي وحشو الأسنان
  | 'endodontics' // علاج الجذور وعصب الأسنان
  | 'prosthodontics' // الاستعاضة السنية والتركيبات
  | 'periodontics' // طب وجراحة اللثة
  | 'pedodontics' // طب أسنان الأطفال
  | 'orthodontics' // تقويم الأسنان والفكين
  | 'oral_surgery'; // جراحة الفم والوجه والفكين

export type NumberingSystem = 'fdi' | 'uns' | 'palmer';

export type ToothCondition =
  | 'sound'
  | 'caries'
  | 'filling_composite'
  | 'filling_amalgam'
  | 'endo_rct'
  | 'crown'
  | 'extraction'
  | 'missing'
  | 'bridge'
  | 'implant'
  | 'ortho';

export type ToothSurface = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';

export type RadiographType = 'periapical' | 'bitewing' | 'panoramic' | 'cbct';

export type CaseStatus =
  | 'draft'
  | 'under_review'
  | 'needs_correction'
  | 'approved'
  | 'rejected';

export interface ToothSurfaceState {
  occlusal?: boolean;
  mesial?: boolean;
  distal?: boolean;
  buccal?: boolean;
  lingual?: boolean;
}

export interface ToothState {
  condition: ToothCondition;
  surfaces: ToothSurfaceState;
  notes?: string;
  mobility?: '0' | 'I' | 'II' | 'III';
  pocketDepthMm?: number;
}

export interface RadiographItem {
  id: string;
  url: string;
  title: string;
  type: RadiographType;
  toothNumber?: string;
  date: string;
  notes?: string;
}

export interface ClinicalProcedureStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  stepStatus?: 'pending' | 'approved' | 'needs_correction' | 'rejected';
  feedbackNotes?: string;
  supervisorSigned?: boolean;
  supervisorName?: string;
  signedByRole?: UserRole;
  signedByName?: string;
  signedById?: string;
  signedStaffId?: string;
  signedTimestamp?: string;
  timestamp?: string;
}

export interface SupervisorEvaluation {
  grade: number; // 0 - 100
  criteria: {
    infectionControl: number; // /20
    anesthesiaCavityPrep: number; // /25
    restorationObturation: number; // /25
    patientManagement: number; // /15
    professionalEthics: number; // /15
  };
  feedbackNotes: string;
  revisionRequests?: string[];
  evaluatedAt?: string;
  supervisorId?: string;
  supervisorName?: string;
  supervisorSignature?: string;
}

export interface PatientInfo {
  name: string;
  fileNumber: string;
  nationalId: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  medicalHistory: string[];
  allergies?: string;
  chiefComplaint: string;
  vitalSigns: {
    bloodPressure?: string;
    pulse?: string;
    bloodSugar?: string;
  };
}

export interface ClinicalCase {
  id: string;
  caseNumber: string;
  title: string;
  department: DentalDepartment;
  studentId: string;
  studentName: string;
  studentAcademicYear: string;
  academicLevel?: 'level3' | 'level4' | 'level5';
  semester?: 'first' | 'second';
  clinicalGroup?: string;
  supervisorId: string;
  supervisorName: string;
  assignedTaId?: string;
  assignedTaName?: string;
  patient: PatientInfo;
  diagnosis: string;
  treatmentPlan: string;
  procedureSteps: ClinicalProcedureStep[];
  dentalChart: Record<string, ToothState>; // key: FDI tooth number e.g. "11", "16", "46"
  dentitionType: 'permanent' | 'deciduous';
  radiographs: RadiographItem[];
  clinicalPhotos: string[];
  status: CaseStatus;
  evaluation?: SupervisorEvaluation;
  quotaUnits: number; // how many clinical quota points this case earns
  createdAt: string;
  updatedAt: string;
}

export interface TeachingAssistantAllocation {
  id: string;
  taId: string;
  taName: string;
  taEmail?: string;
  academicYear: string; // e.g. "2025-2026"
  academicLevel: 'level4' | 'level5';
  semester: 'first' | 'second';
  subjectId: DentalDepartment | string;
  subjectNameAr: string;
  subjectNameEn: string;
  groupCode: string; // e.g. 'Group A1', 'Group A2', 'Group B1', 'Group B2'
  groupNameAr?: string;
  clinicRoom?: string;
  quotaTargetCases?: number;
  assignedStudentIds?: string[];
  createdAt?: string;
}

export interface StudentGroup {
  id: string;
  code: string; // e.g. 'Group A1'
  nameAr: string; // e.g. 'المجموعة A1 (العيادة 3)'
  academicLevel: 'level4' | 'level5';
  academicYear: string; // e.g. "2025-2026"
  clinicRoom?: string; // e.g. 'عيادة 3'
}

export interface SubjectGroupConfig {
  id: string;
  academicLevel: 'level4' | 'level5';
  semester: 'first' | 'second';
  academicYear: string; // e.g. "2025-2026"
  subjectId: DentalDepartment | string;
  subjectNameAr: string;
  subjectNameEn?: string;
  code: string; // e.g. 'Group A1'
  nameAr: string; // e.g. 'المجموعة A1 (عيادة 1)'
  clinicRoom?: string; // e.g. 'عيادة 1'
  scheduleDayTime?: string; // e.g. 'الأحد: 08:30 ص - 11:30 ص'
  assignedTaId?: string;
  assignedTaName?: string;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  maxCapacity?: number;
  studentIds: string[];
  notes?: string;
}

export interface StudentSubjectGroupAssignment {
  studentId: string;
  subjectId: string;
  groupId: string;
  groupCode: string;
  academicLevel: 'level4' | 'level5';
  semester: 'first' | 'second';
}

export interface AcademicYearConfig {
  id: string;
  yearLabel: string; // e.g. "2025-2026"
  isCurrent: boolean;
  startDate?: string;
  endDate?: string;
}

export interface DepartmentQuotaRequirement {
  department: DentalDepartment;
  departmentNameAr: string;
  departmentNameEn: string;
  requiredUnits: number;
  descriptionAr: string;
  descriptionEn: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  studentId?: string;
  staffId?: string;
  academicYear?: string;
  academicLevel?: 'level3' | 'level4' | 'level5';
  semester?: 'first' | 'second';
  clinicalGroup?: string;
  department?: DentalDepartment;
  assignedSubject?: DentalDepartment | string;
  assignedGroupName?: string;
  assignedStudentIds?: string[];
  isDemo?: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'case' | 'user' | 'quota' | 'system' | 'evaluation';
  entityId?: string;
  details: string;
}

export type AppLanguage = 'ar' | 'en';
export type AppTheme = 'light' | 'dark';

export interface ClinicalRequirementDetail {
  id: string;
  titleAr: string;
  titleEn?: string;
  targetCount?: number;
  unitLabel?: string;
  options?: string[];
  subItems?: string[];
  notes?: string[];
}

export interface CurriculumSubject {
  id: string;
  departmentKey: DentalDepartment | string;
  nameAr: string;
  nameEn: string;
  totalCasesText?: string;
  items: ClinicalRequirementDetail[];
  rulesAndNotes?: string[];
  conditions?: string[];
  hasNoRequirements?: boolean;
}

export interface CurriculumSemester {
  id: 'first' | 'second';
  nameAr: string;
  nameEn: string;
  badge: string;
  subjects: CurriculumSubject[];
}

export interface CurriculumLevel {
  id: 'level4' | 'level5';
  nameAr: string;
  nameEn: string;
  academicYearLabel: string;
  semesters: CurriculumSemester[];
}

