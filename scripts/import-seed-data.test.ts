import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { signIn, signOut } from 'aws-amplify/auth';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';
import { importSeedData, clearAllNodes } from './import-seed-data';
import seedData from '../.documentation/seed-data.json';

/**
 * Seed Data Import Integration Tests
 *
 * Tests the import script against the deployed backend.
 * These tests create real data in DynamoDB.
 *
 * Note: These are slow integration tests (30+ seconds total)
 */

describe('Seed Data Import', { timeout: 60000 }, () => {
  let client: ReturnType<typeof generateClient<Schema>>;

  beforeAll(async () => {
    Amplify.configure(outputs);

    await signIn({
      username: 'test@cohorttrack.local',
      password: 'TestPass123!',
    });

    client = generateClient<Schema>();

    await clearAllNodes(client);
  }, 30000);

  afterAll(async () => {
    await clearAllNodes(client);

    try {
      await signOut();
    } catch {
      // Ignore signout errors
    }
  }, 30000);

  describe('importSeedData', () => {
    it('imports the complete hierarchy', async () => {
      const result = await importSeedData(client, seedData);

      expect(result.success).toBe(true);
      expect(result.nodesCreated).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);

      const { data: orgs } = await client.models.Node.listNodeByTypeAndName({
        type: 'organisation',
      });

      const baOrg = orgs?.find((n) => n.name === 'British Airways');
      expect(baOrg).toBeDefined();
      expect(baOrg?.parentId).toBeNull();

      const { data: directorates } =
        await client.models.Node.listNodeByTypeAndName({
          type: 'directorate',
        });

      const heathrow = directorates?.find((n) =>
        n.name.includes('Heathrow Operations')
      );
      expect(heathrow).toBeDefined();
      expect(heathrow?.contact).toBe('Tom Moran');
      expect(heathrow?.headcount).toBe(6419);

      const { data: children } =
        await client.models.Node.listNodeByParentIdAndType({
          parentId: baOrg?.id ?? '',
        });

      expect(children?.length).toBeGreaterThan(0);
      expect(children?.some((c) => c.name.includes('Heathrow'))).toBe(true);
    }, 30000);

    it('preserves contact information and additional contacts', async () => {
      const { data: subdepts } =
        await client.models.Node.listNodeByTypeAndName({
          type: 'subdepartment',
        });

      const dispatch = subdepts?.find((n) => n.name === 'Aircraft Dispatch');
      expect(dispatch?.contact).toBe('Jamie Stroud');
      expect(dispatch?.additionalContacts).toContain('Andy Brown');
    });

    it('preserves status values', async () => {
      const { data: depts } = await client.models.Node.listNodeByTypeAndName({
        type: 'department',
      });

      const baggage = depts?.find((n) => n.name === 'Baggage and Logistics');
      expect(baggage?.status).toBe('red');

      const customerExp = depts?.find((n) => n.name === 'Customer Experience');
      expect(customerExp?.status).toBe('amber');
    });

    it('is idempotent (skips existing nodes on re-import)', async () => {
      const result = await importSeedData(client, seedData);

      expect(result.success).toBe(true);
      expect(result.nodesCreated).toBe(0);
      expect(result.nodesSkipped).toBeGreaterThan(0);
    }, 30000);
  });

  describe('clearAllNodes', () => {
    it('removes all nodes from database', async () => {
      const { data: beforeClear } = await client.models.Node.list();
      expect(beforeClear?.length).toBeGreaterThan(0);

      await clearAllNodes(client);

      const { data: afterClear } = await client.models.Node.list();
      expect(afterClear?.length).toBe(0);
    }, 30000);
  });
});
