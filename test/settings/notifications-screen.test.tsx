/* global jest, describe, it, expect, beforeEach */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockGetNotificationSettings = jest.fn();
const mockUpdateNotificationSettings = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    secondary: '#d1d1d6',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    md: 20,
  },
  assets: {
    arrow: 1,
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

jest.mock('@/services/settings', () => ({
  __esModule: true,
  default: {
    getNotificationSettings: (...args: unknown[]) => mockGetNotificationSettings(...args),
    updateNotificationSettings: (...args: unknown[]) => mockUpdateNotificationSettings(...args),
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
    Switch: (props: Record<string, unknown>) => React.createElement('MockSwitch', props),
  };
});

import NotificationSettings from '@/screens/settings/notifications';

describe('NotificationSettings screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNotificationSettings.mockResolvedValue({
      push: true,
      messages: true,
      marketing: false,
      sounds: false,
    });
    mockUpdateNotificationSettings.mockResolvedValue({
      push: true,
      messages: true,
      marketing: true,
      sounds: false,
    });
  });

  it('saves notification preference toggles', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<NotificationSettings />);
    });
    await act(async () => {});

    const switches = renderer!.root.findAll((node) => String(node.type) === 'MockSwitch');

    await act(async () => {
      await switches[2]?.props.onPress(true);
    });

    expect(mockUpdateNotificationSettings).toHaveBeenCalledWith({
      push: true,
      messages: true,
      marketing: true,
      sounds: false,
    });
    expect(mockShow).toHaveBeenCalledWith('success', 'Notification preferences saved');
  });
});
