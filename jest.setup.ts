/* global jest */

import 'react-native-gesture-handler/jestSetup';

type MockComponentProps = Record<string, unknown> & {
  children?: unknown;
};

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    LinearGradient: ({ children, ...props }: MockComponentProps) =>
      React.createElement(View, props, children),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    BlurView: ({ children, ...props }: MockComponentProps) =>
      React.createElement(View, props, children),
  };
});

jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Link: ({ children }: MockComponentProps) => React.createElement(View, null, children),
    Slot: () => React.createElement(View, { testID: 'slot' }),
    Stack: () => React.createElement(View, { testID: 'stack' }),
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    })),
    useSegments: jest.fn(() => []),
    useRootNavigationState: jest.fn(() => ({ key: 'root' })),
    useLocalSearchParams: jest.fn(() => ({})),
  };
});

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
