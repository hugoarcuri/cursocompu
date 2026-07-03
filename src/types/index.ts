export interface Student {
  id: string;
  order_number: number;
  full_name: string;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  nationality: string | null;
  sex: 'V' | 'M' | null;
  admission_date: string | null;
  exit_date: string | null;
  exit_reason: string | null;
  age_range: AgeRange | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type AgeRange = string;

export interface Attendance {
  id: string;
  student_id: string;
  month: string;
  year: number;
  day_1: string | null;
  day_2: string | null;
  day_3: string | null;
  day_4: string | null;
  day_5: string | null;
  day_6: string | null;
  day_7: string | null;
  day_8: string | null;
  day_9: string | null;
  day_10: string | null;
  day_11: string | null;
  day_12: string | null;
  day_13: string | null;
  day_14: string | null;
  day_15: string | null;
  day_16: string | null;
  day_17: string | null;
  day_18: string | null;
  day_19: string | null;
  day_20: string | null;
  day_21: string | null;
  day_22: string | null;
  day_23: string | null;
  day_24: string | null;
  day_25: string | null;
  day_26: string | null;
  day_27: string | null;
  day_28: string | null;
  day_29: string | null;
  day_30: string | null;
  day_31: string | null;
  total_attendances: number;
  total_absences: number;
  late_arrivals: number;
  monthly_accumulated: string | null;
  created_at: string;
  updated_at: string;
}

export interface InscriptionLink {
  id: string;
  token: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentFormData {
  order_number: number;
  full_name: string;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  nationality: string;
  sex: 'V' | 'M' | null;
  admission_date: string;
  exit_date: string;
  exit_reason: string;
  age_range: AgeRange | null;
  address: string;
  phone: string;
}

export interface DashboardStats {
  total_students: number;
  age_distribution: Record<string, number>;
  sex_distribution: { male: number; female: number; unspecified: number };
  nationality_distribution: Record<string, number>;
  recent_admissions: Student[];
}
