import { describe, it, expect } from 'vitest';
import { NodeSchema, NodeType, Status, DeviceType, createNode } from './node.schema';

describe('Node Schema Validation', () => {
  describe('NodeType enum', () => {
    it('accepts valid node types', () => {
      const validTypes: NodeType[] = [
        'organisation',
        'directorate',
        'department',
        'subdepartment',
        'cohort',
      ];

      validTypes.forEach((type) => {
        expect(() => NodeSchema.parse({ type, name: 'Test', status: 'red' })).not.toThrow();
      });
    });

    it('rejects invalid node type', () => {
      expect(() => NodeSchema.parse({ type: 'invalid', name: 'Test', status: 'red' })).toThrow();
    });
  });

  describe('Status enum', () => {
    it('accepts valid status values (RAGB model)', () => {
      const validStatuses: Status[] = ['red', 'amber', 'green', 'blue'];

      validStatuses.forEach((status) => {
        expect(() =>
          NodeSchema.parse({ type: 'cohort', name: 'Test', status })
        ).not.toThrow();
      });
    });

    it('rejects invalid status', () => {
      expect(() =>
        NodeSchema.parse({ type: 'cohort', name: 'Test', status: 'yellow' })
      ).toThrow();
    });
  });

  describe('DeviceType enum', () => {
    it('accepts valid device types for cohorts', () => {
      const validDeviceTypes: DeviceType[] = [
        'laptop',
        'sharedDesktop',
        'kiosk',
        'displayUnit',
      ];

      validDeviceTypes.forEach((deviceType) => {
        expect(() =>
          NodeSchema.parse({
            type: 'cohort',
            name: 'Test',
            status: 'red',
            deviceType,
          })
        ).not.toThrow();
      });
    });

    it('rejects invalid device type', () => {
      expect(() =>
        NodeSchema.parse({
          type: 'cohort',
          name: 'Test',
          status: 'red',
          deviceType: 'tablet',
        })
      ).toThrow();
    });
  });

  describe('Required fields', () => {
    it('requires type field', () => {
      expect(() => NodeSchema.parse({ name: 'Test', status: 'red' })).toThrow();
    });

    it('requires name field', () => {
      expect(() => NodeSchema.parse({ type: 'cohort', status: 'red' })).toThrow();
    });

    it('requires status field', () => {
      expect(() => NodeSchema.parse({ type: 'cohort', name: 'Test' })).toThrow();
    });

    it('requires name to be non-empty', () => {
      expect(() =>
        NodeSchema.parse({ type: 'cohort', name: '', status: 'red' })
      ).toThrow();
    });
  });

  describe('Optional fields', () => {
    it('allows parentId to be null for root organisation', () => {
      const result = NodeSchema.parse({
        type: 'organisation',
        name: 'British Airways',
        status: 'red',
        parentId: null,
      });
      expect(result.parentId).toBeNull();
    });

    it('allows parentId to be a string for child nodes', () => {
      const result = NodeSchema.parse({
        type: 'directorate',
        name: 'Heathrow Operations',
        status: 'red',
        parentId: 'org-123',
      });
      expect(result.parentId).toBe('org-123');
    });

    it('allows contact fields to be null', () => {
      const result = NodeSchema.parse({
        type: 'cohort',
        name: 'Test',
        status: 'red',
        contact: null,
        contactEmail: null,
      });
      expect(result.contact).toBeNull();
      expect(result.contactEmail).toBeNull();
    });

    it('allows additionalContacts to be an empty array', () => {
      const result = NodeSchema.parse({
        type: 'cohort',
        name: 'Test',
        status: 'red',
        additionalContacts: [],
      });
      expect(result.additionalContacts).toEqual([]);
    });

    it('allows additionalContacts to have multiple entries', () => {
      const contacts = ['Alice Smith', 'Bob Jones'];
      const result = NodeSchema.parse({
        type: 'cohort',
        name: 'Test',
        status: 'red',
        additionalContacts: contacts,
      });
      expect(result.additionalContacts).toEqual(contacts);
    });

    it('allows headcount to be null or a positive integer', () => {
      const resultNull = NodeSchema.parse({
        type: 'department',
        name: 'Test',
        status: 'red',
        headcount: null,
      });
      expect(resultNull.headcount).toBeNull();

      const resultNumber = NodeSchema.parse({
        type: 'department',
        name: 'Test',
        status: 'red',
        headcount: 150,
      });
      expect(resultNumber.headcount).toBe(150);
    });

    it('allows external URLs to be null or valid URLs', () => {
      const result = NodeSchema.parse({
        type: 'cohort',
        name: 'Test',
        status: 'red',
        confluenceUrl: 'https://confluence.example.com/page',
        jiraUrl: null,
      });
      expect(result.confluenceUrl).toBe('https://confluence.example.com/page');
      expect(result.jiraUrl).toBeNull();
    });

    it('allows notes to be null or a string', () => {
      const result = NodeSchema.parse({
        type: 'cohort',
        name: 'Test',
        status: 'red',
        notes: 'Important note about this cohort',
      });
      expect(result.notes).toBe('Important note about this cohort');
    });
  });

  describe('Cohort-specific fields', () => {
    it('allows deviceType, deviceCount, completedCount for cohorts', () => {
      const result = NodeSchema.parse({
        type: 'cohort',
        name: 'Senior Managers Laptops',
        status: 'amber',
        deviceType: 'laptop',
        deviceCount: 25,
        completedCount: 10,
        location: 'T5 Main Building',
      });

      expect(result.deviceType).toBe('laptop');
      expect(result.deviceCount).toBe(25);
      expect(result.completedCount).toBe(10);
      expect(result.location).toBe('T5 Main Building');
    });

    it('allows device counts to be zero', () => {
      const result = NodeSchema.parse({
        type: 'cohort',
        name: 'Test',
        status: 'red',
        deviceCount: 0,
        completedCount: 0,
      });
      expect(result.deviceCount).toBe(0);
      expect(result.completedCount).toBe(0);
    });

    it('rejects negative device counts', () => {
      expect(() =>
        NodeSchema.parse({
          type: 'cohort',
          name: 'Test',
          status: 'red',
          deviceCount: -1,
        })
      ).toThrow();
    });

    it('rejects completedCount greater than deviceCount when both are provided', () => {
      expect(() =>
        NodeSchema.parse({
          type: 'cohort',
          name: 'Test',
          status: 'red',
          deviceCount: 10,
          completedCount: 15,
        })
      ).toThrow();
    });
  });

  describe('Timestamps', () => {
    it('accepts ISO 8601 date strings', () => {
      const result = NodeSchema.parse({
        type: 'cohort',
        name: 'Test',
        status: 'red',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      });
      expect(result.createdAt).toBe('2024-01-15T10:30:00Z');
      expect(result.updatedAt).toBe('2024-01-15T10:30:00Z');
    });
  });

  describe('createNode factory function', () => {
    it('creates a node with generated id', () => {
      const node = createNode({
        type: 'cohort',
        name: 'Test Cohort',
        status: 'red',
      });

      expect(node.id).toBeDefined();
      expect(node.id.length).toBeGreaterThan(0);
    });

    it('creates a node with default status red', () => {
      const node = createNode({
        type: 'cohort',
        name: 'Test Cohort',
      });

      expect(node.status).toBe('red');
    });

    it('creates a node with timestamps', () => {
      const before = new Date().toISOString();
      const node = createNode({
        type: 'cohort',
        name: 'Test Cohort',
        status: 'red',
      });
      const after = new Date().toISOString();

      expect(node.createdAt).toBeDefined();
      expect(node.updatedAt).toBeDefined();
      expect(node.createdAt >= before).toBe(true);
      expect(node.createdAt <= after).toBe(true);
    });

    it('creates a node with empty additionalContacts array by default', () => {
      const node = createNode({
        type: 'cohort',
        name: 'Test Cohort',
        status: 'red',
      });

      expect(node.additionalContacts).toEqual([]);
    });

    it('creates a node with null optional fields by default', () => {
      const node = createNode({
        type: 'cohort',
        name: 'Test Cohort',
        status: 'red',
      });

      expect(node.parentId).toBeNull();
      expect(node.contact).toBeNull();
      expect(node.contactEmail).toBeNull();
      expect(node.headcount).toBeNull();
      expect(node.deviceType).toBeNull();
      expect(node.deviceCount).toBeNull();
      expect(node.completedCount).toBeNull();
      expect(node.location).toBeNull();
      expect(node.confluenceUrl).toBeNull();
      expect(node.jiraUrl).toBeNull();
      expect(node.notes).toBeNull();
    });
  });
});
