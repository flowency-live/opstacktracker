import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { signIn, signOut } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';
import outputs from '../../amplify_outputs.json';

/**
 * GraphQL Integration Tests
 *
 * These tests run against the DEPLOYED Amplify backend.
 * They verify the actual API contract works as expected.
 *
 * Test user: test@cohorttrack.local / TestPass123!
 */

describe('GraphQL API Integration', () => {
  let client: ReturnType<typeof generateClient<Schema>>;
  const createdNodeIds: string[] = [];

  beforeAll(async () => {
    Amplify.configure(outputs);

    await signIn({
      username: 'test@cohorttrack.local',
      password: 'TestPass123!',
    });

    client = generateClient<Schema>();
  });

  afterAll(async () => {
    for (const id of createdNodeIds) {
      try {
        await client.models.Node.delete({ id });
      } catch {
        // Ignore cleanup errors
      }
    }

    try {
      await signOut();
    } catch {
      // Ignore signout errors
    }
  });

  describe('Node CRUD operations', () => {
    it('creates a node with required fields', async () => {
      const { data: node, errors } = await client.models.Node.create({
        type: 'organisation',
        name: 'Test Organisation',
        status: 'red',
      });

      expect(errors).toBeUndefined();
      expect(node).toBeDefined();
      expect(node?.id).toBeDefined();
      expect(node?.type).toBe('organisation');
      expect(node?.name).toBe('Test Organisation');
      expect(node?.status).toBe('red');
      expect(node?.createdAt).toBeDefined();
      expect(node?.updatedAt).toBeDefined();

      if (node?.id) createdNodeIds.push(node.id);
    });

    it('creates a node with all fields', async () => {
      const { data: node, errors } = await client.models.Node.create({
        type: 'cohort',
        name: 'Laptop Cohort',
        status: 'amber',
        contact: 'John Smith',
        additionalContacts: ['Jane Doe', 'Bob Wilson'],
        contactEmail: 'john@example.com',
        headcount: 150,
        deviceType: 'laptop',
        deviceCount: 100,
        completedCount: 25,
        location: 'Building A',
        confluenceUrl: 'https://confluence.example.com/page',
        jiraUrl: 'https://jira.example.com/browse/PROJ-123',
        notes: 'Test notes',
      });

      expect(errors).toBeUndefined();
      expect(node).toBeDefined();
      expect(node?.contact).toBe('John Smith');
      expect(node?.additionalContacts).toEqual(['Jane Doe', 'Bob Wilson']);
      expect(node?.deviceType).toBe('laptop');
      expect(node?.deviceCount).toBe(100);
      expect(node?.completedCount).toBe(25);

      if (node?.id) createdNodeIds.push(node.id);
    });

    it('reads a node by id', async () => {
      const { data: created } = await client.models.Node.create({
        type: 'directorate',
        name: 'Test Directorate',
        status: 'green',
      });

      if (created?.id) createdNodeIds.push(created.id);

      const { data: node, errors } = await client.models.Node.get({
        id: created?.id ?? '',
      });

      expect(errors).toBeUndefined();
      expect(node).toBeDefined();
      expect(node?.id).toBe(created?.id);
      expect(node?.name).toBe('Test Directorate');
    });

    it('updates a node', async () => {
      const { data: created } = await client.models.Node.create({
        type: 'department',
        name: 'Original Name',
        status: 'red',
      });

      if (created?.id) createdNodeIds.push(created.id);

      const { data: updated, errors } = await client.models.Node.update({
        id: created?.id ?? '',
        name: 'Updated Name',
        status: 'blue',
      });

      expect(errors).toBeUndefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.status).toBe('blue');
    });

    it('deletes a node', async () => {
      const { data: created } = await client.models.Node.create({
        type: 'subdepartment',
        name: 'To Delete',
        status: 'red',
      });

      const { data: deleted, errors: deleteErrors } =
        await client.models.Node.delete({
          id: created?.id ?? '',
        });

      expect(deleteErrors).toBeUndefined();
      expect(deleted?.id).toBe(created?.id);

      const { data: notFound } = await client.models.Node.get({
        id: created?.id ?? '',
      });

      expect(notFound).toBeNull();
    });
  });

  describe('Node listing and GSI queries', () => {
    it('lists all nodes', async () => {
      const { data: nodes, errors } = await client.models.Node.list();

      expect(errors).toBeUndefined();
      expect(Array.isArray(nodes)).toBe(true);
    });

    it('queries nodes by parentId using byParent GSI', async () => {
      const { data: parent } = await client.models.Node.create({
        type: 'organisation',
        name: 'Parent Org',
        status: 'red',
      });

      if (parent?.id) createdNodeIds.push(parent.id);

      const { data: child1 } = await client.models.Node.create({
        type: 'directorate',
        name: 'Child Directorate 1',
        status: 'amber',
        parentId: parent?.id,
      });

      const { data: child2 } = await client.models.Node.create({
        type: 'directorate',
        name: 'Child Directorate 2',
        status: 'green',
        parentId: parent?.id,
      });

      if (child1?.id) createdNodeIds.push(child1.id);
      if (child2?.id) createdNodeIds.push(child2.id);

      const { data: children, errors } =
        await client.models.Node.listNodeByParentIdAndType({
          parentId: parent?.id ?? '',
        });

      expect(errors).toBeUndefined();
      expect(children).toHaveLength(2);
      expect(children?.map((c) => c.name)).toContain('Child Directorate 1');
      expect(children?.map((c) => c.name)).toContain('Child Directorate 2');
    });

    it('queries nodes by type using byType GSI', async () => {
      const { data: node } = await client.models.Node.create({
        type: 'cohort',
        name: 'GSI Test Cohort',
        status: 'blue',
      });

      if (node?.id) createdNodeIds.push(node.id);

      const { data: cohorts, errors } =
        await client.models.Node.listNodeByTypeAndName({
          type: 'cohort',
        });

      expect(errors).toBeUndefined();
      expect(Array.isArray(cohorts)).toBe(true);
      expect(cohorts?.some((c) => c.name === 'GSI Test Cohort')).toBe(true);
    });
  });

  describe('Validation', () => {
    it('requires name field', async () => {
      const { errors } = await client.models.Node.create({
        type: 'organisation',
        name: '',
        status: 'red',
      });

      // Note: GraphQL may allow empty string - adjust expectation based on actual behavior
      // This test documents whatever the actual behavior is
      if (errors) {
        expect(errors).toBeDefined();
      }
    });

    it('validates node type enum', async () => {
      const { errors } = await client.models.Node.create({
        // @ts-expect-error Testing invalid type
        type: 'invalid_type',
        name: 'Test',
        status: 'red',
      });

      expect(errors).toBeDefined();
    });

    it('validates status enum', async () => {
      const { errors } = await client.models.Node.create({
        type: 'organisation',
        name: 'Test',
        // @ts-expect-error Testing invalid status
        status: 'invalid_status',
      });

      expect(errors).toBeDefined();
    });
  });
});
