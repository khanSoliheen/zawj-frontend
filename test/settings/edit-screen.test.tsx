/* global jest, describe, it, expect, beforeEach */

const mockGetMyProfile = jest.fn();
const mockUpdateMyProfile = jest.fn();
const mockUploadMyAvatar = jest.fn();
const mockDeleteMyAvatar = jest.fn();
const mockShow = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    primary: '#111111',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    m: 16,
  },
  assets: {
    arrow: 1,
    avatar1: 1,
  },
};

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
}));

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

jest.mock('@/services/users', () => ({
  __esModule: true,
  default: {
    getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
    updateMyProfile: (...args: unknown[]) => mockUpdateMyProfile(...args),
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
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
  };
});

import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import EditProfile from '@/screens/settings/edit';

const findInputByPlaceholder = (root: TestRenderer.ReactTestInstance, placeholder: string) =>
  root.findAll((node) => String(node.type) === 'MockInput').find((node) => node.props.placeholder === placeholder);

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

const findButtonByA11yLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find(
    (buttonNode) => buttonNode.props.accessibilityLabel === label,
  );

describe('EditProfile screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMyProfile.mockResolvedValue({
      first_name: 'Current',
      last_name: 'Name',
      bio: 'Current bio',
      city: 'Current City',
      state: '',
      country: '',
      designation: 'Designer',
      avatar_url: 'https://example.com/avatar.jpg',
    });
    mockUpdateMyProfile.mockResolvedValue({
      id: 'user-1',
    });
    mockUploadMyAvatar.mockResolvedValue({
      avatar_url: 'https://example.com/new-avatar.jpg',
    });
    mockDeleteMyAvatar.mockResolvedValue(undefined);
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('YmFzZTY0');
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'file:///avatar.jpg',
        fileName: 'avatar.jpg',
        mimeType: 'image/jpeg',
      }],
    });
  });

  it('saves the edited profile fields', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<EditProfile />);
    });

    act(() => {
      findInputByPlaceholder(renderer!.root, 'Full name')?.props.onChangeText('Updated Name');
      findInputByPlaceholder(renderer!.root, 'Profession (optional)')?.props.onChangeText('Engineer');
      findInputByPlaceholder(renderer!.root, 'Location (optional)')?.props.onChangeText('Dubai');
      findInputByPlaceholder(renderer!.root, 'Bio (max 300 chars)')?.props.onChangeText('Updated bio');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Save')?.props.onPress();
    });

    expect(mockUpdateMyProfile).toHaveBeenCalledWith({
      full_name: 'Updated Name',
      bio: 'Updated bio',
      location: 'Dubai',
      profession: 'Engineer',
    });
    expect(mockShow).toHaveBeenCalledWith('success', 'Profile saved');
    expect(router.back).toHaveBeenCalled();
  });

  it('uploads a replacement avatar', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<EditProfile />);
    });

    await act(async () => {
      await findButtonByA11yLabel(renderer!.root, 'Edit avatar')?.props.onPress();
    });

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
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

  it('removes the current avatar', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<EditProfile />);
    });

    await act(async () => {
      await findButtonByA11yLabel(renderer!.root, 'Remove avatar')?.props.onPress();
    });

    expect(mockDeleteMyAvatar).toHaveBeenCalled();
    expect(mockShow).toHaveBeenCalledWith('success', 'Photo removed');
  });
});
