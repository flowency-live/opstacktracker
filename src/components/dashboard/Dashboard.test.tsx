import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import type { Node } from '../../domain/node.schema';

const createNode = (overrides: Partial<Node> = {}): Node => ({
  id: 'test-id',
  type: 'directorate',
  name: 'Test Node',
  parentId: null,
  status: 'amber',
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

const mockNodes: Node[] = [
  createNode({
    id: '1',
    name: 'British Airways',
    type: 'organisation',
    status: 'red',
  }),
  createNode({
    id: '2',
    name: 'Heathrow Operations',
    type: 'directorate',
    status: 'amber',
    headcount: 6419,
  }),
  createNode({
    id: '3',
    name: 'Baggage Services',
    type: 'department',
    status: 'green',
    headcount: 500,
  }),
  createNode({
    id: '4',
    name: 'Customer Experience',
    type: 'department',
    status: 'blue',
    headcount: 300,
  }),
  createNode({
    id: '5',
    name: 'Baggage Handlers',
    type: 'cohort',
    status: 'amber',
    deviceCount: 150,
    completedCount: 75,
  }),
  createNode({
    id: '6',
    name: 'Check-in Staff',
    type: 'cohort',
    status: 'green',
    deviceCount: 100,
    completedCount: 100,
  }),
  createNode({
    id: '7',
    name: 'Ground Crew',
    type: 'cohort',
    status: 'blue',
    deviceCount: 200,
    completedCount: 200,
  }),
];

describe('Dashboard', () => {
  describe('rendering', () => {
    it('renders dashboard container', () => {
      render(<Dashboard nodes={mockNodes} />);

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('status distribution', () => {
    it('shows status counts', () => {
      render(<Dashboard nodes={mockNodes} />);

      expect(screen.getByTestId('status-red-count')).toHaveTextContent('1');
      expect(screen.getByTestId('status-amber-count')).toHaveTextContent('2');
      expect(screen.getByTestId('status-green-count')).toHaveTextContent('2');
      expect(screen.getByTestId('status-blue-count')).toHaveTextContent('2');
    });

    it('shows status percentages', () => {
      render(<Dashboard nodes={mockNodes} />);

      // 1/7 = 14.3%, 2/7 = 28.6%
      expect(screen.getByTestId('status-red-percent')).toHaveTextContent(
        /14/
      );
      expect(screen.getByTestId('status-amber-percent')).toHaveTextContent(
        /29/
      );
    });
  });

  describe('device metrics', () => {
    it('shows total device count', () => {
      render(<Dashboard nodes={mockNodes} />);

      // 150 + 100 + 200 = 450
      expect(screen.getByTestId('total-devices')).toHaveTextContent('450');
    });

    it('shows completed device count', () => {
      render(<Dashboard nodes={mockNodes} />);

      // 75 + 100 + 200 = 375
      expect(screen.getByTestId('completed-devices')).toHaveTextContent('375');
    });

    it('shows completion percentage', () => {
      render(<Dashboard nodes={mockNodes} />);

      // 375/450 = 83.3%
      expect(screen.getByTestId('completion-percent')).toHaveTextContent(
        /83/
      );
    });
  });

  describe('cohort summary', () => {
    it('shows total cohort count', () => {
      render(<Dashboard nodes={mockNodes} />);

      expect(screen.getByTestId('total-cohorts')).toHaveTextContent('3');
    });
  });

  describe('hierarchy summary', () => {
    it('shows node counts by type', () => {
      render(<Dashboard nodes={mockNodes} />);

      expect(screen.getByTestId('type-organisation-count')).toHaveTextContent(
        '1'
      );
      expect(screen.getByTestId('type-directorate-count')).toHaveTextContent(
        '1'
      );
      expect(screen.getByTestId('type-department-count')).toHaveTextContent(
        '2'
      );
      expect(screen.getByTestId('type-cohort-count')).toHaveTextContent('3');
    });
  });

  describe('empty state', () => {
    it('handles empty nodes array', () => {
      render(<Dashboard nodes={[]} />);

      expect(screen.getByTestId('total-devices')).toHaveTextContent('0');
      expect(screen.getByTestId('completed-devices')).toHaveTextContent('0');
      expect(screen.getByTestId('total-cohorts')).toHaveTextContent('0');
    });

    it('shows 0% completion when no devices', () => {
      render(<Dashboard nodes={[]} />);

      expect(screen.getByTestId('completion-percent')).toHaveTextContent('0');
    });
  });
});
