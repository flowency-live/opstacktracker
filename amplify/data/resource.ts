import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * CohortTrack Data Schema
 *
 * Single-table design for hierarchical node storage.
 * Status roll-up and device count aggregation computed on read.
 *
 * Node Types (5 levels):
 * - organisation (root)
 * - directorate
 * - department
 * - subdepartment
 * - cohort (leaf - has device tracking)
 *
 * Status (RAGB model):
 * - red: Not engaged / Unknown / Blocked
 * - amber: Engaged / Work in progress
 * - green: Planned / Confirmed
 * - blue: Completed
 *
 * @see https://docs.amplify.aws/react/build-a-backend/data/
 */

const schema = a.schema({
  Node: a
    .model({
      // Core fields
      type: a.enum(['organisation', 'directorate', 'department', 'subdepartment', 'cohort']),
      name: a.string().required(),
      parentId: a.string(),
      status: a.enum(['red', 'amber', 'green', 'blue']),

      // Contact info
      contact: a.string(),
      additionalContacts: a.string().array(),
      contactEmail: a.string(),

      // Reference (org chart headcount, NOT device count)
      headcount: a.integer(),

      // Cohort-specific fields
      deviceType: a.enum(['laptop', 'sharedDesktop', 'kiosk', 'displayUnit']),
      deviceCount: a.integer(),
      completedCount: a.integer(),
      location: a.string(),

      // External links
      confluenceUrl: a.string(),
      jiraUrl: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.authenticated()])
    .secondaryIndexes((index) => [
      // GSI for efficient parent-child queries
      index('parentId').sortKeys(['type']).name('byParent'),
      // GSI for querying by type
      index('type').sortKeys(['name']).name('byType'),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
