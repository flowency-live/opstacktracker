/**
 * Device count data for aggregation
 */
export interface DeviceCounts {
  deviceCount: number | null | undefined;
  completedCount: number | null | undefined;
}

/**
 * Aggregated device count result
 */
export interface AggregatedDeviceCounts {
  totalDevices: number;
  totalCompleted: number;
}

/**
 * Aggregate device counts from cohort nodes
 *
 * Sums deviceCount and completedCount from all provided cohorts.
 * Treats null/undefined values as 0.
 *
 * @param cohorts Array of objects with deviceCount and completedCount
 * @returns Aggregated totals
 */
export function aggregateDeviceCounts(
  cohorts: readonly DeviceCounts[]
): AggregatedDeviceCounts {
  const totalDevices = cohorts.reduce(
    (sum, cohort) => sum + (cohort.deviceCount ?? 0),
    0
  );

  const totalCompleted = cohorts.reduce(
    (sum, cohort) => sum + (cohort.completedCount ?? 0),
    0
  );

  return {
    totalDevices,
    totalCompleted,
  };
}

/**
 * Calculate completion percentage
 *
 * Returns percentage of completed devices out of total.
 * Returns 0 if no devices. Rounds to nearest integer.
 * Caps at 100 even if completed exceeds total (defensive).
 *
 * @param completed Number of completed devices
 * @param total Total number of devices
 * @returns Percentage as integer (0-100)
 */
export function calculateCompletionPercentage(
  completed: number,
  total: number
): number {
  if (total === 0) {
    return 0;
  }

  const percentage = Math.round((completed / total) * 100);

  // Cap at 100 (defensive - shouldn't happen with proper validation)
  return Math.min(percentage, 100);
}
