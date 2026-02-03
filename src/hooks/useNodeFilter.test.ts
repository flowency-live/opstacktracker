import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNodeFilter } from './useNodeFilter';
import type { Node } from '../domain/node.schema';

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
  createNode({ id: '1', name: 'British Airways', type: 'organisation', status: 'red' }),
  createNode({ id: '2', name: 'Heathrow Operations', type: 'directorate', status: 'amber' }),
  createNode({ id: '3', name: 'Baggage Services', type: 'department', status: 'green' }),
  createNode({ id: '4', name: 'Customer Experience', type: 'department', status: 'blue' }),
  createNode({ id: '5', name: 'Baggage Handlers', type: 'cohort', status: 'amber' }),
];

describe('useNodeFilter', () => {
  describe('initial state', () => {
    it('returns all nodes when no filters applied', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      expect(result.current.filteredNodes).toHaveLength(5);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.statusFilter).toBeNull();
      expect(result.current.typeFilter).toBeNull();
    });
  });

  describe('search filtering', () => {
    it('filters nodes by name (case-insensitive)', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setSearchQuery('baggage');
      });

      expect(result.current.filteredNodes).toHaveLength(2);
      expect(result.current.filteredNodes.map((n) => n.name)).toEqual([
        'Baggage Services',
        'Baggage Handlers',
      ]);
    });

    it('filters by partial match', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setSearchQuery('heath');
      });

      expect(result.current.filteredNodes).toHaveLength(1);
      expect(result.current.filteredNodes[0].name).toBe('Heathrow Operations');
    });

    it('returns empty when no match found', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setSearchQuery('xyz123');
      });

      expect(result.current.filteredNodes).toHaveLength(0);
    });
  });

  describe('status filtering', () => {
    it('filters nodes by status', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setStatusFilter('amber');
      });

      expect(result.current.filteredNodes).toHaveLength(2);
      expect(result.current.filteredNodes.every((n) => n.status === 'amber')).toBe(
        true
      );
    });

    it('shows all statuses when filter is null', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setStatusFilter('red');
      });

      expect(result.current.filteredNodes).toHaveLength(1);

      act(() => {
        result.current.setStatusFilter(null);
      });

      expect(result.current.filteredNodes).toHaveLength(5);
    });
  });

  describe('type filtering', () => {
    it('filters nodes by type', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setTypeFilter('department');
      });

      expect(result.current.filteredNodes).toHaveLength(2);
      expect(result.current.filteredNodes.every((n) => n.type === 'department')).toBe(
        true
      );
    });

    it('shows all types when filter is null', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setTypeFilter('cohort');
      });

      expect(result.current.filteredNodes).toHaveLength(1);

      act(() => {
        result.current.setTypeFilter(null);
      });

      expect(result.current.filteredNodes).toHaveLength(5);
    });
  });

  describe('combined filtering', () => {
    it('combines search and status filters', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setSearchQuery('baggage');
        result.current.setStatusFilter('amber');
      });

      expect(result.current.filteredNodes).toHaveLength(1);
      expect(result.current.filteredNodes[0].name).toBe('Baggage Handlers');
    });

    it('combines search and type filters', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setSearchQuery('baggage');
        result.current.setTypeFilter('department');
      });

      expect(result.current.filteredNodes).toHaveLength(1);
      expect(result.current.filteredNodes[0].name).toBe('Baggage Services');
    });

    it('combines all three filters', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setSearchQuery('customer');
        result.current.setStatusFilter('blue');
        result.current.setTypeFilter('department');
      });

      expect(result.current.filteredNodes).toHaveLength(1);
      expect(result.current.filteredNodes[0].name).toBe('Customer Experience');
    });
  });

  describe('resetFilters', () => {
    it('resets all filters to initial state', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setSearchQuery('test');
        result.current.setStatusFilter('red');
        result.current.setTypeFilter('cohort');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.statusFilter).toBeNull();
      expect(result.current.typeFilter).toBeNull();
      expect(result.current.filteredNodes).toHaveLength(5);
    });
  });

  describe('hasActiveFilters', () => {
    it('returns false when no filters active', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('returns true when search query is set', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('returns true when status filter is set', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setStatusFilter('red');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('returns true when type filter is set', () => {
      const { result } = renderHook(() => useNodeFilter(mockNodes));

      act(() => {
        result.current.setTypeFilter('cohort');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('reactivity', () => {
    it('updates filtered results when nodes change', () => {
      const { result, rerender } = renderHook(
        ({ nodes }) => useNodeFilter(nodes),
        { initialProps: { nodes: mockNodes } }
      );

      expect(result.current.filteredNodes).toHaveLength(5);

      const newNodes = mockNodes.slice(0, 2);
      rerender({ nodes: newNodes });

      expect(result.current.filteredNodes).toHaveLength(2);
    });
  });
});
