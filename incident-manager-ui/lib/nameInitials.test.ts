import { nameInitials } from './nameInitials';

describe('nameInitials', () => {
  it.each([
    ['Jane Analyst', 'JA'],
    ['jane', 'J'],
    ['Mary Jane Watson', 'MJ'],
    ['', ''],
  ])('%p -> %p', (name, expected) => {
    expect(nameInitials(name)).toBe(expected);
  });
});
