import { z } from 'zod';

/**
 * Node Types - 5-level hierarchy
 */
export const NodeTypeSchema = z.enum([
  'organisation',
  'directorate',
  'department',
  'subdepartment',
  'cohort',
]);

export type NodeType = z.infer<typeof NodeTypeSchema>;

/**
 * Status - RAGB model
 * - red: Not engaged / Unknown / Blocked
 * - amber: Engaged / Work in progress
 * - green: Planned / Confirmed
 * - blue: Completed
 */
export const StatusSchema = z.enum(['red', 'amber', 'green', 'blue']);

export type Status = z.infer<typeof StatusSchema>;

/**
 * Device Types - Cohort-specific
 */
export const DeviceTypeSchema = z.enum([
  'laptop',
  'sharedDesktop',
  'kiosk',
  'displayUnit',
]);

export type DeviceType = z.infer<typeof DeviceTypeSchema>;

/**
 * Base Node Schema - Single DynamoDB table model
 *
 * Status roll-up and device count aggregation are computed on read.
 */
export const BaseNodeSchema = z.object({
  // Core fields
  id: z.string().uuid().optional(),
  type: NodeTypeSchema,
  name: z.string().min(1),
  parentId: z.string().nullable().optional(),
  status: StatusSchema,

  // Contact info
  contact: z.string().nullable().optional(),
  additionalContacts: z.array(z.string()).optional(),
  contactEmail: z.string().email().nullable().optional(),

  // Reference (org chart headcount, NOT device count)
  headcount: z.number().int().nonnegative().nullable().optional(),

  // Cohort-specific fields
  deviceType: DeviceTypeSchema.nullable().optional(),
  deviceCount: z.number().int().nonnegative().nullable().optional(),
  completedCount: z.number().int().nonnegative().nullable().optional(),
  location: z.string().nullable().optional(),

  // External links
  confluenceUrl: z.string().url().nullable().optional(),
  jiraUrl: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),

  // Timestamps (ISO 8601)
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * Node Schema with refinements for validation rules
 */
export const NodeSchema = BaseNodeSchema.refine(
  (data) => {
    // If both deviceCount and completedCount are provided,
    // completedCount must not exceed deviceCount
    if (
      data.deviceCount !== null &&
      data.deviceCount !== undefined &&
      data.completedCount !== null &&
      data.completedCount !== undefined
    ) {
      return data.completedCount <= data.deviceCount;
    }
    return true;
  },
  {
    message: 'completedCount cannot exceed deviceCount',
    path: ['completedCount'],
  }
);

export type Node = z.infer<typeof BaseNodeSchema>;

/**
 * Input schema for creating new nodes
 */
export const CreateNodeInputSchema = BaseNodeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  status: true,
  parentId: true,
  contact: true,
  additionalContacts: true,
  contactEmail: true,
  headcount: true,
  deviceType: true,
  deviceCount: true,
  completedCount: true,
  location: true,
  confluenceUrl: true,
  jiraUrl: true,
  notes: true,
});

export type CreateNodeInput = z.infer<typeof CreateNodeInputSchema>;

/**
 * Factory function to create a new Node with defaults
 */
export function createNode(input: CreateNodeInput): Node {
  const now = new Date().toISOString();

  return NodeSchema.parse({
    id: crypto.randomUUID(),
    type: input.type,
    name: input.name,
    parentId: input.parentId ?? null,
    status: input.status ?? 'red',
    contact: input.contact ?? null,
    additionalContacts: input.additionalContacts ?? [],
    contactEmail: input.contactEmail ?? null,
    headcount: input.headcount ?? null,
    deviceType: input.deviceType ?? null,
    deviceCount: input.deviceCount ?? null,
    completedCount: input.completedCount ?? null,
    location: input.location ?? null,
    confluenceUrl: input.confluenceUrl ?? null,
    jiraUrl: input.jiraUrl ?? null,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
  });
}
