import { describe, it, expect } from 'vitest';
import {
  aggregateDeviceCounts,
  calculateCompletionPercentage,
  type DeviceCounts,
} from './device-aggregator';
import { createNode } from './node.schema';

describe('Device Aggregator', () => {
  describe('aggregateDeviceCounts', () => {
    it('sums deviceCount from all cohort nodes', () => {
      const cohorts: DeviceCounts[] = [
        { deviceCount: 10, completedCount: 5 },
        { deviceCount: 20, completedCount: 15 },
        { deviceCount: 5, completedCount: 3 },
      ];

      const result = aggregateDeviceCounts(cohorts);

      expect(result.totalDevices).toBe(35);
    });

    it('sums completedCount from all cohort nodes', () => {
      const cohorts: DeviceCounts[] = [
        { deviceCount: 10, completedCount: 5 },
        { deviceCount: 20, completedCount: 15 },
        { deviceCount: 5, completedCount: 3 },
      ];

      const result = aggregateDeviceCounts(cohorts);

      expect(result.totalCompleted).toBe(23);
    });

    it('returns 0 for nodes without cohort descendants', () => {
      const result = aggregateDeviceCounts([]);

      expect(result.totalDevices).toBe(0);
      expect(result.totalCompleted).toBe(0);
    });

    it('handles null deviceCount as 0', () => {
      const cohorts: DeviceCounts[] = [
        { deviceCount: null, completedCount: null },
        { deviceCount: 10, completedCount: 5 },
      ];

      const result = aggregateDeviceCounts(cohorts);

      expect(result.totalDevices).toBe(10);
      expect(result.totalCompleted).toBe(5);
    });

    it('handles null completedCount as 0', () => {
      const cohorts: DeviceCounts[] = [
        { deviceCount: 10, completedCount: null },
        { deviceCount: 20, completedCount: 15 },
      ];

      const result = aggregateDeviceCounts(cohorts);

      expect(result.totalDevices).toBe(30);
      expect(result.totalCompleted).toBe(15);
    });

    it('handles undefined values as 0', () => {
      const cohorts: DeviceCounts[] = [
        { deviceCount: undefined, completedCount: undefined },
        { deviceCount: 10, completedCount: 5 },
      ];

      const result = aggregateDeviceCounts(cohorts);

      expect(result.totalDevices).toBe(10);
      expect(result.totalCompleted).toBe(5);
    });

    it('handles single cohort', () => {
      const cohorts: DeviceCounts[] = [{ deviceCount: 100, completedCount: 75 }];

      const result = aggregateDeviceCounts(cohorts);

      expect(result.totalDevices).toBe(100);
      expect(result.totalCompleted).toBe(75);
    });

    it('handles all null values', () => {
      const cohorts: DeviceCounts[] = [
        { deviceCount: null, completedCount: null },
        { deviceCount: null, completedCount: null },
      ];

      const result = aggregateDeviceCounts(cohorts);

      expect(result.totalDevices).toBe(0);
      expect(result.totalCompleted).toBe(0);
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('calculates correct percentage', () => {
      expect(calculateCompletionPercentage(50, 100)).toBe(50);
      expect(calculateCompletionPercentage(25, 100)).toBe(25);
      expect(calculateCompletionPercentage(75, 100)).toBe(75);
    });

    it('returns 0 when no devices', () => {
      expect(calculateCompletionPercentage(0, 0)).toBe(0);
    });

    it('returns 100 when all devices completed', () => {
      expect(calculateCompletionPercentage(100, 100)).toBe(100);
    });

    it('rounds to nearest integer', () => {
      expect(calculateCompletionPercentage(1, 3)).toBe(33); // 33.33...
      expect(calculateCompletionPercentage(2, 3)).toBe(67); // 66.66...
    });

    it('handles partial completion', () => {
      expect(calculateCompletionPercentage(23, 35)).toBe(66); // 65.71...
    });

    it('returns 0 when completed is 0', () => {
      expect(calculateCompletionPercentage(0, 100)).toBe(0);
    });

    it('caps at 100 even if completed exceeds total', () => {
      // This shouldn't happen due to schema validation, but defensive
      expect(calculateCompletionPercentage(110, 100)).toBe(100);
    });
  });

  describe('Integration with Node type', () => {
    it('aggregates device counts from Node objects', () => {
      const cohort1 = createNode({
        type: 'cohort',
        name: 'Senior Managers',
        status: 'amber',
        deviceType: 'laptop',
        deviceCount: 25,
        completedCount: 10,
      });

      const cohort2 = createNode({
        type: 'cohort',
        name: 'Operations Team',
        status: 'red',
        deviceType: 'laptop',
        deviceCount: 50,
        completedCount: 0,
      });

      const cohorts: DeviceCounts[] = [
        { deviceCount: cohort1.deviceCount, completedCount: cohort1.completedCount },
        { deviceCount: cohort2.deviceCount, completedCount: cohort2.completedCount },
      ];

      const result = aggregateDeviceCounts(cohorts);

      expect(result.totalDevices).toBe(75);
      expect(result.totalCompleted).toBe(10);
    });
  });
});
