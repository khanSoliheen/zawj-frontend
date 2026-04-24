/* global jest, describe, it, expect, beforeEach */

import React from 'react';
import { Alert } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

const mockShow = jest.fn();
const mockGetMatchPreferences = jest.fn();
const mockUpdateMatchPreferences = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    success: '#30d158',
    gray: '#808080',
  },
  sizes: {
    s: 8,
    m: 16,
    l: 24,
  },
  gradients: {
    secondary: ['#111111', '#333333'],
  },
};

jest.mock('@/hooks', () => ({
  useData: () => ({
    theme: mockTheme,
  }),
  useToast: () => ({
    show: mockShow,
  }),
}));

jest.mock('@/services/settings', () => ({
  __esModule: true,
  default: {
    getMatchPreferences: (...args: unknown[]) => mockGetMatchPreferences(...args),
    updateMatchPreferences: (...args: unknown[]) => mockUpdateMatchPreferences(...args),
  },
}));

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & { children?: unknown };
  return {
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
    Button: ({ children, ...props }: MockComponentProps) => React.createElement('MockButton', props, children),
    SelectInput: (props: Record<string, unknown>) => React.createElement('MockSelectInput', props),
  };
});

jest.mock('react-native', () => {
  const React = require('react');
  return {
    Alert: {
      alert: jest.fn(),
    },
    ScrollView: ({ children, ...props }: Record<string, unknown> & { children?: unknown }) =>
      React.createElement('MockScrollView', props, children),
  };
});

import Preferences from '@/(tabs)/preferences';

const findInputByPlaceholder = (root: TestRenderer.ReactTestInstance, placeholder: string) =>
  root.findAll((node) => String(node.type) === 'MockInput').find((node) => node.props.placeholder === placeholder);

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('Preferences screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMatchPreferences.mockResolvedValue({
      min_age: 21,
      max_age: 32,
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      education: 'MBA',
      prayer_regularity: 'Regularly',
      quran_level: 'Intermediate',
      marital_status: 'Single',
    });
    mockUpdateMatchPreferences.mockResolvedValue({});
  });

  it('loads saved preferences and sanitizes age input', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<Preferences />);
    });
    await act(async () => {});

    expect(mockGetMatchPreferences).toHaveBeenCalled();
    expect(findInputByPlaceholder(renderer!.root, 'e.g. 20')?.props.value).toBe('21');
    expect(findInputByPlaceholder(renderer!.root, 'e.g. Hyderabad')?.props.value).toBe('Hyderabad');

    act(() => {
      findInputByPlaceholder(renderer!.root, 'e.g. 20')?.props.onChangeText('2o!');
    });

    expect(findInputByPlaceholder(renderer!.root, 'e.g. 20')?.props.value).toBe('2');
  });

  it('shows an alert when the minimum age exceeds the maximum age', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<Preferences />);
    });
    await act(async () => {});

    act(() => {
      findInputByPlaceholder(renderer!.root, 'e.g. 20')?.props.onChangeText('40');
      findInputByPlaceholder(renderer!.root, 'e.g. 35')?.props.onChangeText('30');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Apply Filters')?.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Invalid age range',
      'Minimum age cannot be greater than maximum age.',
    );
  });

  it('saves the preferences payload through the settings service', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<Preferences />);
    });
    await act(async () => {});

    act(() => {
      findInputByPlaceholder(renderer!.root, 'e.g. 20')?.props.onChangeText('24');
      findInputByPlaceholder(renderer!.root, 'e.g. 35')?.props.onChangeText('30');
      findInputByPlaceholder(renderer!.root, 'e.g. India')?.props.onChangeText('Qatar');
      findInputByPlaceholder(renderer!.root, 'e.g. Telangana')?.props.onChangeText('Doha');
      findInputByPlaceholder(renderer!.root, 'e.g. Hyderabad')?.props.onChangeText('Doha');
      findInputByPlaceholder(renderer!.root, 'e.g. MSc, B.Tech, MBA')?.props.onChangeText('BSc');
      findInputByPlaceholder(renderer!.root, 'e.g. Intermediate')?.props.onChangeText('Advanced');
    });

    const selects = renderer!.root.findAll((node) => String(node.type) === 'MockSelectInput');
    act(() => {
      selects[0]?.props.onChange('Married');
      selects[1]?.props.onChange('5x daily');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Apply Filters')?.props.onPress();
    });

    expect(mockUpdateMatchPreferences).toHaveBeenCalledWith({
      min_age: 24,
      max_age: 30,
      country: 'Qatar',
      state: 'Doha',
      city: 'Doha',
      education: 'BSc',
      prayer_regularity: '5x daily',
      quran_level: 'Advanced',
      marital_status: 'Married',
    });
    expect(mockShow).toHaveBeenCalledWith('success', 'Preferences saved');
  });

  it('clears all preferences through the settings service', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderer = TestRenderer.create(<Preferences />);
    });
    await act(async () => {});

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Clear Preferences')?.props.onPress();
    });

    expect(mockUpdateMatchPreferences).toHaveBeenCalledWith({
      min_age: null,
      max_age: null,
      country: null,
      state: null,
      city: null,
      education: null,
      prayer_regularity: null,
      quran_level: null,
      marital_status: null,
    });
    expect(findInputByPlaceholder(renderer!.root, 'e.g. 20')?.props.value).toBe('');
    expect(findInputByPlaceholder(renderer!.root, 'e.g. Hyderabad')?.props.value).toBe('');
    expect(mockShow).toHaveBeenCalledWith('success', 'Preferences cleared');
  });
});
