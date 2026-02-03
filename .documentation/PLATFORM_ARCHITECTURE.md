# Cohort Tracker Architecture

**Last Updated**: February 3, 2026
**Owner**: Jason
**Status**: Ready for Implementation

---

## Quick Reference

| Resource | Value |
|----------|-------|
| **Region** | eu-west-2 (London) |
| **Domain** | TBD (cohorttrack.opstack.uk suggested) |
| **Infrastructure** | AWS Amplify Gen 2 |
| **Auth** | Cognito + Google OAuth (single admin: jason@flowency.co.uk) |
| **Database** | DynamoDB (provisioned by Amplify) |
| **Hosting** | Amplify Hosting (S3 + CloudFront) |

---

## Architecture Overview

```
                    [Amplify Hosting]
                    cohorttrack.opstack.uk
                           |
              +------------+------------+
              |                         |
        [React SPA]              [Amplify Data API]
        shadcn/ui + Tailwind     (AppSync GraphQL)
              |                         |
              +------------+------------+
                           |
                    [DynamoDB]
                    cohorttrack-Node
```

### What Amplify Gen 2 Provides

| Layer | Amplify Handles |
|-------|-----------------|
| Auth | Cognito User Pool + Google OAuth federation |
| API | AppSync GraphQL API with auto-generated resolvers |
| Data | DynamoDB table(s) with schema from TypeScript |
| Hosting | S3 + CloudFront with CI/CD |

---

## Authentication

### Single Admin - Google OAuth

| Aspect | Value |
|--------|-------|
| Provider | Cognito with Google OAuth |
| Allowed Email | jason@flowency.co.uk |
| Session | 1 hour access token, 30 day refresh token (Cognito defaults) |

### Future Multi-User (V2+)

- May add users via Cognito username/password (native auth)
- No BA Entra ID integration possible
- Cognito can handle this without schema changes

---

## Data Model

### Node Types

```
organisation → directorate → department → subdepartment → cohort
```

### Node Schema

```typescript
type Node = {
  id: string;                    // UUID
  type: 'organisation' | 'directorate' | 'department' | 'subdepartment' | 'cohort';
  name: string;
  parentId: string | null;       // null for root (organisation)
  status: 'red' | 'amber' | 'green' | 'blue';

  // Contact info
  contact: string | null;
  additionalContacts: string[];  // For multiple contacts
  contactEmail: string | null;

  // Reference numbers (from org chart, NOT device counts)
  headcount: number | null;

  // Cohort-specific fields
  deviceType: 'laptop' | 'sharedDesktop' | 'kiosk' | 'displayUnit' | null;
  deviceCount: number | null;    // Total devices (target)
  completedCount: number | null; // Devices upgraded (progress)
  location: string | null;       // Physical location (for non-laptop cohorts)

  // External links
  confluenceUrl: string | null;
  jiraUrl: string | null;
  notes: string | null;

  // Timestamps
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
};
```

### Status Model

| Status | Meaning | Colour |
|--------|---------|--------|
| red | Not engaged / Unknown / Blocked | Red |
| amber | Engaged / Work in progress | Amber |
| green | Planned / Confirmed | Green |
| blue | Completed | Blue |

**Default = RED**

Status is **manually set** at all levels (not auto-calculated from completion %).

### Status Roll-Up Logic

Computed on read (not stored). Parent status based on children:

```typescript
function calculateRollupStatus(children: Node[]): Status {
  if (children.some(c => c.status === 'red')) return 'red';
  if (children.some(c => c.status === 'amber')) return 'amber';
  if (children.every(c => c.status === 'blue')) return 'blue';
  return 'green';
}
```

Manual override at non-cohort levels is temporary - recalculated on any child change.

### Device Count Aggregation

Computed on read. Parent device counts = sum of descendant cohort counts:

```typescript
function aggregateDeviceCounts(node: TreeNode): { total: number; completed: number } {
  if (node.type === 'cohort') {
    return {
      total: node.deviceCount || 0,
      completed: node.completedCount || 0
    };
  }

  return node.children.reduce((acc, child) => {
    const childCounts = aggregateDeviceCounts(child);
    return {
      total: acc.total + childCounts.total,
      completed: acc.completed + childCounts.completed
    };
  }, { total: 0, completed: 0 });
}
```

---

## Frontend

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix primitives) |
| State | Amplify client (auto-generated) + React Query |
| Theme | Dark (MS Teams inspired), minimal branding |

### UX Design

**Interactive tree only** - no detail panels or pages.

| Interaction | Behaviour |
|-------------|-----------|
| Click node | Expand/collapse children |
| Edit | Context menu or inline edit button |
| Node display | Name, contact, RAGB colour, device count rollup, link icons |

**Desktop only** - no mobile/tablet support.

### Key Components

| Component | Purpose |
|-----------|---------|
| TreeView | Hierarchical node display with expand/collapse |
| NodeRow | Single node with status colour, counts, actions |
| EditDialog | Modal for editing node details |
| Dashboard | Summary stats (total devices, completion %, by status) |
| SearchBar | Search nodes by name/contact |
| FilterBar | Filter by status (red only, red+amber, etc.) |

---

## Operations

### Node Deletion

**Cascade delete** with warning and confirmation. UI must show what will be deleted (e.g., "This will delete 3 sub-departments and 12 cohorts").

### Seed Data

Initial data in `.documentation/seed-data.json` - import script loads into DynamoDB on first deploy.

### Backup

DynamoDB point-in-time recovery (PITR) - no additional backup strategy needed.

---

## V1 Scope

- [x] Hierarchy tree UI (expand/collapse)
- [x] RAGB status at all levels
- [x] Status roll-up logic (computed)
- [x] Device count aggregation (computed)
- [x] Cohort editing (device type, counts, location)
- [x] Search by name/contact
- [x] Filter by status
- [x] Dashboard summary
- [x] Cognito Google OAuth (single admin)
- [x] Seed data import

## V2 Scope (Future)

- [ ] Progress trend / burn-down charts
- [ ] Audit trail (who changed what/when)
- [ ] CSV import/export
- [ ] Additional users (username/password)

---

## Key Files

| File | Purpose |
|------|---------|
| `amplify/` | Amplify Gen 2 backend definition |
| `amplify/data/resource.ts` | Data model schema |
| `amplify/auth/resource.ts` | Auth configuration |
| `src/` | React frontend source |
| `.documentation/seed-data.json` | Initial hierarchy data |
| `.documentation/cohorttrackerprd.md` | Product requirements |
| `.documentation/REFINEMENT-SESSION.md` | All decisions from refinement |

---

## Amplify Gen 2 Setup

```bash
# Initialize (if not already done)
npm create amplify@latest

# Local development
npx ampx sandbox

# Deploy to cloud
npx ampx pipeline-deploy --branch main
```

### amplify/data/resource.ts (Example)

```typescript
import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Node: a.model({
    name: a.string().required(),
    type: a.enum(['organisation', 'directorate', 'department', 'subdepartment', 'cohort']),
    parentId: a.string(),
    status: a.enum(['red', 'amber', 'green', 'blue']),
    contact: a.string(),
    additionalContacts: a.string().array(),
    contactEmail: a.string(),
    headcount: a.integer(),
    deviceType: a.enum(['laptop', 'sharedDesktop', 'kiosk', 'displayUnit']),
    deviceCount: a.integer(),
    completedCount: a.integer(),
    location: a.string(),
    confluenceUrl: a.string(),
    jiraUrl: a.string(),
    notes: a.string(),
  })
  .authorization(allow => [allow.authenticated()])
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema });
```

---

*This document is the single source of truth for CohortTrack architecture.*
