import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { Node, NodeType, Status, DeviceType } from '../domain/node.schema';

type Client = ReturnType<typeof generateClient<Schema>>;

interface CreateNodeInput {
  type: NodeType;
  name: string;
  parentId?: string | null;
  status: Status;
  contact?: string | null;
  additionalContacts?: string[];
  contactEmail?: string | null;
  headcount?: number | null;
  deviceType?: DeviceType | null;
  deviceCount?: number | null;
  completedCount?: number | null;
  location?: string | null;
  confluenceUrl?: string | null;
  jiraUrl?: string | null;
  notes?: string | null;
}

interface UpdateNodeInput {
  name?: string;
  status?: Status;
  contact?: string | null;
  additionalContacts?: string[];
  contactEmail?: string | null;
  headcount?: number | null;
  deviceType?: DeviceType | null;
  deviceCount?: number | null;
  completedCount?: number | null;
  location?: string | null;
  confluenceUrl?: string | null;
  jiraUrl?: string | null;
  notes?: string | null;
}

interface UseNodesResult {
  nodes: Node[];
  isLoading: boolean;
  error: string | null;
  createNode: (input: CreateNodeInput) => Promise<Node>;
  updateNode: (id: string, input: UpdateNodeInput) => Promise<Node>;
  deleteNode: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useNodes Hook
 *
 * Provides data fetching and mutations for Node entities.
 * Manages local state with optimistic updates.
 */
export function useNodes(): UseNodesResult {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client] = useState<Client>(() => generateClient<Schema>());

  const fetchNodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allNodes: Node[] = [];
      let nextToken: string | undefined;

      do {
        const { data, errors, nextToken: token } = await client.models.Node.list({
          limit: 1000,
          nextToken,
        });

        if (errors) {
          throw new Error('Failed to fetch nodes');
        }

        if (data) {
          allNodes.push(...(data as unknown as Node[]));
        }

        nextToken = token ?? undefined;
      } while (nextToken);

      setNodes(allNodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nodes');
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const createNode = useCallback(
    async (input: CreateNodeInput): Promise<Node> => {
      const { data, errors } = await client.models.Node.create({
        type: input.type,
        name: input.name,
        parentId: input.parentId ?? null,
        status: input.status,
        contact: input.contact ?? null,
        additionalContacts: input.additionalContacts ?? [],
        contactEmail: input.contactEmail ?? null,
        headcount: input.headcount ?? null,
        deviceType: input.deviceType ?? null,
        deviceCount: input.deviceCount ?? null,
        completedCount: input.completedCount ?? null,
        location: input.location ?? null,
        confluenceUrl: input.confluenceUrl ?? null,
        jiraUrl: input.jiraUrl ?? null,
        notes: input.notes ?? null,
      });

      if (errors || !data) {
        throw new Error('Failed to create node');
      }

      const newNode = data as unknown as Node;
      setNodes((prev) => [...prev, newNode]);
      return newNode;
    },
    [client]
  );

  const updateNode = useCallback(
    async (id: string, input: UpdateNodeInput): Promise<Node> => {
      const { data, errors } = await client.models.Node.update({
        id,
        ...input,
      });

      if (errors || !data) {
        throw new Error('Failed to update node');
      }

      const updatedNode = data as unknown as Node;
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? updatedNode : n))
      );
      return updatedNode;
    },
    [client]
  );

  const deleteNode = useCallback(
    async (id: string): Promise<void> => {
      const { errors } = await client.models.Node.delete({ id });

      if (errors) {
        throw new Error('Failed to delete node');
      }

      setNodes((prev) => prev.filter((n) => n.id !== id));
    },
    [client]
  );

  const refetch = useCallback(async () => {
    await fetchNodes();
  }, [fetchNodes]);

  return {
    nodes,
    isLoading,
    error,
    createNode,
    updateNode,
    deleteNode,
    refetch,
  };
}
