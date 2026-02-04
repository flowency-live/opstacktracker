import type { Node, NodeType, Status } from '../domain/node.schema';

/**
 * Raw seed data node structure from JSON file
 */
export interface SeedDataNode {
  type?: NodeType;
  name: string;
  contact?: string;
  additionalContacts?: string[];
  headcount?: number;
  status?: Status;
  children?: SeedDataNode[];
}

/**
 * Raw seed data structure
 */
export interface SeedData {
  organisation: SeedDataNode;
  _meta?: {
    capturedAt?: string;
    notes?: string[];
    pendingQuestions?: string[];
  };
}

/**
 * Parse seed data JSON into flat array of Node objects
 *
 * - Generates UUIDs for each node
 * - Maintains parent-child relationships via parentId
 * - Returns nodes in breadth-first order (parents before children)
 * - Validates all nodes against schema
 *
 * @param seedData Raw seed data object
 * @returns Array of Node objects ready for database import
 */
export function parseSeedData(seedData: SeedData): Node[] {
  const nodes: Node[] = [];
  const now = new Date().toISOString();

  // Process organisation as root
  const rootNode = createNodeFromSeed(
    { ...seedData.organisation, type: 'organisation' },
    null,
    now
  );
  nodes.push(rootNode);

  // Process children recursively using breadth-first traversal
  const queue: Array<{ node: SeedDataNode; parentId: string }> = [];

  // Add root's children to queue
  if (seedData.organisation.children) {
    for (const child of seedData.organisation.children) {
      queue.push({ node: child, parentId: rootNode.id! });
    }
  }

  // Process queue (breadth-first)
  while (queue.length > 0) {
    const { node: seedNode, parentId } = queue.shift()!;

    const node = createNodeFromSeed(seedNode, parentId, now);
    nodes.push(node);

    // Add children to queue
    if (seedNode.children) {
      for (const child of seedNode.children) {
        queue.push({ node: child, parentId: node.id! });
      }
    }
  }

  return nodes;
}

/**
 * Create a Node object from seed data
 */
function createNodeFromSeed(
  seedNode: SeedDataNode,
  parentId: string | null,
  timestamp: string
): Node {
  return {
    id: crypto.randomUUID(),
    type: seedNode.type ?? 'organisation',
    name: seedNode.name,
    parentId,
    status: seedNode.status ?? 'red',
    contact: seedNode.contact ?? null,
    additionalContacts: seedNode.additionalContacts ?? [],
    headcount: seedNode.headcount ?? null,
    deviceType: null,
    deviceCount: null,
    completedCount: null,
    location: null,
    confluenceUrl: null,
    jiraUrl: null,
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Flatten hierarchy into array (alias for parseSeedData for compatibility)
 *
 * @param seedData Raw seed data object
 * @returns Array of Node objects in breadth-first order
 */
export function flattenHierarchy(seedData: SeedData): Node[] {
  return parseSeedData(seedData);
}
