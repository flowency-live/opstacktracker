import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrgChart } from './OrgChart';
import type { Node } from '../../domain/node.schema';

const createNode = (overrides: Partial<Node> = {}): Node => ({
  id: crypto.randomUUID(),
  type: 'organisation',
  name: 'Test Node',
  parentId: null,
  status: 'red',
  contact: null,
  additionalContacts: [],
  headcount: null,
  deviceType: null,
  deviceCount: null,
  completedCount: null,
  location: null,
  confluenceUrl: null,
  jiraUrl: null,
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('OrgChart', () => {
  describe('rendering', () => {
    it('renders empty state when no nodes', () => {
      render(
        <OrgChart
          nodes={[]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('renders root organisation card', () => {
      const org = createNode({
        name: 'British Airways',
        type: 'organisation',
      });

      render(
        <OrgChart
          nodes={[org]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByText('British Airways')).toBeInTheDocument();
    });

    it('renders hierarchical structure', () => {
      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow Operations',
        type: 'directorate',
        parentId: 'org-1',
      });

      render(
        <OrgChart
          nodes={[org, directorate]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByText('British Airways')).toBeInTheDocument();
      expect(screen.getByText('Heathrow Operations')).toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('hides children when collapsed', async () => {
      const user = userEvent.setup();

      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow Operations',
        type: 'directorate',
        parentId: 'org-1',
      });

      render(
        <OrgChart
          nodes={[org, directorate]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      // Click collapse button
      await user.click(screen.getByTestId('collapse-btn'));

      // Child should be hidden
      expect(screen.queryByText('Heathrow Operations')).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('calls onSelect when card clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const org = createNode({
        name: 'British Airways',
        type: 'organisation',
      });

      render(
        <OrgChart
          nodes={[org]}
          onSelect={onSelect}
          selectedNodeId={null}
        />
      );

      await user.click(screen.getByText('British Airways'));

      expect(onSelect).toHaveBeenCalledWith(org);
    });
  });
});
