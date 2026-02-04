/**
 * DynamoDB Seed Import Script
 *
 * Imports seed data directly to DynamoDB using AWS SDK with IAM credentials.
 *
 * Usage:
 *   npx tsx scripts/import-seed-dynamo.ts --table <TABLE_NAME>
 *   npx tsx scripts/import-seed-dynamo.ts --table <TABLE_NAME> --clear
 *
 * Examples:
 *   npx tsx scripts/import-seed-dynamo.ts --table Node-abc123-main
 *   npx tsx scripts/import-seed-dynamo.ts --table Node-abc123-main --clear
 *
 * Options:
 *   --table <name>  Required. The DynamoDB table name (find in AWS Console)
 *   --clear         Optional. Clear existing data before importing
 *
 * Prerequisites:
 *   - AWS credentials configured (via AWS CLI, environment variables, or IAM role)
 *   - Credentials must have DynamoDB read/write access to the target table
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import seedData from '../.documentation/seed-data.json';

const REGION = 'eu-west-2';

function parseArgs(): { tableName: string; clear: boolean } {
  const args = process.argv.slice(2);
  const tableIndex = args.indexOf('--table');

  if (tableIndex === -1 || tableIndex === args.length - 1) {
    console.error('Error: --table <TABLE_NAME> is required\n');
    console.error('Usage: npx tsx scripts/import-seed-dynamo.ts --table <TABLE_NAME> [--clear]');
    console.error('\nFind your table name in AWS Console > DynamoDB > Tables');
    console.error('Look for a table starting with "Node-" followed by your app ID');
    process.exit(1);
  }

  const tableName = args[tableIndex + 1];
  const clear = args.includes('--clear');

  return { tableName, clear };
}

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
  docClient: DynamoDBDocumentClient,
  tableName: string,
  node: SeedNode,
  type: string,
  parentId: string | null
): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();

  const item: Record<string, unknown> = {
    id,
    type,
    name: node.name,
    status: node.status ?? 'red',
    additionalContacts: node.additionalContacts ?? [],
    createdAt: now,
    updatedAt: now,
    __typename: 'Node',
  };

  if (parentId) {
    item.parentId = parentId;
  }
  if (node.contact) {
    item.contact = node.contact;
  }
  if (node.headcount !== undefined) {
    item.headcount = node.headcount;
  }

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
    })
  );

  return id;
}

async function importNodes(
  docClient: DynamoDBDocumentClient,
  tableName: string,
  nodes: SeedNode[],
  parentId: string | null,
  result: ImportResult
): Promise<void> {
  for (const node of nodes) {
    try {
      const nodeType = node.type ?? 'subdepartment';
      const id = await createNode(docClient, tableName, node, nodeType, parentId);
      result.created++;
      console.log(`  Created: ${node.name} (${nodeType})`);

      if (node.children && node.children.length > 0) {
        await importNodes(docClient, tableName, node.children, id, result);
      }
    } catch (error) {
      const message = `Failed to create ${node.name}: ${error}`;
      result.errors.push(message);
      console.error(`  Error: ${message}`);
    }
  }
}

async function clearTable(
  docClient: DynamoDBDocumentClient,
  tableName: string
): Promise<number> {
  let deleted = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await docClient.send(
      new ScanCommand({
        TableName: tableName,
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
          TableName: tableName,
          Key: { id: item.id },
        })
      );
      deleted++;
    }
  }

  return deleted;
}

async function main(): Promise<void> {
  const { tableName, clear } = parseArgs();

  const client = new DynamoDBClient({ region: REGION });
  const docClient = DynamoDBDocumentClient.from(client);

  console.log('CohortTrack Seed Data Import');
  console.log('============================\n');
  console.log(`Table:  ${tableName}`);
  console.log(`Region: ${REGION}\n`);

  if (clear) {
    console.log('Clearing existing data...');
    const deleted = await clearTable(docClient, tableName);
    console.log(`Deleted ${deleted} items.\n`);
  }

  const result: ImportResult = {
    created: 0,
    errors: [],
  };

  console.log('Importing seed data...\n');

  const org = seedData.organisation;
  const orgId = await createNode(
    docClient,
    tableName,
    { name: org.name, status: 'red' },
    'organisation',
    null
  );
  result.created++;
  console.log(`  Created: ${org.name} (organisation)`);

  if (org.children && org.children.length > 0) {
    await importNodes(docClient, tableName, org.children, orgId, result);
  }

  console.log('\n============================');
  console.log(`Import complete: ${result.created} nodes created`);
  if (result.errors.length > 0) {
    console.log(`Errors: ${result.errors.length}`);
    result.errors.forEach((e) => console.error(`  - ${e}`));
  }
}

main().catch((error) => {
  console.error('Import failed:', error.message);
  process.exit(1);
});
