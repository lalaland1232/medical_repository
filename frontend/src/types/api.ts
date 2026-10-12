export type CaseStatus = 
  | 'Draft' 
  | 'Planning' 
  | 'In Review' 
  | 'Approved' 
  | 'Completed' 
  | 'Cancelled';

export type PriorityLevel = 'high' | 'medium' | 'low';

export const PRIORITY_MAP: Record<number, { label: string; key: PriorityLevel; badgeClass: string }> = {
  1: { label: 'High Priority', key: 'high', badgeClass: 'badge-priority-high' },
  2: { label: 'Medium Priority', key: 'medium', badgeClass: 'badge-priority-med' },
  3: { label: 'Low Priority', key: 'low', badgeClass: 'badge-priority-low' },
};

export const STATUS_LIST: CaseStatus[] = [
  'Draft',
  'Planning',
  'In Review',
  'Approved',
  'Completed',
  'Cancelled'
];

export interface MedicalCase {
  id: number;
  case_id: string;
  patient_refrence: string;
  surgeon_name: string;
  priority: number; // 1 = high, 2 = medium, 3 = low
  status: CaseStatus;
  implant_type: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCasePayload {
  case_id: string;
  patient_refrence: string;
  surgeon_name: string;
  priority: PriorityLevel;
  status: CaseStatus;
  created_by: number;
  implant_type: string;
}

export interface UpdateCasePayload {
  status: CaseStatus;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface MessageResponse {
  message: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  role_id: number;
  name: string;
  type: string;
  exp: number;
}

export type RoleDefinition = 'superuser' | 'admin' | 'user';

export const ROLE_MAP: Record<number, { name: RoleDefinition; label: string; permissions: string[] }> = {
  4: {
    name: 'superuser',
    label: 'Superuser / Lead Director',
    permissions: ['read', 'create', 'update', 'delete', 'create_admin'],
  },
  5: {
    name: 'admin',
    label: 'Clinical Administrator',
    permissions: ['read', 'create', 'update', 'delete'],
  },
  6: {
    name: 'user',
    label: 'Reviewer / Medical Staff',
    permissions: ['read'],
  },
};
