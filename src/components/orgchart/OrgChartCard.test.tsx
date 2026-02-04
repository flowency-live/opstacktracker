import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrgChartCard } from './OrgChartCard';
import type { Node } from '../../domain/node.schema';

const createNode = (overrides: Partial<Node> = {}): Node => ({
  id: 'node-1',
  type: 'department',
  name: 'Test Department',
  parentId: 'parent-1',
  status: 'amber',
  contact: 'John Smith',
  additionalContacts: [],
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

describe('OrgChartCard', () => {
  describe('rendering', () => {
    it('displays node name', () => {
      const node = createNode({ name: 'Baggage and Logistics' });

      render(
        <OrgChartCard
          node={node}
          childCount={3}
          aggregatedDeviceCount={100}
          aggregatedCompletedCount={50}
          isExpanded={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('Baggage and Logistics')).toBeInTheDocument();
    });

    it('displays contact name', () => {
      const node = createNode({ contact: 'Jane Doe' });

      render(
        <OrgChartCard
          node={node}
          childCount={2}
          aggregatedDeviceCount={50}
          aggregatedCompletedCount={25}
          isExpanded={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('displays aggregated device count', () => {
      render(
        <OrgChartCard
          node={createNode()}
          childCount={5}
          aggregatedDeviceCount={100}
          aggregatedCompletedCount={45}
          isExpanded={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('45/100')).toBeInTheDocument();
    });

    it('displays child count', () => {
      render(
        <OrgChartCard
          node={createNode({ type: 'directorate' })}
          childCount={8}
          aggregatedDeviceCount={200}
          aggregatedCompletedCount={100}
          isExpanded={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText(/8/)).toBeInTheDocument();
    });

    it('shows status indicator with correct color', () => {
      const node = createNode({ status: 'red' });

      render(
        <OrgChartCard
          node={node}
          childCount={1}
          aggregatedDeviceCount={10}
          aggregatedCompletedCount={5}
          isExpanded={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('status-red');
    });
  });

  describe('expand/collapse', () => {
    it('shows expand button when collapsed and has children', () => {
      render(
        <OrgChartCard
          node={createNode()}
          childCount={3}
          aggregatedDeviceCount={100}
          aggregatedCompletedCount={50}
          isExpanded={false}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('expand-btn')).toBeInTheDocument();
    });

    it('shows collapse button when expanded', () => {
      render(
        <OrgChartCard
          node={createNode()}
          childCount={3}
          aggregatedDeviceCount={100}
          aggregatedCompletedCount={50}
          isExpanded={true}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('collapse-btn')).toBeInTheDocument();
    });

    it('calls onToggle when expand button clicked', () => {
      const onToggle = vi.fn();
      const node = createNode({ id: 'test-node' });

      render(
        <OrgChartCard
          node={node}
          childCount={3}
          aggregatedDeviceCount={100}
          aggregatedCompletedCount={50}
          isExpanded={false}
          onToggle={onToggle}
          onSelect={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('expand-btn'));
      expect(onToggle).toHaveBeenCalledWith('test-node');
    });
  });

  describe('selection', () => {
    it('calls onSelect when card is clicked', () => {
      const onSelect = vi.fn();
      const node = createNode();

      render(
        <OrgChartCard
          node={node}
          childCount={2}
          aggregatedDeviceCount={50}
          aggregatedCompletedCount={25}
          isExpanded={false}
          onToggle={() => {}}
          onSelect={onSelect}
        />
      );

      fireEvent.click(screen.getByTestId('org-chart-card'));
      expect(onSelect).toHaveBeenCalledWith(node);
    });

    it('shows selected state when isSelected is true', () => {
      render(
        <OrgChartCard
          node={createNode()}
          childCount={2}
          aggregatedDeviceCount={50}
          aggregatedCompletedCount={25}
          isExpanded={false}
          isSelected={true}
          onToggle={() => {}}
          onSelect={() => {}}
        />
      );

      expect(screen.getByTestId('org-chart-card')).toHaveClass('ring-2');
    });
  });
});
