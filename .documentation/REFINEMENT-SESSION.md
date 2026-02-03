# Cohort Tracker - Refinement Session

## Session Purpose
Clarify all open questions before beginning implementation.

---

## Status Legend
- ⬜ Not discussed
- 🟡 In progress
- ✅ Resolved

---

## 1. Seed Data
**Status:** ✅ Complete

Captured from MS Teams org chart screenshots → [seed-data.json](seed-data.json)

### Summary
- **Organisation:** British Airways
- **Directorate:** Heathrow Operations (TM) - Tom Moran
- **8 Departments** captured with sub-departments and contacts
- **Statuses:** RED (not engaged), AMBER (engaged), GREEN (planned), BLUE (complete)
- **Headcounts** captured (org chart numbers, not device counts)

---

## 2. Architecture & Infrastructure Questions

### 2.1 Existing AWS Setup ✅
> Do you have an existing AWS account with Cognito, or should I provision everything from scratch? Is there an existing domain/Route53 hosted zone for this?

**Answer:** All existing. Use existing AWS account (771551874768), eu-west-2 region, opstack.uk domain. Follow RelayPlatform patterns but simplified for single-tenant admin tool. See [PLATFORM_ARCHITECTURE.md](PLATFORM_ARCHITECTURE.md) for project-specific details.

### 2.2 IaC Preference ✅
> For infrastructure, do you want Terraform, AWS CDK, SAM, or Serverless Framework?

**Answer:** AWS Amplify Gen 2. Simpler than CDK for this use case. Amplify provisions DynamoDB, Cognito (Google OAuth), API, and hosting in one unified deployment. No separate infrastructure management needed.

### 2.3 Monorepo or Separate Repos ✅
> Frontend and backend in one repo, or separate?

**Answer:** Monorepo. Natural pattern for Amplify Gen 2 - frontend and backend in single repo.

---

## 3. Data Model Clarifications

### 3.1 Cohort Category ✅
> The PRD mentions `Users / Location / Shared Estate` - is this a strict enum, or should it be extensible?

**Answer:** Rethinking this. Cohorts are defined by **device type** + **context**:

| Device Type | Context | Example Name | Location |
|-------------|---------|--------------|----------|
| laptop | Job role | "Senior Managers" | n/a |
| sharedDesktop | Build/config | "Standard Desktop" | "T5 Ops Room" |
| kiosk | Purpose | "Check-in Kiosks" | "T5 Departures" |
| displayUnit | Purpose | "Ops Metrics Boards" | "AOCC Wall" |

**Decisions:**
- One device type per cohort (different Intune builds anyway)
- Both `name` and `location` fields needed
- Drop "category" field - device type + name/location is sufficient
- Keep "category" field decision pending for now

### 3.2 Single Organisation ✅
> Will there always be exactly one Organisation node at the root, or could there be multiple organisations in future?

**Answer:** Single organisation (British Airways) with multiple directorates beneath it. Current focus is Heathrow Operations, but will add Gatwick (with Gatwick Ground Services, EuroFlyer, Customer Service), Engineering, and others as peer directorates under BA.

### 3.3 Node Deletion Behaviour ✅
> When deleting a parent node, should children be deleted (cascade) or orphaned/moved?

**Answer:** Cascade delete with warning and confirmation. UI must show what will be deleted (e.g., "This will delete 3 sub-departments and 12 cohorts").

---

## 4. Frontend Specifics

### 4.1 UI Framework/Styling ✅
> Any preference for component library (MUI, Radix, shadcn/ui, etc.) or CSS approach (Tailwind, CSS Modules, styled-components)?

**Answer:** KISS. Dark theme (MS Teams inspired), minimal branding. Use shadcn/ui + Tailwind for speed. No official BA branding - this is an internal tool, not an official BA app.

### 4.2 Tree Interaction ✅
> When a node is clicked, should it expand inline, or open a side panel/modal for details?

