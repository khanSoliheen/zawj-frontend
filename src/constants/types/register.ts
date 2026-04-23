// types/register.ts
export interface RegistrationData {
  // Step 1
  id?: string;                 // assigned after sign-up
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;

  // Step 2
  gender: 'Male' | 'Female';
  dob: string;                 // YYYY-MM-DD
  country: string;
  state: string;
  city: string;
  education: string;
  employment_type: string;
  designation: string;
  department: string;

  // Step 3
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  wali_name?: string;
  wali_relation?: string;
  wali_contact?: string;
  children_count?: string;
  children_details?: string;

  // Step 4
  religion: 'Islam' | 'Other';
  prayer_regularity: '5x daily' | 'Regularly' | 'Sometimes' | 'Rarely' | 'Never';
  quran_level: string;
  hijab_or_beard: 'Yes' | 'No' | 'Sometimes';

  // Step 5
  terms_accepted: boolean;
  islamic_policy_accepted: boolean;
}
