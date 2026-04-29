/* global jest, describe, it, expect, beforeEach */

import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import UserDetailScreen from '@/(tabs)/users/[id]';
import { ROUTES, buildChatRoute } from '@/constants/routes';

const mockShow = jest.fn();
const mockGetUser = jest.fn();
const mockRequestPhotoAccess = jest.fn();
const mockUseAuth = jest.fn(() => ({
  currentUser: {
    id: 'current-user',
  },
  billingStatus: {
    access_state: 'active',
  },
}));
const mockTheme = {
  assets: {
    arrow: 1,
    more: 2,
    avatar1: 3,
    avatarMale: 4,
    avatarFemale: 5,
    chat: 6,
    star: 7,
  },
  colors: {
    background: '#ffffff',
    text: '#111111',
    gray: '#808080',
    primary: '#ff3366',
    card: '#f5f5f5',
    success: '#11aa55',
    white: '#ffffff',
  },
  sizes: {
    padding: 16,
    sm: 12,
    s: 8,
    l: 24,
    m: 16,
    cardRadius: 16,
    xxl: 32,
  },
};

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
  useAuth: () => mockUseAuth(),
  useRealtime: () => ({
    lastEvent: null,
  }),
}));

jest.mock('react-native', () => {
  const React = require('react');

  return {
    Alert: {
      alert: jest.fn(),
    },
    TouchableOpacity: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockTouchableOpacity', props, children),
  };
});

jest.mock('@/services/users', () => ({
  __esModule: true,
  default: {
    getUser: (...args: unknown[]) => mockGetUser(...args),
  },
}));

jest.mock('@/services/settings', () => ({
  __esModule: true,
  default: {
    requestPhotoAccess: (...args: unknown[]) => mockRequestPhotoAccess(...args),
  },
}));

jest.mock('@/services/chat', () => ({
  __esModule: true,
  default: {
    ensureConversation: jest.fn(),
  },
}));

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & { children?: unknown };

  return {
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Button: ({ children, ...props }: MockComponentProps) => React.createElement('MockButton', props, children),
    Image: ({ children, ...props }: MockComponentProps) => React.createElement('MockImage', props, children),
    MoreMenu: (props: Record<string, unknown>) => React.createElement('MockMoreMenu', props),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
  };
});

const mockUseLocalSearchParams = useLocalSearchParams as unknown as jest.Mock;

const findTouchableByText = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockTouchableOpacity').find((touchableNode) =>
    touchableNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('User detail screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: {
        id: 'current-user',
      },
      billingStatus: {
        access_state: 'active',
      },
    });
    mockUseLocalSearchParams.mockReturnValue({ id: 'user-2' });
    mockGetUser.mockResolvedValue({
      id: 'user-2',
      first_name: 'Amina',
      last_name: 'Khan',
      gender: 'Female',
      dob: '1999-01-01',
      avatar_url: 'https://cdn.example.com/amina.jpg',
      bio: 'About me',
      state: 'Kerala',
      education: 'BSc',
      department: 'Engineering',
      prayer_regularity: 'Regularly',
      quran_level: 'Intermediate',
      hijab_or_beard: 'Yes',
      photo_access_status: 'approved',
      is_online: true,
      interested: false,
    });
    mockRequestPhotoAccess.mockResolvedValue({ message: 'photo access requested' });
  });

  it('opens the compose chat screen without creating a conversation yet', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<UserDetailScreen />);
    });
    await act(async () => {});

    await act(async () => {
      await findTouchableByText(renderer!.root, 'Message')?.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith({
      pathname: buildChatRoute('new'),
      params: {
        name: 'Amina Khan',
        peerId: 'user-2',
        peerAvatarUrl: 'https://cdn.example.com/amina.jpg',
      },
    });
  });

  it('routes free users to billing before opening a new chat request', async () => {
    mockUseAuth.mockReturnValue({
      currentUser: { id: 'current-user' },
      billingStatus: { access_state: 'free' },
    });

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<UserDetailScreen />);
    });
    await act(async () => {});

    await act(async () => {
      await findTouchableByText(renderer!.root, 'Message')?.props.onPress();
    });

    expect(mockShow).toHaveBeenCalledWith('info', 'Premium is required to send a new message request.');
    expect(router.push).toHaveBeenCalledWith(ROUTES.SETTINGS_BILLING);
  });

  it('shows richer profile details instead of partial placeholders', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<UserDetailScreen />);
    });
    await act(async () => {});

    const texts = renderer!.root
      .findAll((node) => String(node.type) === 'MockText')
      .map((node) => node.children.join(' '));
    const textContent = texts.join(' | ');

    expect(texts).toContain('Amina Khan');
    expect(texts).toContain('Female, 27 years');
    expect(texts).toContain('About me');
    expect(textContent).toContain('Kerala');
    expect(textContent).toContain('BSc');
    expect(textContent).toContain('Engineering');
  });

  it('does not try to create a conversation before opening the chat composer', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<UserDetailScreen />);
    });
    await act(async () => {});

    await act(async () => {
      await findTouchableByText(renderer!.root, 'Message')?.props.onPress();
    });

    expect(mockShow).not.toHaveBeenCalledWith('error', expect.any(String));
  });

  it('requests photo access when the avatar is locked', async () => {
    mockGetUser.mockResolvedValue({
      id: 'user-2',
      first_name: 'Amina',
      last_name: 'Khan',
      gender: 'Female',
      dob: '1999-01-01',
      avatar_url: null,
      avatar_locked: true,
      photo_access_status: null,
      bio: 'About me',
      interested: false,
    });

    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<UserDetailScreen />);
    });
    await act(async () => {});

    await act(async () => {
      await findTouchableByText(renderer!.root, 'Request Photo Access')?.props.onPress();
    });

    expect(mockRequestPhotoAccess).toHaveBeenCalledWith('user-2');
    expect(mockShow).toHaveBeenCalledWith('success', 'photo access requested');
  });

  it('shows a heads-up when photo access is approved', async () => {
    mockGetUser.mockResolvedValue({
      id: 'user-2',
      first_name: 'Amina',
      last_name: 'Khan',
      gender: 'Female',
      dob: '1999-01-01',
      avatar_url: 'https://cdn.example.com/amina.jpg',
      photo_access_notice: 'Photo access approved',
      bio: 'About me',
    });

    await act(async () => {
      TestRenderer.create(<UserDetailScreen />);
    });
    await act(async () => {});

    expect(Alert.alert).toHaveBeenCalledWith('Photo Access', 'Photo access approved');
  });
});
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
