/* global jest, describe, it, expect, beforeEach */

import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockGetMyProfile = jest.fn();
const mockUploadMyAvatar = jest.fn();
const mockDeleteMyAvatar = jest.fn();
const mockShow = jest.fn();
const mockCurrentUser = {
  id: 'me',
};
const mockSetCurrentUser = jest.fn();
const mockTheme = {
  assets: {
    settings: 1,
    avatar1: 2,
    avatarMale: 3,
    avatarFemale: 4,
  },
  colors: {
    background: '#ffffff',
    primary: '#111111',
    gray: '#808080',
    text: '#111111',
    white: '#ffffff',
    blurTint: 'light',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    m: 16,
    l: 24,
    xxl: 32,
  },
};

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
  useAuth: () => ({
    currentUser: mockCurrentUser,
    setCurrentUser: mockSetCurrentUser,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: () => {},
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  TouchableOpacity: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
    require('react').createElement('MockTouchableOpacity', props, children),
}));

jest.mock('@/services/users', () => ({
  __esModule: true,
  default: {
    getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
    uploadMyAvatar: (...args: unknown[]) => mockUploadMyAvatar(...args),
    deleteMyAvatar: (...args: unknown[]) => mockDeleteMyAvatar(...args),
  },
}));

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & { children?: unknown };

  return {
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Button: ({ children, ...props }: MockComponentProps) => React.createElement('MockButton', props, children),
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
    Image: ({ children, ...props }: MockComponentProps) => React.createElement('MockImage', props, children),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
  };
});

import ProfileScreen from '@/(tabs)/profile';
import { ROUTES } from '@/constants/routes';

const findButtonByA11yLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockTouchableOpacity').find(
    (buttonNode) => buttonNode.props.accessibilityLabel === label,
  );

const findButtonByText = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockTouchableOpacity').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

const findInputByPlaceholder = (root: TestRenderer.ReactTestInstance, placeholder: string) =>
  root.findAll((node) => String(node.type) === 'MockInput').find((node) => node.props.placeholder === placeholder);

const findButtonByImageSource = (root: TestRenderer.ReactTestInstance, source: number) =>
  root.findAll((node) => String(node.type) === 'MockTouchableOpacity').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockImage' && childNode.props.source === source).length > 0,
  );

describe('Profile screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('YmFzZTY0');
    mockGetMyProfile.mockResolvedValue({
      first_name: 'My',
      last_name: 'Profile',
      gender: 'Male',
      designation: 'Engineer',
      department: 'Platform',
      employment_type: 'Full-time',
      dob: '1998-01-01',
      city: 'Dubai',
      state: 'Dubai',
      country: 'UAE',
      education: 'BSc',
      marital_status: 'Single',
      religion: 'Islam',
      prayer_regularity: 'Regularly',
      quran_level: 'Intermediate',
      hijab_or_beard: 'Yes',
      visibility: 'Public',
      children_count: '0',
      wali_name: 'Wali',
      wali_relation: 'Brother',
      bio: 'Bio',
      email_verified: true,
      avatar_url: 'https://example.com/avatar.jpg',
    });
    mockUploadMyAvatar.mockResolvedValue({
      avatar_url: 'https://example.com/new-avatar.jpg',
    });
    mockDeleteMyAvatar.mockResolvedValue(undefined);
  });

  it('navigates to settings from the header action', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ProfileScreen />);
    });
    await act(async () => {});

    act(() => {
      findButtonByImageSource(renderer!.root, mockTheme.assets.settings)?.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith(ROUTES.SETTINGS);
  });

  it('shows an inline bio editor from the about me action', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ProfileScreen />);
    });
    await act(async () => {});

    act(() => {
      findButtonByA11yLabel(renderer!.root, 'Edit about me')?.props.onPress();
    });

    expect(findInputByPlaceholder(renderer!.root, 'Tell people about yourself')).toBeDefined();
    expect(findButtonByText(renderer!.root, 'Save')).toBeDefined();
    expect(findButtonByText(renderer!.root, 'Cancel')).toBeDefined();
  });

  it('shows a permission error when photo access is denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ProfileScreen />);
    });
    await act(async () => {});

    await act(async () => {
      await findButtonByA11yLabel(renderer!.root, 'Edit avatar')?.props.onPress();
    });

    expect(mockShow).toHaveBeenCalledWith('error', 'Permission to access photos is required.');
  });

  it('uploads a replacement avatar through the API', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'file:///avatar.jpg',
        fileName: 'avatar.jpg',
        mimeType: 'image/jpeg',
      }],
    });

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ProfileScreen />);
    });
    await act(async () => {});

    await act(async () => {
      await findButtonByA11yLabel(renderer!.root, 'Edit avatar')?.props.onPress();
    });

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('file:///avatar.jpg', {
      encoding: 'base64',
    });
    expect(mockUploadMyAvatar).toHaveBeenCalledWith({
      file_name: 'avatar.jpg',
      content_type: 'image/jpeg',
      base64_data: 'YmFzZTY0',
    });
    expect(mockShow).toHaveBeenCalledWith('success', 'Photo updated');
  });

  it('removes the current avatar through the API', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ProfileScreen />);
    });
    await act(async () => {});

    await act(async () => {
      await findButtonByA11yLabel(renderer!.root, 'Remove avatar')?.props.onPress();
    });

    expect(mockDeleteMyAvatar).toHaveBeenCalled();
    expect(mockShow).toHaveBeenCalledWith('success', 'Photo removed');
  });

  it('does not render fake stats or a hardcoded verification badge', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ProfileScreen />);
    });
    await act(async () => {});

    const texts = renderer!.root
      .findAll((node) => String(node.type) === 'MockText')
      .map((node) => node.children.join(' '));

    expect(texts).not.toContain('Posts');
    expect(texts).not.toContain('Followers');
    expect(texts).not.toContain('Following');
    expect(texts).not.toContain('✅ ID Verified');
  });

  it('shows backend-backed profile details and deen fields', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ProfileScreen />);
    });
    await act(async () => {});

    const textContent = renderer!.root
      .findAll((node) => String(node.type) === 'MockText')
      .map((node) => node.children.join(' '))
      .join(' | ');

    expect(textContent).toContain('My Profile');
    expect(textContent).toContain('Male, 28 years');
    expect(textContent).toContain('Dubai, Dubai, UAE');
    expect(textContent).toContain('Full-time');
    expect(textContent).toContain('Platform');
    expect(textContent).toContain('No children');
    expect(textContent).toContain('Islam');
    expect(textContent).toContain('Regularly');
    expect(textContent).toContain('Intermediate');
    expect(textContent).toContain('Wali');
    expect(textContent).toContain('Public');
    expect(textContent).toContain('Verified');
  });
});
