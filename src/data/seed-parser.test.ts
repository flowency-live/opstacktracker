import { describe, it, expect } from 'vitest';
import { parseSeedData, type SeedData } from './seed-parser';

describe('Seed Data Parser', () => {
  describe('parseSeedData', () => {
    it('parses organisation as root node', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [],
        },
      };

      const result = parseSeedData(seedData);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('organisation');
      expect(result[0].name).toBe('British Airways');
      expect(result[0].parentId).toBeNull();
    });

    it('generates UUID for each node', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [],
        },
      };

      const result = parseSeedData(seedData);

      expect(result[0].id).toBeDefined();
      expect(result[0].id!.length).toBeGreaterThan(0);
      // UUID format validation
      expect(result[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('maintains parent-child relationships', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'directorate',
              name: 'Heathrow Operations',
              children: [],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);

      expect(result).toHaveLength(2);

      const org = result.find((n) => n.type === 'organisation');
      const directorate = result.find((n) => n.type === 'directorate');

      expect(org).toBeDefined();
      expect(directorate).toBeDefined();
      expect(directorate!.parentId).toBe(org!.id);
    });

    it('parses nested hierarchy correctly', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'directorate',
              name: 'Heathrow Operations',
              children: [
                {
                  type: 'department',
                  name: 'Baggage',
                  children: [
                    {
                      type: 'subdepartment',
                      name: 'Logistics',
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);

      expect(result).toHaveLength(4);

      const org = result.find((n) => n.name === 'British Airways');
      const directorate = result.find((n) => n.name === 'Heathrow Operations');
      const department = result.find((n) => n.name === 'Baggage');
      const subdepartment = result.find((n) => n.name === 'Logistics');

      expect(directorate!.parentId).toBe(org!.id);
      expect(department!.parentId).toBe(directorate!.id);
      expect(subdepartment!.parentId).toBe(department!.id);
    });

    it('preserves contact information', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'directorate',
              name: 'Heathrow Operations',
              contact: 'Tom Moran',
              children: [],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);
      const directorate = result.find((n) => n.type === 'directorate');

      expect(directorate!.contact).toBe('Tom Moran');
    });

    it('preserves additional contacts', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'subdepartment',
              name: 'Aircraft Dispatch',
              contact: 'Jamie Stroud',
              additionalContacts: ['Andy Brown', 'Samantha Major'],
              children: [],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);
      const subdept = result.find((n) => n.name === 'Aircraft Dispatch');

      expect(subdept!.additionalContacts).toEqual(['Andy Brown', 'Samantha Major']);
    });

    it('preserves headcount', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'directorate',
              name: 'Heathrow Operations',
              headcount: 6419,
              children: [],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);
      const directorate = result.find((n) => n.type === 'directorate');

      expect(directorate!.headcount).toBe(6419);
    });

    it('preserves status from seed data', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'directorate',
              name: 'Heathrow Operations',
              status: 'amber',
              children: [],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);
      const directorate = result.find((n) => n.type === 'directorate');

      expect(directorate!.status).toBe('amber');
    });

    it('defaults status to red if not provided', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'directorate',
              name: 'Heathrow Operations',
              children: [],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);
      const directorate = result.find((n) => n.type === 'directorate');

      expect(directorate!.status).toBe('red');
    });

    it('sets timestamps for all nodes', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [],
        },
      };

      const before = new Date().toISOString();
      const result = parseSeedData(seedData);
      const after = new Date().toISOString();

      expect(result[0].createdAt).toBeDefined();
      expect(result[0].updatedAt).toBeDefined();
      expect(result[0].createdAt! >= before).toBe(true);
      expect(result[0].createdAt! <= after).toBe(true);
    });
  });

  describe('flattenHierarchy', () => {
    it('returns nodes in breadth-first order (parents before children)', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'directorate',
              name: 'Heathrow Operations',
              children: [
                {
                  type: 'department',
                  name: 'Baggage',
                  children: [],
                },
              ],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);

      // Organisation should come first
      expect(result[0].type).toBe('organisation');
      // Directorate before department
      const directorateIndex = result.findIndex((n) => n.type === 'directorate');
      const departmentIndex = result.findIndex((n) => n.type === 'department');
      expect(directorateIndex).toBeLessThan(departmentIndex);
    });

    it('handles empty children arrays', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [],
        },
      };

      const result = parseSeedData(seedData);

      expect(result).toHaveLength(1);
    });
  });

  describe('Validation', () => {
    it('validates all nodes against schema', () => {
      const seedData: SeedData = {
        organisation: {
          name: 'British Airways',
          children: [
            {
              type: 'directorate',
              name: 'Heathrow Operations',
              contact: 'Tom Moran',
              headcount: 6419,
              status: 'red',
              children: [],
            },
          ],
        },
      };

      const result = parseSeedData(seedData);

      // All nodes should be valid Node objects
      result.forEach((node) => {
        expect(node.id).toBeDefined();
        expect(node.type).toBeDefined();
        expect(node.name).toBeDefined();
        expect(node.status).toBeDefined();
      });
    });
  });
});
