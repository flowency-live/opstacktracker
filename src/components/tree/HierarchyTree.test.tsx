import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HierarchyTree } from './HierarchyTree';
import type { Node } from '../../domain/node.schema';

const createNode = (overrides: Partial<Node> = {}): Node => ({
  id: crypto.randomUUID(),
  type: 'organisation',
  name: 'Test Node',
  parentId: null,
  status: 'red',
  contact: null,
  additionalContacts: [],
  contactEmail: null,
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

describe('HierarchyTree', () => {
  describe('rendering', () => {
    it('renders empty state when no nodes provided', () => {
      render(
        <HierarchyTree
          nodes={[]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('renders root node', () => {
      const rootNode = createNode({
        name: 'British Airways',
        type: 'organisation',
      });

      render(
        <HierarchyTree
          nodes={[rootNode]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByText('British Airways')).toBeInTheDocument();
    });

    it('renders nested hierarchy', () => {
      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
        parentId: null,
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow Operations',
        type: 'directorate',
        parentId: 'org-1',
      });

      const department = createNode({
        id: 'dept-1',
        name: 'Baggage',
        type: 'department',
        parentId: 'dir-1',
      });

      render(
        <HierarchyTree
          nodes={[org, directorate, department]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByText('British Airways')).toBeInTheDocument();
      expect(screen.getByText('Heathrow Operations')).toBeInTheDocument();
      expect(screen.getByText('Baggage')).toBeInTheDocument();
    });

    it('shows expand/collapse toggle for parent nodes', () => {
      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow',
        type: 'directorate',
        parentId: 'org-1',
      });

      render(
        <HierarchyTree
          nodes={[org, directorate]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      const orgNode = screen.getByText('British Airways').closest('[data-testid="tree-node"]') as HTMLElement;
      const toggle = within(orgNode).getByTestId('expand-toggle');
      expect(toggle).toBeInTheDocument();
    });

    it('renders cohorts as ribbon components without expand toggle', () => {
      const leafNode = createNode({
        name: 'Cohort A',
        type: 'cohort',
      });

      render(
        <HierarchyTree
          nodes={[leafNode]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      // Cohorts render as CohortRibbon, not TreeNode
      const ribbon = screen.getByText('Cohort A').closest('[data-testid="cohort-ribbon"]');
      expect(ribbon).toBeInTheDocument();
      // CohortRibbon has no expand toggle by design
      expect(within(ribbon as HTMLElement).queryByTestId('expand-toggle')).not.toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('starts expanded by default', () => {
      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow',
        type: 'directorate',
        parentId: 'org-1',
      });

      render(
        <HierarchyTree
          nodes={[org, directorate]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByText('Heathrow')).toBeVisible();
    });

    it('collapses children when toggle clicked', async () => {
      const user = userEvent.setup();

      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow',
        type: 'directorate',
        parentId: 'org-1',
      });

      render(
        <HierarchyTree
          nodes={[org, directorate]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      const orgNode = screen.getByText('British Airways').closest('[data-testid="tree-node"]') as HTMLElement;
      const toggle = within(orgNode).getByTestId('expand-toggle');

      await user.click(toggle);

      expect(screen.queryByText('Heathrow')).not.toBeInTheDocument();
    });

    it('expands children when toggle clicked again', async () => {
      const user = userEvent.setup();

      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow',
        type: 'directorate',
        parentId: 'org-1',
      });

      render(
        <HierarchyTree
          nodes={[org, directorate]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      const orgNode = screen.getByText('British Airways').closest('[data-testid="tree-node"]') as HTMLElement;
      const toggle = within(orgNode).getByTestId('expand-toggle');

      await user.click(toggle);
      await user.click(toggle);

      expect(screen.getByText('Heathrow')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('calls onSelect when node clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const node = createNode({
        name: 'Test Node',
      });

      render(
        <HierarchyTree
          nodes={[node]}
          onSelect={onSelect}
          selectedNodeId={null}
        />
      );

      await user.click(screen.getByText('Test Node'));

      expect(onSelect).toHaveBeenCalledWith(node);
    });

    it('highlights selected node', () => {
      const node = createNode({
        id: 'selected-node',
        name: 'Selected Node',
      });

      render(
        <HierarchyTree
          nodes={[node]}
          onSelect={vi.fn()}
          selectedNodeId="selected-node"
        />
      );

      const nodeElement = screen.getByText('Selected Node').closest('[data-testid="tree-node"]');
      expect(nodeElement).toHaveClass('tree-node-selected');
    });
  });

  describe('device count aggregation', () => {
    it('displays aggregated device counts on parent nodes', () => {
      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const cohort1 = createNode({
        id: 'cohort-1',
        name: 'Cohort A',
        type: 'cohort',
        parentId: 'org-1',
        deviceCount: 100,
        completedCount: 50,
      });

      const cohort2 = createNode({
        id: 'cohort-2',
        name: 'Cohort B',
        type: 'cohort',
        parentId: 'org-1',
        deviceCount: 50,
        completedCount: 25,
      });

      render(
        <HierarchyTree
          nodes={[org, cohort1, cohort2]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      const orgNode = screen.getByText('British Airways').closest('[data-testid="tree-node"]') as HTMLElement;
      const badge = within(orgNode).getByTestId('device-badge');
      expect(badge).toHaveTextContent('75/150');
    });
  });

  describe('expand/collapse all', () => {
    it('has expand all button', () => {
      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      render(
        <HierarchyTree
          nodes={[org]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByTestId('expand-all-btn')).toBeInTheDocument();
    });

    it('has collapse all button', () => {
      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      render(
        <HierarchyTree
          nodes={[org]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      expect(screen.getByTestId('collapse-all-btn')).toBeInTheDocument();
    });

    it('collapse all hides all children', async () => {
      const user = userEvent.setup();

      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow',
        type: 'directorate',
        parentId: 'org-1',
      });

      render(
        <HierarchyTree
          nodes={[org, directorate]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      // Initially children are visible
      expect(screen.getByText('Heathrow')).toBeVisible();

      // Click collapse all
      await user.click(screen.getByTestId('collapse-all-btn'));

      // Children should be hidden
      expect(screen.queryByText('Heathrow')).not.toBeInTheDocument();
    });

    it('expand all shows all children after collapse', async () => {
      const user = userEvent.setup();

      const org = createNode({
        id: 'org-1',
        name: 'British Airways',
        type: 'organisation',
      });

      const directorate = createNode({
        id: 'dir-1',
        name: 'Heathrow',
        type: 'directorate',
        parentId: 'org-1',
      });

      render(
        <HierarchyTree
          nodes={[org, directorate]}
          onSelect={vi.fn()}
          selectedNodeId={null}
        />
      );

      // Collapse all
      await user.click(screen.getByTestId('collapse-all-btn'));
      expect(screen.queryByText('Heathrow')).not.toBeInTheDocument();

      // Expand all
      await user.click(screen.getByTestId('expand-all-btn'));
      expect(screen.getByText('Heathrow')).toBeVisible();
    });
  });

  describe('loading and error states', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(
        <HierarchyTree
          nodes={[]}
          onSelect={vi.fn()}
          selectedNodeId={null}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('shows error message when error provided', () => {
      render(
        <HierarchyTree
          nodes={[]}
          onSelect={vi.fn()}
          selectedNodeId={null}
          error="Failed to load data"
        />
      );

      expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
    });
  });
});
