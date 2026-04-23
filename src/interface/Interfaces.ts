export interface ILanguageDetectorPlugin {
  type: 'languageDetector';
  async: boolean;
  detect: (_: (_: string) => void) => void;
  init: () => void;
  cacheUserLanguage: (_: string) => void;
}

export interface IRegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export interface IButtonProps {
  buttonText: string;
}
