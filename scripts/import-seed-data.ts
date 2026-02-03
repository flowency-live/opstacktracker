import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import type { SeedData } from '../src/data/seed-parser';

type Client = ReturnType<typeof generateClient<Schema>>;

interface ImportResult {
  success: boolean;
  nodesCreated: number;
  nodesSkipped: number;
  errors: string[];
}

interface NodeToCreate {
  type: 'organisation' | 'directorate' | 'department' | 'subdepartment' | 'cohort';
  name: string;
  parentId: string | null;
  status: 'red' | 'amber' | 'green' | 'blue';
  contact?: string;
  additionalContacts?: string[];
  headcount?: number;
}

/**
 * Import seed data into DynamoDB via GraphQL API
 *
 * - Parses hierarchical seed data
 * - Creates nodes in breadth-first order (parents before children)
 * - Skips nodes that already exist (idempotent)
 * - Maintains parent-child relationships
 */
export async function importSeedData(
  client: Client,
  seedData: SeedData
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    nodesCreated: 0,
    nodesSkipped: 0,
    errors: [],
  };

  const idMap = new Map<string, string>();

  try {
    const existingOrg = await findNodeByName(
      client,
      'organisation',
      seedData.organisation.name
    );

    if (existingOrg) {
      result.nodesSkipped++;
      idMap.set(seedData.organisation.name, existingOrg.id);
      await processChildren(
        client,
        seedData.organisation.children ?? [],
        existingOrg.id,
        idMap,
        result
      );
      return result;
    }

    const { data: orgNode, errors } = await client.models.Node.create({
      type: 'organisation',
      name: seedData.organisation.name,
      status: seedData.organisation.status ?? 'red',
      contact: seedData.organisation.contact ?? null,
      additionalContacts: seedData.organisation.additionalContacts ?? [],
      headcount: seedData.organisation.headcount ?? null,
    });

    if (errors) {
      result.success = false;
      result.errors.push(`Failed to create organisation: ${JSON.stringify(errors)}`);
      return result;
    }

    result.nodesCreated++;
    idMap.set(seedData.organisation.name, orgNode?.id ?? '');

    await processChildren(
      client,
      seedData.organisation.children ?? [],
      orgNode?.id ?? '',
      idMap,
      result
    );
  } catch (error) {
    result.success = false;
    result.errors.push(`Import failed: ${String(error)}`);
  }

  return result;
}

async function processChildren(
  client: Client,
  children: SeedData['organisation']['children'],
  parentId: string,
  idMap: Map<string, string>,
  result: ImportResult
): Promise<void> {
  if (!children) return;

  for (const child of children) {
    const nodeType = child.type as NodeToCreate['type'];
    const uniqueKey = `${parentId}:${child.name}`;

    const existing = await findChildByName(client, parentId, child.name);

    if (existing) {
      result.nodesSkipped++;
      idMap.set(uniqueKey, existing.id);
      await processChildren(client, child.children ?? [], existing.id, idMap, result);
      continue;
    }

    const { data: node, errors } = await client.models.Node.create({
      type: nodeType,
      name: child.name,
      parentId,
      status: child.status ?? 'red',
      contact: child.contact ?? null,
      additionalContacts: child.additionalContacts ?? [],
      headcount: child.headcount ?? null,
    });

    if (errors) {
      result.errors.push(`Failed to create ${child.name}: ${JSON.stringify(errors)}`);
      continue;
    }

    result.nodesCreated++;
    idMap.set(uniqueKey, node?.id ?? '');

    await processChildren(client, child.children ?? [], node?.id ?? '', idMap, result);
  }
}

async function findNodeByName(
  client: Client,
  type: string,
  name: string
): Promise<{ id: string } | null> {
  const { data: nodes } = await client.models.Node.listNodeByTypeAndName({
    type: type as 'organisation' | 'directorate' | 'department' | 'subdepartment' | 'cohort',
  });

  const match = nodes?.find((n) => n.name === name);
  return match ? { id: match.id } : null;
}

async function findChildByName(
  client: Client,
  parentId: string,
  name: string
): Promise<{ id: string } | null> {
  const { data: children } = await client.models.Node.listNodeByParentIdAndType({
    parentId,
  });

  const match = children?.find((n) => n.name === name);
  return match ? { id: match.id } : null;
}

/**
 * Clear all nodes from database
 *
 * Use with caution - deletes ALL data!
 */
export async function clearAllNodes(client: Client): Promise<void> {
  let hasMore = true;

  while (hasMore) {
    const { data: nodes } = await client.models.Node.list({ limit: 100 });

    if (!nodes || nodes.length === 0) {
      hasMore = false;
      break;
    }

    for (const node of nodes) {
      await client.models.Node.delete({ id: node.id });
    }
  }
}

/**
 * CLI entry point for running import
 */
export async function runImport(): Promise<void> {
  const { Amplify } = await import('aws-amplify');
  const { signIn } = await import('aws-amplify/auth');

  const outputs = await import('../amplify_outputs.json');
  const seedData = await import('../.documentation/seed-data.json');

  Amplify.configure(outputs.default);

  const email = process.env.IMPORT_USER_EMAIL;
  const password = process.env.IMPORT_USER_PASSWORD;

  if (!email || !password) {
    console.error('Set IMPORT_USER_EMAIL and IMPORT_USER_PASSWORD environment variables');
    process.exit(1);
  }

  await signIn({ username: email, password });

  const client = generateClient<Schema>();
  const result = await importSeedData(client, seedData.default);

  console.log('Import complete:', result);

  if (!result.success) {
    process.exit(1);
  }
}
