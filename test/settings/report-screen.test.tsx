/* global jest, describe, it, expect, beforeEach */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import ReportMisconduct from '@/screens/settings/report/[id]';

const mockShow = jest.fn();
const mockCreateReport = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    primary: '#111111',
    text: '#111111',
    danger: '#ff453a',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    m: 16,
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
    createReport: (...args: unknown[]) => mockCreateReport(...args),
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

const mockUseLocalSearchParams = useLocalSearchParams as unknown as jest.Mock;

const findInputByPlaceholder = (root: TestRenderer.ReactTestInstance, placeholder: string) =>
  root.findAll((node) => String(node.type) === 'MockInput').find((node) => node.props.placeholder === placeholder);

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('ReportMisconduct screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ id: 'reported-user-1' });
    mockCreateReport.mockResolvedValue({ message: 'ok' });
  });

  it('submits a misconduct report', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<ReportMisconduct />);
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Harassment')?.props.onPress();
    });

    act(() => {
      findInputByPlaceholder(renderer!.root, 'Describe what happened…')?.props.onChangeText('This report contains enough detail to satisfy the validation rule.');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Submit Report')?.props.onPress();
    });

    expect(mockCreateReport).toHaveBeenCalledWith({
      category: 'Harassment',
      details: 'This report contains enough detail to satisfy the validation rule.',
      reported_user_id: 'reported-user-1',
      contact_ok: true,
    });
    expect(mockShow).toHaveBeenCalledWith('success', 'Report submitted. Our team will review it.');
  });

  it('hides the raw reported user id input when the route already provides a target user', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ReportMisconduct />);
    });

    expect(findInputByPlaceholder(renderer!.root, 'Reported user ID (optional)')).toBeUndefined();
  });

  it('shows the optional reported user id input for the generic report route', async () => {
    mockUseLocalSearchParams.mockReturnValue({});
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<ReportMisconduct />);
    });

    expect(findInputByPlaceholder(renderer!.root, 'Reported user ID (optional)')).toBeDefined();
  });
});
