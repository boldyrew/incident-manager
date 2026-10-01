import { cn, formatDate } from './utils';

describe('cn', () => {
  it('joins classes and resolves Tailwind conflicts', () => {
    expect(cn('px-2', false && 'hidden', 'px-4', { 'text-red-500': true })).toBe('px-4 text-red-500');
  });
});

describe('formatDate', () => {
  it('formats ISO strings and Date objects the same way', () => {
    const iso = '2026-03-15T10:30:45.000Z';
    expect(formatDate(iso)).toBe('15 Mar 2026, 10:30:45');
    expect(formatDate(new Date(iso))).toBe(formatDate(iso));
  });
});
