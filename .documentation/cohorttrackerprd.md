# Cohort Tracker -- Product Requirements Document (PRD)

## Document Control

-   Version: 1.2
-   Status: Refined -- Ready for Implementation
-   Product Name: Cohort Tracker
-   Date: 2026-02-03
-   See also: REFINEMENT-SESSION.md, PLATFORM_ARCHITECTURE.md

------------------------------------------------------------------------

## 1. Purpose

Provide a simple, scalable, hierarchical tracking tool to monitor
Windows 11 upgrade progress across organisational structures including
Directorates, Departments, Sub-Departments, and Upgrade Cohorts.

The tool must provide real-time RAG-style operational visibility with
automatic roll-up status calculation and minimal administrative
overhead.

------------------------------------------------------------------------

## 2. Problem Statement

Existing tracking methods (spreadsheets, static diagrams, Confluence
pages, PowerPoint decks) fail because:

-   No automatic hierarchy roll-up logic
-   No real-time status visibility
-   High manual maintenance overhead
-   Poor board-level clarity
-   No cohort-level telemetry
-   No device-type visibility

This leads to: - Hidden delivery risk - Late escalation - Poor
forecasting - Weak stakeholder confidence

------------------------------------------------------------------------

## 3. Product Vision

A lightweight operational telemetry surface that provides:

-   Living hierarchical execution map
-   Colour-coded delivery state visibility
-   Automatic roll-up of status and progress
-   Cohort-level operational metadata
-   Device type tracking
-   Simple, fast update workflows

------------------------------------------------------------------------

## 4. Core Hierarchy Model

    Organisation
     ├ Directorate
     │ ├ Department
     │ │ ├ Sub Department
     │ │ │ ├ Cohort
     │ │ │ │ • Contact Name
     │ │ │ │ • Device Types + Counts
     │ │ │ │ • Status

------------------------------------------------------------------------

## 5. Status Model

  Status   Meaning
  -------- -----------------------------------------
  Red      Not engaged / Unknown cohorts / Blocked
  Amber    Engaged / Work in progress
  Green    Planned / Confirmed
  Blue     Completed

Default = RED

------------------------------------------------------------------------

## 6. Status Roll-Up Logic

1.  If ANY child is RED → Parent = RED\
2.  Else If ANY child is AMBER → Parent = AMBER\
3.  Else If ALL children are BLUE → Parent = BLUE\
4.  Else → Parent = GREEN

Status overrides at non-cohort levels are temporary and will be
recalculated on any child change.

Roll-up calculations are computed on the fly (no stored aggregates).

------------------------------------------------------------------------

## 7. Device Model

Each Cohort has ONE device type (different Intune builds per type).

### Supported Device Types

-   Laptop (named by job role, e.g., "Senior Managers")
-   Shared Desktop (named by build/config, e.g., "Ops Room Desktop")
-   Kiosk (named by purpose/location, e.g., "T5 Check-in Desks")
-   Information Display Unit (IDU) (named by purpose/location, e.g., "AOCC Wall Displays")

### Cohort Fields

    deviceType: laptop | sharedDesktop | kiosk | displayUnit
    deviceCount: number      // Total devices (target)
    completedCount: number   // Devices upgraded (progress)
    location: string         // Physical location (optional for laptops)

------------------------------------------------------------------------

## 8. Cohort Metadata

Each Cohort supports:

-   Cohort Name
-   Device Type (laptop / sharedDesktop / kiosk / displayUnit)
-   Device Count (total target)
-   Completed Count (upgraded devices)
-   Location (physical location, optional for laptops)
-   Contact Name
-   Additional Contacts (optional, for multiple contacts)
-   Contact Email (Optional)
-   Confluence URL
-   Jira URL
-   Status (manually set)
-   Notes (Optional)

------------------------------------------------------------------------

## 9. Functional Requirements

### FR1 -- Hierarchy Management

System must allow: - Create node - Edit node - Move node - Delete node

### FR2 -- Status Management

-   Manual update at cohort level
-   Optional manual override at higher levels (temporary)
-   Automatic roll-up calculation

### FR3 -- Visual Hierarchy View

-   Expand / Collapse Tree
-   RAG colour visible at all levels
-   Device totals aggregated up hierarchy

### FR4 -- Filtering

Filter by: - Red only - Red + Amber - In progress - Completed

### FR5 -- Dashboard Summary

Display: - Total devices - Completed devices - Completion % - Devices by
type - Cohorts by status

### FR6 -- Search

Search by name and contact across all hierarchy levels (organisation,
directorate, department, sub-department, cohort).

------------------------------------------------------------------------

## 10. Non-Functional Requirements

### Performance

-   Support up to 100 nodes (initial scope)
-   Tree load \< 2 seconds typical

### Security

-   Single admin user (full access)
-   Cognito with Google OAuth
-   Allowlist email: jason@flowency.co.uk

### Deployment

-   AWS region: eu-west-2 (London)
-   CI/CD: GitHub Actions (push to main triggers deploy)

### Usability

-   Cohort update \< 2 clicks
-   New cohort creation \< 10 seconds

------------------------------------------------------------------------

## 11. Technical Architecture

### Infrastructure

-   **AWS Amplify Gen 2** (unified backend + hosting)
-   AWS region: eu-west-2 (London)

### Frontend

-   React 18 + TypeScript + Vite
-   Tailwind CSS + shadcn/ui
-   Dark theme (MS Teams inspired)
-   Desktop only (no mobile support)

### Backend (Amplify Gen 2)

-   AppSync GraphQL API
-   DynamoDB (auto-provisioned)
-   Cognito (Google OAuth)

### Hosting

-   Amplify Hosting (S3 + CloudFront, auto-provisioned)

------------------------------------------------------------------------

## 12. Data Model

### Node

    id: string
    name: string
    type: organisation | directorate | department | subdepartment | cohort
    parentId: string | null
    status: red | amber | green | blue (manually set)

    // Contact info
    contact: string | null
    additionalContacts: string[]
    contactEmail: string | null

    // Reference (org chart headcount, NOT device count)
    headcount: number | null

    // Cohort-specific fields
    deviceType: laptop | sharedDesktop | kiosk | displayUnit | null
    deviceCount: number | null      // Total devices (target)
    completedCount: number | null   // Devices upgraded (progress)
    location: string | null         // Physical location

    // External links
    confluenceUrl: string | null
    jiraUrl: string | null
    notes: string | null

    // Timestamps
    createdAt: ISO 8601 string
    updatedAt: ISO 8601 string

------------------------------------------------------------------------

## 13. V1 Scope

Must include: - Hierarchy tree UI - Cohort editing - Status roll-up
logic - Device type counts - Basic filtering - Search by name/contact -
Simple dashboard - Cognito Google OAuth (single admin)

------------------------------------------------------------------------

## 14. V2 Scope

-   Progress trend charts
-   Device burn-down charts
-   Risk notes
-   Export board snapshot
-   Audit trail (who changed what/when)
-   CSV import/export

------------------------------------------------------------------------

## 15. V3 Strategic Scope

-   Forecast completion dates
-   Cost of delay modelling
-   Cross programme tracking
-   Portfolio roll-up dashboards

------------------------------------------------------------------------

## 16. Success Metrics

-   75% reduction in reporting prep time
-   100% real-time visibility of upgrade state
-   Improved leadership confidence in reporting

------------------------------------------------------------------------

## 17. Guiding Principles

-   Operational truth over reporting polish
-   Lowest admin overhead possible
-   Hierarchy must be data-driven
-   Status must reflect reality

------------------------------------------------------------------------

END OF DOCUMENT
