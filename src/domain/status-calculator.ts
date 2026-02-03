import type { Status } from './node.schema';

/**
 * Status priority order (worst to best)
 * Red > Amber > Green > Blue
 */
const STATUS_PRIORITY: Record<Status, number> = {
  red: 0, // Worst - highest priority
  amber: 1,
  green: 2,
  blue: 3, // Best - lowest priority
};

/**
 * Get the worst (highest priority) status between two statuses
 *
 * @param a First status
 * @param b Second status
 * @returns The worse of the two statuses
 */
export function getWorstStatus(a: Status, b: Status): Status {
  return STATUS_PRIORITY[a] < STATUS_PRIORITY[b] ? a : b;
}

/**
 * Calculate the aggregated status from child statuses
 *
 * Rules (RAGB model):
 * - Returns 'red' if any child is red
 * - Returns 'amber' if any child is amber (no red)
 * - Returns 'green' if any child is green (no red/amber)
 * - Returns 'blue' only if ALL children are blue
 * - Returns fallback (default: 'red') if no children
 *
 * @param childStatuses Array of status values from child nodes
 * @param fallback Status to return if no children (default: 'red')
 * @returns Calculated status based on children
 */
export function calculateStatus(
  childStatuses: readonly Status[],
  fallback: Status = 'red'
): Status {
  // Empty children - return fallback (leaf node uses own status)
  if (childStatuses.length === 0) {
    return fallback;
  }

  // Check for red first (worst case)
  if (childStatuses.some((status) => status === 'red')) {
    return 'red';
  }

  // Check for amber (second worst)
  if (childStatuses.some((status) => status === 'amber')) {
    return 'amber';
  }

  // Check if all are blue (best case)
  if (childStatuses.every((status) => status === 'blue')) {
    return 'blue';
  }

  // Otherwise green
  return 'green';
}
