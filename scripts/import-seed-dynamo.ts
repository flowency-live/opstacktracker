/**
 * Direct DynamoDB Import Script
 *
 * Imports seed data directly to DynamoDB using AWS SDK with IAM credentials.
 * This bypasses Cognito authentication for data seeding purposes.
 *
 * Usage: npx tsx scripts/import-seed-dynamo.ts
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import seedData from '../.documentation/seed-data.json';

const TABLE_NAME = 'Node-3ic2wfea5veqbl3cav35soxzh4-NONE';
const REGION = 'eu-west-2';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

interface SeedNode {
  type?: string;
  name: string;
  contact?: string;
  additionalContacts?: string[];
  headcount?: number;
  status?: string;
  children?: SeedNode[];
}

interface ImportResult {
  created: number;
  errors: string[];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function createNode(
  node: SeedNode,
  type: string,
  parentId: string | null
): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();

  const item = {
    id,
    type,
    name: node.name,
    parentId: parentId ?? undefined,
    status: node.status ?? 'red',
    contact: node.contact ?? undefined,
    additionalContacts: node.additionalContacts ?? [],
    headcount: node.headcount ?? undefined,
    createdAt: now,
    updatedAt: now,
    __typename: 'Node',
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return id;
}

async function importNodes(
  nodes: SeedNode[],
  parentId: string | null,
  result: ImportResult
): Promise<void> {
  for (const node of nodes) {
    try {
      const nodeType = node.type ?? 'subdepartment';
      const id = await createNode(node, nodeType, parentId);
      result.created++;
      console.log(`Created: ${node.name} (${nodeType})`);

      if (node.children && node.children.length > 0) {
        await importNodes(node.children, id, result);
      }
    } catch (error) {
      const message = `Failed to create ${node.name}: ${error}`;
      result.errors.push(message);
      console.error(message);
    }
  }
}

async function clearTable(): Promise<number> {
  let deleted = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: 25,
        ProjectionExpression: 'id',
      })
    );

    const items = response.Items ?? [];
    if (items.length === 0) {
      hasMore = false;
      break;
    }

    for (const item of items) {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id: item.id },
        })
      );
      deleted++;
    }
  }

  return deleted;
}

async function main(): Promise<void> {
  console.log('CohortTrack Seed Data Import');
  console.log('============================\n');
  console.log(`Table: ${TABLE_NAME}`);
  console.log(`Region: ${REGION}\n`);

  // Check for --clear flag
  if (process.argv.includes('--clear')) {
    console.log('Clearing existing data...');
    const deleted = await clearTable();
    console.log(`Deleted ${deleted} items.\n`);
  }

  const result: ImportResult = {
    created: 0,
    errors: [],
  };

  // Import organisation (root)
  const org = seedData.organisation;
  const orgId = await createNode(
    { name: org.name, status: 'red' },
    'organisation',
    null
  );
  result.created++;
  console.log(`Created: ${org.name} (organisation)`);

  // Import children
  if (org.children && org.children.length > 0) {
    await importNodes(org.children, orgId, result);
  }

  console.log('\n============================');
  console.log(`Import complete: ${result.created} nodes created`);
  if (result.errors.length > 0) {
    console.log(`Errors: ${result.errors.length}`);
    result.errors.forEach((e) => console.error(`  - ${e}`));
  }
}

main().catch(console.error);
