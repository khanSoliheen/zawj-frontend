/* global jest, describe, it, expect, beforeEach */

import { router, useRouter } from 'expo-router';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};
const mockSetData = jest.fn();
const mockRegistrationData = {
  visibility: 'Public',
  gender: 'Male',
  marital_status: 'Single',
  religion: 'Islam',
  prayer_regularity: '5x daily',
  hijab_or_beard: 'Yes',
};
const mockTheme = {
  colors: {
    background: '#ffffff',
    text: '#111111',
  },
  sizes: {
    s: 8,
    xs: 4,
    md: 20,
  },
  gradients: {
    primary: ['#111111', '#333333'],
  },
  assets: {
    arrow: 1,
  },
};

jest.mock('@/hooks', () => ({
  useData: () => ({
    theme: mockTheme,
  }),
}));

jest.mock('@/store/registration', () => ({
  useRegistrationStore: () => ({
    setData: mockSetData,
    data: mockRegistrationData,
  }),
}));

jest.mock('@/components', () => {
  const React = require('react');
  type MockComponentProps = Record<string, unknown> & { children?: unknown };

  return {
    Block: ({ children, ...props }: MockComponentProps) => React.createElement('MockBlock', props, children),
    Button: ({ children, ...props }: MockComponentProps) => React.createElement('MockButton', props, children),
    Image: (props: Record<string, unknown>) => React.createElement('MockImage', props),
    Input: (props: Record<string, unknown>) => React.createElement('MockInput', props),
    SelectInput: (props: Record<string, unknown>) => React.createElement('MockSelectInput', props),
    Text: ({ children, ...props }: MockComponentProps) => React.createElement('MockText', props, children),
    DatePicker: (props: Record<string, unknown>) => React.createElement('MockDatePicker', props),
  };
});

import Step1 from '@/(auth)/register/step1';
import Step2 from '@/(auth)/register/step2';
import Step3 from '@/(auth)/register/step3';
import Step4 from '@/(auth)/register/step4';
import { ROUTES } from '@/constants/routes';

const mockUseRouter = useRouter as unknown as jest.Mock;

const findInputByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockInput').find((node) => node.props.label === label);

const findSelectByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockSelectInput').find((node) => node.props.label === label);

const findDatePickerByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockDatePicker').find((node) => node.props.label === label);

const findButtonByLabel = (root: TestRenderer.ReactTestInstance, label: string) =>
  root.findAll((node) => String(node.type) === 'MockButton').find((buttonNode) =>
    buttonNode.findAll((childNode) => String(childNode.type) === 'MockText' && childNode.children.join('') === label).length > 0,
  );

describe('Register steps 1-4', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  it('stores step 1 values and strips confirm_password before routing forward', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Step1 />);
    });

    act(() => {
      findInputByLabel(renderer!.root, 'Email')?.props.onChangeText('step1@example.com');
      findInputByLabel(renderer!.root, 'First Name')?.props.onChangeText('Amina');
      findInputByLabel(renderer!.root, 'Last Name')?.props.onChangeText('Ali');
      findInputByLabel(renderer!.root, 'Country')?.props.onChangeText('India');
      findInputByLabel(renderer!.root, 'State')?.props.onChangeText('Kerala');
      findInputByLabel(renderer!.root, 'City')?.props.onChangeText('Kochi');
      findInputByLabel(renderer!.root, 'Password')?.props.onChangeText('secret123');
      findInputByLabel(renderer!.root, 'Confirm Password')?.props.onChangeText('secret123');
      findSelectByLabel(renderer!.root, 'Gender')?.props.onChange('Female');
      findSelectByLabel(renderer!.root, 'Visibility')?.props.onChange('Matched Only');
      findDatePickerByLabel(renderer!.root, 'Date of Birth')?.props.onChange('1995-01-01');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Next')?.props.onPress();
    });

    expect(mockSetData).toHaveBeenCalledWith({
      email: 'step1@example.com',
      first_name: 'Amina',
      last_name: 'Ali',
      gender: 'Female',
      dob: '1995-01-01',
      country: 'India',
      state: 'Kerala',
      city: 'Kochi',
      visibility: 'Matched Only',
      password: 'secret123',
    });
    expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.REGISTER_STEP_2);
  });

  it('stores step 2 career details', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Step2 />);
    });

    act(() => {
      findInputByLabel(renderer!.root, 'Education')?.props.onChangeText('Bachelors');
      findInputByLabel(renderer!.root, 'Employment Type')?.props.onChangeText('Private');
      findInputByLabel(renderer!.root, 'Department')?.props.onChangeText('Engineering');
      findInputByLabel(renderer!.root, 'Designation')?.props.onChangeText('Developer');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Next')?.props.onPress();
    });

    expect(mockSetData).toHaveBeenCalledWith({
      education: 'Bachelors',
      employment_type: 'Private',
      department: 'Engineering',
      designation: 'Developer',
    });
    expect(router.push).toHaveBeenCalledWith(ROUTES.REGISTER_STEP_3);
  });

  it('shows and stores the marital children fields when required', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Step3 />);
    });

    act(() => {
      findSelectByLabel(renderer!.root, 'Marital Status')?.props.onChange('Married');
    });

    expect(findInputByLabel(renderer!.root, 'Number of Children')).toBeDefined();
    expect(findInputByLabel(renderer!.root, 'Children Details (ages, gender, custody)')).toBeDefined();

    act(() => {
      findInputByLabel(renderer!.root, 'Number of Children')?.props.onChangeText('2');
      findInputByLabel(renderer!.root, 'Children Details (ages, gender, custody)')?.props.onChangeText('2 daughters');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Next')?.props.onPress();
    });

    expect(mockSetData).toHaveBeenCalledWith({
      marital_status: 'Married',
      children_count: '2',
      children_details: '2 daughters',
    });
    expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.REGISTER_STEP_4);
  });

  it('stores step 4 Islamic identity details', async () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    await act(async () => {
      renderer = TestRenderer.create(<Step4 />);
    });

    act(() => {
      findSelectByLabel(renderer!.root, 'Religion')?.props.onChange('Islam');
      findSelectByLabel(renderer!.root, 'Prayer Regularity')?.props.onChange('Regularly');
      findInputByLabel(renderer!.root, 'Qur\'an Level')?.props.onChangeText('Intermediate');
      findInputByLabel(renderer!.root, 'Wali Name (if female)')?.props.onChangeText('Ahmad');
      findInputByLabel(renderer!.root, 'Wali Relation')?.props.onChangeText('Brother');
      findInputByLabel(renderer!.root, 'Wali Contact')?.props.onChangeText('+919999999999');
      findSelectByLabel(renderer!.root, 'Hijab (for women) / Beard (for men)')?.props.onChange('Yes');
    });

    await act(async () => {
      await findButtonByLabel(renderer!.root, 'Next')?.props.onPress();
    });

    expect(mockSetData).toHaveBeenCalledWith({
      religion: 'Islam',
      wali_name: 'Ahmad',
      wali_relation: 'Brother',
      wali_contact: '+919999999999',
      prayer_regularity: 'Regularly',
      quran_level: 'Intermediate',
      hijab_or_beard: 'Yes',
    });
    expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.REGISTER_STEP_5);
  });
});