**Answer:** Interactive tree only - no detail panels. Click expands/collapses children. The visual IS the information. Each node shows: name, contact, RAGB status colour, device count rollup, link icons to Confluence/Jira. Editing via context menu or edit button, not detail views. Think: interactive org chart with project status overlay.

### 4.3 Mobile Support ✅
> Is this desktop-only, or should it be responsive for tablets/phones?

**Answer:** Desktop only. No mobile/tablet support needed.

---

## 5. Authentication & Authorization

### 5.1 Session Handling ✅
> How long should sessions last before requiring re-authentication?

**Answer:** Use Cognito defaults - 1 hour access token, 30 day refresh token. Silent refresh keeps user logged in as long as browser is open.

### 5.2 Future Multi-User ✅
> The PRD mentions single admin for V1 - should the data model accommodate future multi-user roles, or keep it simple for now?

**Answer:** KISS for V1 (single admin via Google OAuth). Future: may add users via username/password (Cognito native auth) - no BA Entra ID integration possible. Keep data model simple for now, Cognito can handle additional users later without schema changes.

---

## 6. Operational

### 6.1 Seed Data Format ✅
> Do you have existing hierarchy data to import, or will you enter it manually after launch?

**Answer:** Yes, use seed-data.json captured during this session. Build import script to load into DynamoDB on first deploy.

### 6.2 Backup Strategy ✅
> Any requirements for data backup/recovery beyond DynamoDB's built-in features?

**Answer:** No. DynamoDB point-in-time recovery is sufficient.

---

## 7. Additional Questions (Emerging)

### 7.1 Cohort Device Tracking ✅
> How do we track device counts and completion for burn-down charts?

**Answer:** Each cohort needs:
- `deviceCount` - Total devices in this cohort (the target)
- `completedCount` - Devices upgraded to Win11 (progress)

This enables:
- Completion % per cohort: `completedCount / deviceCount`
- Roll-up totals: Sum of all descendant cohort counts
- Burn-down charts (V2): Track `completedCount` over time

**Decisions:**
- Status is **manually set** (not auto-calculated from completion %)
- V1: Manual entry of `deviceCount` and `completedCount` per cohort
- V2: Burn-down charts tracking progress over time (requires history/audit trail - out of scope for V1)

---

## Session Log

| Timestamp | Topic | Decision |
|-----------|-------|----------|
| 2026-02-03 | Session started | Created refinement tracking document |
| 2026-02-03 | Seed data | Captured full hierarchy from org chart images → seed-data.json |
| 2026-02-03 | Q2.1 AWS Setup | Use existing AWS account, follow RelayPlatform patterns |
| 2026-02-03 | Q2.2 IaC | AWS Amplify Gen 2 (simpler than CDK for this use case) |
| 2026-02-03 | Q2.3 Repo | Monorepo |
| 2026-02-03 | Q3.1 Cohorts | Device type + name + location, one type per cohort |
| 2026-02-03 | Q3.2 Organisation | Single org (BA), multiple directorates (Heathrow, Gatwick, Engineering, etc.) |
| 2026-02-03 | Q3.3 Deletion | Cascade with confirmation |
| 2026-02-03 | Q4.1 UI | shadcn/ui + Tailwind, dark theme, minimal branding |
| 2026-02-03 | Q4.2 Tree | Interactive expand/collapse only, no detail panels |
| 2026-02-03 | Q4.3 Mobile | Desktop only |
| 2026-02-03 | Q5.1 Sessions | Cognito defaults |
| 2026-02-03 | Q5.2 Multi-user | KISS for V1, may add username/password users later |
| 2026-02-03 | Q6.1 Seed data | Import script for seed-data.json |
| 2026-02-03 | Q6.2 Backup | DynamoDB PITR sufficient |
| 2026-02-03 | Q7.1 Cohort tracking | deviceCount + completedCount, status manually set |
| 2026-02-03 | **REFINEMENT COMPLETE** | All questions resolved |
| 2026-02-03 | **DOCS UPDATED** | PRD v1.2, PLATFORM_ARCHITECTURE.md updated for new session |

