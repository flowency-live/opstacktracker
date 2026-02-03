import { describe, it, expect } from 'vitest';
import { calculateStatus, getWorstStatus } from './status-calculator';
import type { Status } from './node.schema';

describe('Status Calculator', () => {
  describe('calculateStatus', () => {
    it('returns red if any child is red', () => {
      const childStatuses: Status[] = ['green', 'red', 'amber'];
      expect(calculateStatus(childStatuses)).toBe('red');
    });

    it('returns red if only one child is red among all blue', () => {
      const childStatuses: Status[] = ['blue', 'blue', 'red', 'blue'];
      expect(calculateStatus(childStatuses)).toBe('red');
    });

    it('returns amber if any child is amber (no red)', () => {
      const childStatuses: Status[] = ['green', 'amber', 'blue'];
      expect(calculateStatus(childStatuses)).toBe('amber');
    });

    it('returns amber if multiple children are amber (no red)', () => {
      const childStatuses: Status[] = ['amber', 'amber', 'green'];
      expect(calculateStatus(childStatuses)).toBe('amber');
    });

    it('returns green if all children are green (no red/amber)', () => {
      const childStatuses: Status[] = ['green', 'green', 'green'];
      expect(calculateStatus(childStatuses)).toBe('green');
    });

    it('returns green if children are mix of green and blue', () => {
      const childStatuses: Status[] = ['green', 'blue', 'green'];
      expect(calculateStatus(childStatuses)).toBe('green');
    });

    it('returns blue only if ALL children are blue', () => {
      const childStatuses: Status[] = ['blue', 'blue', 'blue'];
      expect(calculateStatus(childStatuses)).toBe('blue');
    });

    it('returns blue for single blue child', () => {
      const childStatuses: Status[] = ['blue'];
      expect(calculateStatus(childStatuses)).toBe('blue');
    });

    it('returns the fallback status for empty children array', () => {
      expect(calculateStatus([], 'red')).toBe('red');
      expect(calculateStatus([], 'amber')).toBe('amber');
      expect(calculateStatus([], 'green')).toBe('green');
      expect(calculateStatus([], 'blue')).toBe('blue');
    });

    it('defaults to red fallback when no children and no fallback specified', () => {
      expect(calculateStatus([])).toBe('red');
    });
  });

  describe('getWorstStatus', () => {
    it('ranks red as worst status', () => {
      expect(getWorstStatus('red', 'amber')).toBe('red');
      expect(getWorstStatus('red', 'green')).toBe('red');
      expect(getWorstStatus('red', 'blue')).toBe('red');
    });

    it('ranks amber as second worst status', () => {
      expect(getWorstStatus('amber', 'green')).toBe('amber');
      expect(getWorstStatus('amber', 'blue')).toBe('amber');
    });

    it('ranks green as third', () => {
      expect(getWorstStatus('green', 'blue')).toBe('green');
    });

    it('returns blue when both are blue', () => {
      expect(getWorstStatus('blue', 'blue')).toBe('blue');
    });

    it('is commutative - order does not matter', () => {
      expect(getWorstStatus('amber', 'red')).toBe('red');
      expect(getWorstStatus('green', 'amber')).toBe('amber');
      expect(getWorstStatus('blue', 'green')).toBe('green');
    });
  });

  describe('Status priority order', () => {
    it('follows RAGB model: Red > Amber > Green > Blue', () => {
      // Red is highest priority (worst)
      expect(calculateStatus(['red'])).toBe('red');
      expect(calculateStatus(['amber', 'red'])).toBe('red');
      expect(calculateStatus(['green', 'amber', 'red'])).toBe('red');
      expect(calculateStatus(['blue', 'green', 'amber', 'red'])).toBe('red');

      // Then Amber
      expect(calculateStatus(['amber'])).toBe('amber');
      expect(calculateStatus(['green', 'amber'])).toBe('amber');
      expect(calculateStatus(['blue', 'green', 'amber'])).toBe('amber');

      // Then Green
      expect(calculateStatus(['green'])).toBe('green');
      expect(calculateStatus(['blue', 'green'])).toBe('green');

      // Blue only when all are Blue
      expect(calculateStatus(['blue'])).toBe('blue');
    });
  });
});
