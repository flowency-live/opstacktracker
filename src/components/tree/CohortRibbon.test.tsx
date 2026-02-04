import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CohortRibbon } from './CohortRibbon';
import type { Node } from '../../domain/node.schema';

const createCohortNode = (overrides: Partial<Node> = {}): Node => ({
  id: 'cohort-1',
  type: 'cohort',
  name: 'Laptop Users',
  parentId: 'parent-1',
  status: 'amber',
  contact: 'John Smith',
  additionalContacts: [],
  contactEmail: 'john@example.com',
  headcount: null,
  deviceType: 'laptop',
  deviceCount: 50,
  completedCount: 20,
  location: null,
  confluenceUrl: null,
  jiraUrl: null,
  notes: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('CohortRibbon', () => {
  describe('device type icons', () => {
    it('shows laptop icon for laptop device type', () => {
      const cohort = createCohortNode({ deviceType: 'laptop' });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('device-icon-laptop')).toBeInTheDocument();
    });

    it('shows desktop icon for sharedDesktop device type', () => {
      const cohort = createCohortNode({ deviceType: 'sharedDesktop' });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('device-icon-sharedDesktop')).toBeInTheDocument();
    });

    it('shows kiosk icon for kiosk device type', () => {
      const cohort = createCohortNode({ deviceType: 'kiosk' });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('device-icon-kiosk')).toBeInTheDocument();
    });

    it('shows display icon for displayUnit device type', () => {
      const cohort = createCohortNode({ deviceType: 'displayUnit' });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('device-icon-displayUnit')).toBeInTheDocument();
    });
  });

  describe('name display', () => {
    it('displays cohort name', () => {
      const cohort = createCohortNode({ name: 'Finance Team Laptops' });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('Finance Team Laptops')).toBeInTheDocument();
    });
  });

  describe('device count badge', () => {
    it('displays completed/total device count', () => {
      const cohort = createCohortNode({
        deviceCount: 100,
        completedCount: 45,
      });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('45/100')).toBeInTheDocument();
    });

    it('shows 0/0 when no device count', () => {
      const cohort = createCohortNode({
        deviceCount: null,
        completedCount: null,
      });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('0/0')).toBeInTheDocument();
    });
  });

  describe('status indicator', () => {
    it('displays RAGB status indicator', () => {
      const cohort = createCohortNode({ status: 'red' });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('status-red');
    });
  });

  describe('external links', () => {
    it('shows Confluence link icon when URL present', () => {
      const cohort = createCohortNode({
        confluenceUrl: 'https://confluence.example.com/page',
      });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      const link = screen.getByTestId('confluence-link');
      expect(link).toHaveAttribute('href', 'https://confluence.example.com/page');
    });

    it('shows Jira link icon when URL present', () => {
      const cohort = createCohortNode({
        jiraUrl: 'https://jira.example.com/browse/PROJ-123',
      });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      const link = screen.getByTestId('jira-link');
      expect(link).toHaveAttribute('href', 'https://jira.example.com/browse/PROJ-123');
    });

    it('hides link icons when URLs not present', () => {
      const cohort = createCohortNode({
        confluenceUrl: null,
        jiraUrl: null,
      });

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={() => {}}
        />
      );

      expect(screen.queryByTestId('confluence-link')).not.toBeInTheDocument();
      expect(screen.queryByTestId('jira-link')).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('calls onSelect when clicked', () => {
      const cohort = createCohortNode();
      const onSelect = vi.fn();

      render(
        <CohortRibbon
          node={cohort}
          isSelected={false}
          onSelect={onSelect}
        />
      );

      fireEvent.click(screen.getByTestId('cohort-ribbon'));
      expect(onSelect).toHaveBeenCalledWith(cohort);
    });

    it('applies selected styles when isSelected is true', () => {
      const cohort = createCohortNode();

      render(
        <CohortRibbon
          node={cohort}
          isSelected={true}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('cohort-ribbon')).toHaveClass('ring-2');
    });
  });
});
