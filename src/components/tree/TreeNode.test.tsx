import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeNode } from './TreeNode';
import type { Node } from '../../domain/node.schema';

const createMockNode = (overrides: Partial<Node> = {}): Node => ({
  id: 'node-1',
  type: 'department',
  name: 'Test Department',
  parentId: 'parent-1',
  status: 'amber',
  contact: 'John Smith',
  additionalContacts: [],
  contactEmail: 'john@example.com',
  headcount: 150,
  deviceType: null,
  deviceCount: null,
  completedCount: null,
  location: null,
  confluenceUrl: null,
  jiraUrl: null,
  notes: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('TreeNode', () => {
  describe('Rendering', () => {
    it('renders node name', () => {
      const node = createMockNode({ name: 'Baggage and Logistics' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('Baggage and Logistics')).toBeInTheDocument();
    });

    it('does not render node type badge', () => {
      const node = createMockNode({ type: 'department' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.queryByText('department')).not.toBeInTheDocument();
    });

    it('displays RAGB color indicator for red status', () => {
      const node = createMockNode({ status: 'red' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('status-red');
    });

    it('displays RAGB color indicator for amber status', () => {
      const node = createMockNode({ status: 'amber' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('status-amber');
    });

    it('displays RAGB color indicator for green status', () => {
      const node = createMockNode({ status: 'green' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('status-green');
    });

    it('displays RAGB color indicator for blue status', () => {
      const node = createMockNode({ status: 'blue' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('status-blue');
    });

    it('shows contact info when available', () => {
      const node = createMockNode({ contact: 'Jane Doe' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('hides contact info when not available', () => {
      const node = createMockNode({ contact: null });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.queryByTestId('contact-info')).not.toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    it('shows expand toggle for non-leaf nodes', () => {
      const node = createMockNode({ type: 'department' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={true}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('expand-toggle')).toBeInTheDocument();
    });

    it('hides expand toggle for leaf nodes without children', () => {
      const node = createMockNode({ type: 'cohort' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.queryByTestId('expand-toggle')).not.toBeInTheDocument();
    });

    it('shows expanded icon when expanded', () => {
      const node = createMockNode();

      render(
        <TreeNode
          node={node}
          isExpanded={true}
          hasChildren={true}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const toggle = screen.getByTestId('expand-toggle');
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows collapsed icon when collapsed', () => {
      const node = createMockNode();

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={true}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const toggle = screen.getByTestId('expand-toggle');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('calls onToggle when expand toggle is clicked', () => {
      const node = createMockNode();
      const onToggle = vi.fn();

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={true}
          onToggle={onToggle}
          onSelect={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('expand-toggle'));
      expect(onToggle).toHaveBeenCalledWith(node.id);
    });
  });

  describe('Device Count Badge', () => {
    it('displays device count badge for cohorts with devices', () => {
      const node = createMockNode({
        type: 'cohort',
        deviceCount: 25,
        completedCount: 10,
      });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('10/25')).toBeInTheDocument();
    });

    it('displays aggregated device count for parent nodes', () => {
      const node = createMockNode({ type: 'department' });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={true}
          onToggle={() => {}}
          onSelect={() => {}}
          aggregatedDeviceCount={100}
          aggregatedCompletedCount={45}
        />
      );

      expect(screen.getByText('45/100')).toBeInTheDocument();
    });

    it('hides device badge when no device count', () => {
      const node = createMockNode({
        type: 'cohort',
        deviceCount: null,
        completedCount: null,
      });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.queryByTestId('device-badge')).not.toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    it('shows Confluence icon when URL present', () => {
      const node = createMockNode({
        confluenceUrl: 'https://confluence.example.com/page',
      });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const link = screen.getByTestId('confluence-link');
      expect(link).toHaveAttribute('href', 'https://confluence.example.com/page');
    });

    it('shows Jira icon when URL present', () => {
      const node = createMockNode({
        jiraUrl: 'https://jira.example.com/browse/PROJ-123',
      });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const link = screen.getByTestId('jira-link');
      expect(link).toHaveAttribute('href', 'https://jira.example.com/browse/PROJ-123');
    });

    it('hides link icons when URLs not present', () => {
      const node = createMockNode({
        confluenceUrl: null,
        jiraUrl: null,
      });

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.queryByTestId('confluence-link')).not.toBeInTheDocument();
      expect(screen.queryByTestId('jira-link')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onSelect when node is clicked', () => {
      const node = createMockNode();
      const onSelect = vi.fn();

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          onToggle={() => {}}
          onSelect={onSelect}
        />
      );

      fireEvent.click(screen.getByTestId('tree-node'));
      expect(onSelect).toHaveBeenCalledWith(node);
    });

    it('applies selected styles when isSelected is true', () => {
      const node = createMockNode();

      render(
        <TreeNode
          node={node}
          isExpanded={false}
          hasChildren={false}
          isSelected={true}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('tree-node')).toHaveClass('tree-node-selected');
    });
  });
});
