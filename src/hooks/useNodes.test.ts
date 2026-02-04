import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNodes } from './useNodes';
import type { Node } from '../domain/node.schema';

const mockNode: Node = {
  id: 'test-id',
  type: 'organisation',
  name: 'Test Org',
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
};

const mockClient = {
  models: {
    Node: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
};

vi.mock('aws-amplify/data', () => ({
  generateClient: () => mockClient,
}));

describe('useNodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetching', () => {
    it('starts in loading state', () => {
      mockClient.models.Node.list.mockResolvedValue({ data: [], errors: undefined });

      const { result } = renderHook(() => useNodes());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.nodes).toEqual([]);
    });

    it('fetches nodes on mount', async () => {
      mockClient.models.Node.list.mockResolvedValue({
        data: [mockNode],
        errors: undefined,
      });

      const { result } = renderHook(() => useNodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].name).toBe('Test Org');
    });

    it('handles fetch errors', async () => {
      mockClient.models.Node.list.mockResolvedValue({
        data: null,
        errors: [{ message: 'Network error' }],
      });

      const { result } = renderHook(() => useNodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch nodes');
    });
  });

  describe('createNode', () => {
    it('creates a node and adds to list', async () => {
      const newNode = { ...mockNode, id: 'new-id', name: 'New Node' };

      mockClient.models.Node.list.mockResolvedValue({ data: [], errors: undefined });
      mockClient.models.Node.create.mockResolvedValue({ data: newNode, errors: undefined });

      const { result } = renderHook(() => useNodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createNode({
          type: 'organisation',
          name: 'New Node',
          status: 'red',
        });
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].name).toBe('New Node');
    });

    it('handles create errors', async () => {
      mockClient.models.Node.list.mockResolvedValue({ data: [], errors: undefined });
      mockClient.models.Node.create.mockResolvedValue({
        data: null,
        errors: [{ message: 'Validation error' }],
      });

      const { result } = renderHook(() => useNodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.createNode({
            type: 'organisation',
            name: 'New Node',
            status: 'red',
          });
        })
      ).rejects.toThrow('Failed to create node');
    });
  });

  describe('updateNode', () => {
    it('updates a node in the list', async () => {
      const updatedNode = { ...mockNode, name: 'Updated Name' };

      mockClient.models.Node.list.mockResolvedValue({ data: [mockNode], errors: undefined });
      mockClient.models.Node.update.mockResolvedValue({ data: updatedNode, errors: undefined });

      const { result } = renderHook(() => useNodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateNode('test-id', { name: 'Updated Name' });
      });

      expect(result.current.nodes[0].name).toBe('Updated Name');
    });
  });

  describe('deleteNode', () => {
    it('removes a node from the list', async () => {
      mockClient.models.Node.list.mockResolvedValue({ data: [mockNode], errors: undefined });
      mockClient.models.Node.delete.mockResolvedValue({ data: mockNode, errors: undefined });

      const { result } = renderHook(() => useNodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.nodes).toHaveLength(1);

      await act(async () => {
        await result.current.deleteNode('test-id');
      });

      expect(result.current.nodes).toHaveLength(0);
    });
  });

  describe('refetch', () => {
    it('refetches nodes from API', async () => {
      mockClient.models.Node.list
        .mockResolvedValueOnce({ data: [mockNode], errors: undefined })
        .mockResolvedValueOnce({
          data: [mockNode, { ...mockNode, id: 'second', name: 'Second' }],
          errors: undefined,
        });

      const { result } = renderHook(() => useNodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.nodes).toHaveLength(1);

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.nodes).toHaveLength(2);
    });
  });
});
