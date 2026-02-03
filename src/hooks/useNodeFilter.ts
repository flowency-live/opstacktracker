import { useState, useMemo } from 'react';
import type { Node, Status, NodeType } from '../domain/node.schema';

interface UseNodeFilterResult {
  filteredNodes: Node[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: Status | null;
  setStatusFilter: (status: Status | null) => void;
  typeFilter: NodeType | null;
  setTypeFilter: (type: NodeType | null) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useNodeFilter(nodes: Node[]): UseNodeFilterResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [typeFilter, setTypeFilter] = useState<NodeType | null>(null);

  const hasActiveFilters = Boolean(searchQuery || statusFilter || typeFilter);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      // Search filter (case-insensitive name match)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!node.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && node.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter && node.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [nodes, searchQuery, statusFilter, typeFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setTypeFilter(null);
  };

  return {
    filteredNodes,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    resetFilters,
    hasActiveFilters,
  };
}
