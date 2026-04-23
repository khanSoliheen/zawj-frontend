/* global describe, it, expect, beforeEach */

import { useRegistrationStore } from '@/store/registration';

describe('registration store', () => {
  beforeEach(() => {
    useRegistrationStore.getState().reset();
  });

  it('merges partial updates into the existing registration state', () => {
    useRegistrationStore.getState().setData({
      first_name: 'Amina',
      email: 'amina@example.com',
      religion: 'Other',
    });

    expect(useRegistrationStore.getState().data).toMatchObject({
      first_name: 'Amina',
      email: 'amina@example.com',
      religion: 'Other',
      marital_status: 'Single',
    });
  });

  it('resets the store back to the initial defaults', () => {
    useRegistrationStore.getState().setData({
      first_name: 'Bilal',
      city: 'Dubai',
      terms_accepted: true,
    });

    useRegistrationStore.getState().reset();

    expect(useRegistrationStore.getState().data).toMatchObject({
      first_name: '',
      city: '',
      terms_accepted: false,
      religion: 'Islam',
      employment_type: '',
    });
  });
});
