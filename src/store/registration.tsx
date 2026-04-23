import { create } from 'zustand';

export interface RegistrationData {
  // Step 1
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
  avatar_url: string;
  visibility: 'Public' | 'Private' | 'Matched Only';

  // Step 2
  gender: 'Male' | 'Female';
  dob: string;
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

interface RegistrationStore {
  data: RegistrationData;
  setData: (values: Partial<RegistrationData>) => void;
  reset: () => void;
}

const initialRegistrationData: RegistrationData = {
  id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  bio: '',
  avatar_url: '',
  visibility: 'Public',
  gender: 'Male',
  dob: '',
  country: '',
  state: '',
  city: '',
  education: '',
  employment_type: '',
  designation: '',
  department: '',
  marital_status: 'Single',
  religion: 'Islam',
  prayer_regularity: '5x daily',
  quran_level: '',
  hijab_or_beard: 'Yes',
  terms_accepted: false,
  islamic_policy_accepted: false,
};

export const useRegistrationStore = create<RegistrationStore>((set) => ({
  data: { ...initialRegistrationData },
  setData: (values) =>
    set((state) => ({ data: { ...state.data, ...values } })),
  reset: () => set({ data: { ...initialRegistrationData } }),
}));
