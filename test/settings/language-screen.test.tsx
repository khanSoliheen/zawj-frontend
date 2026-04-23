/* global jest, describe, it, expect, beforeEach */

import { router } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { setAppLanguage } from '@/i18n';
import LanguageSettings from '@/screens/settings/language';

const mockShow = jest.fn();
const mockTheme = {
  colors: {
    background: '#ffffff',
    link: '#0a84ff',
    gray: '#808080',
    card: '#f5f5f5',
    secondary: '#dddddd',
  },
  sizes: {
    padding: 16,
    s: 8,
    sm: 12,
    m: 16,
    md: 20,
    xl: 24,
    cardRadius: 16,
  },
  assets: {
    arrow: 1,
  },
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'language.title': 'Language',
        'language.description': 'Choose your preferred language. The app will update immediately anywhere translations are available.',
        'language.coverage_note': 'Only part of the app is fully translated right now.',
        'language.english': 'English',
        'language.arabic': 'Arabic',
        'language.urdu': 'Urdu',
        'language.selected': 'Selected',
        'language.updated': 'Language updated',
      })[key] ?? key,
    i18n: {
      t: (key: string) =>
        ({
          'language.updated': 'Language updated',
        })[key] ?? key,
    },
  }),
}));

jest.mock('@/hooks', () => ({
  useToast: () => ({
    show: mockShow,
  }),
  useData: () => ({
    theme: mockTheme,
  }),
}));

jest.mock('@/i18n', () => ({
  __esModule: true,
  getCurrentLanguage: jest.fn(() => 'en'),
  setAppLanguage: jest.fn(),
}));

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & { children?: unknown };

  return {
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Button: ({ children, ...props }: MockComponentProps) => React.createElement('MockButton', props, children),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
  };
});

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll(
      (childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label,
    ).length > 0,
  );

describe('Language settings screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('changes the selected language and shows a toast', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<LanguageSettings />);
    });

    await act(async () => {
      findButtonByLabel(renderer!.root, 'Arabic')?.props.onPress();
    });

    expect(setAppLanguage).toHaveBeenCalledWith('ar');
    expect(mockShow).toHaveBeenCalledWith('success', 'Language updated');
  });

  it('returns to the previous screen from the header button', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<LanguageSettings />);
    });

    const buttons = renderer!.root.findAll((node) => String(node.type) === 'MockButton');

    act(() => {
      buttons[0]?.props.onPress();
    });

    expect(router.back).toHaveBeenCalled();
  });
});
