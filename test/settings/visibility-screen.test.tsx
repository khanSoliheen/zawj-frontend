/* global jest, describe, it, expect, beforeEach */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockGetVisibilitySettings = jest.fn();
const mockUpdateVisibilitySettings = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    secondary: '#d1d1d6',
    text: '#111111',
    primary: '#111111',
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
    getVisibilitySettings: (...args: unknown[]) => mockGetVisibilitySettings(...args),
    updateVisibilitySettings: (...args: unknown[]) => mockUpdateVisibilitySettings(...args),
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
    SelectInput: (props: Record<string, unknown>) => React.createElement('MockSelectInput', props),
  };
});

import ProfileVisibilitySettings from '@/screens/settings/visibility';

describe('ProfileVisibilitySettings screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVisibilitySettings.mockResolvedValue({
      discoverable: true,
      messages_from: 'matches',
      read_receipts: true,
      photo_visibility: 'approved_only',
    });
    mockUpdateVisibilitySettings.mockResolvedValue({
      discoverable: false,
      messages_from: 'matches',
      read_receipts: true,
      photo_visibility: 'approved_only',
    });
  });

  it('saves discoverability changes', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ProfileVisibilitySettings />);
    });
    await act(async () => {});

    const switches = renderer!.root.findAll((node) => String(node.type) === 'MockSwitch');

    await act(async () => {
      await switches[0]?.props.onPress(false);
    });

    expect(mockUpdateVisibilitySettings).toHaveBeenCalledWith({
      discoverable: false,
      messages_from: 'matches',
      read_receipts: true,
      photo_visibility: 'approved_only',
    });
    expect(mockShow).toHaveBeenCalledWith('success', 'Privacy updated');
  });

  it('saves who can message me preference changes', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ProfileVisibilitySettings />);
    });
    await act(async () => {});

    const selects = renderer!.root.findAll((node) => String(node.type) === 'MockSelectInput');
    const messagesSelect = selects[0];

    await act(async () => {
      await messagesSelect?.props.onChange('Everyone');
    });

    expect(mockUpdateVisibilitySettings).toHaveBeenCalledWith({
      discoverable: true,
      messages_from: 'everyone',
      read_receipts: true,
      photo_visibility: 'approved_only',
    });
    expect(mockShow).toHaveBeenCalledWith('success', 'Privacy updated');
  });

  it('saves photo visibility changes', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ProfileVisibilitySettings />);
    });
    await act(async () => {});

    const selects = renderer!.root.findAll((node) => String(node.type) === 'MockSelectInput');
    const select = selects[1];

    await act(async () => {
      await select.props.onChange('Hidden');
    });

    expect(mockUpdateVisibilitySettings).toHaveBeenCalledWith({
      discoverable: true,
      messages_from: 'matches',
      read_receipts: true,
      photo_visibility: 'hidden',
    });
  });
});
