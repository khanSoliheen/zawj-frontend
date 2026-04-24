/* global describe, it, expect */

import { toUserMessage } from '@/utils/errors';

describe('toUserMessage', () => {
  it('strips backend error prefixes', () => {
    expect(toUserMessage(new Error('validation error: Missing user id.'), 'Fallback')).toBe('Missing user id.');
    expect(toUserMessage(new Error('internal error: failed to load'), 'Fallback')).toBe('failed to load');
  });

  it('returns the fallback for empty or unknown errors', () => {
    expect(toUserMessage(new Error('   '), 'Fallback')).toBe('Fallback');
    expect(toUserMessage('bad', 'Fallback')).toBe('Fallback');
  });
});
