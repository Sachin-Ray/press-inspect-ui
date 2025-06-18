export interface User {
  id: string;
  name: string;
  email: string;
  roles: 'SuperAdmin' | 'Admin' | 'PrePressInspector' | 'PressInspector' | 'PostPressInspector' | 'PackagingInspector' | 'Customer';
  registrationId?: string;
  country?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface InspectionReport {
  id: string;
  userId: string;
  inspectorName: string;
  registrationId: string;
  group: string;
  model: string;
  item: string;
  year: string;
  date: string;
  location: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  units: InspectionUnit[];
  overallScore: number;
  overallRating: 'Excellent' | 'Good' | 'Average' | 'Not Good';
  comments: string;
  createdAt: string;
}

export interface InspectionUnit {
  name: string;
  checkpoints: Checkpoint[];
  unitScore: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  status: 'Excellent' |'Good' | 'Bad' | 'Better' | null;
  comments?: string;
}

export interface FormState {
  machineName: string;
  machineId: any;
  group: string;
  model: string;
  item: string;
  year: string;
}

export interface FormOption {
  value: string;
  label: string;
}

export interface FormData {
  groups: FormOption[];
  models: Record<string, FormOption[]>;
  items: Record<string, Record<string, FormOption[]>>;
  years: FormOption[];
}