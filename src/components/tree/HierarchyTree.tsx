import { useState, useMemo } from 'react';
import type { Node } from '../../domain/node.schema';
import { TreeNode } from './TreeNode';

export interface HierarchyTreeProps {
  nodes: Node[];
  onSelect: (node: Node) => void;
  selectedNodeId: string | null;
  isLoading?: boolean;
  error?: string | null;
}

interface AggregatedCounts {
  deviceCount: number;
  completedCount: number;
}

/**
 * Calculate aggregated device counts for each node
 *
 * Recursively sums device counts from all descendant cohorts.
 */
function calculateAggregatedCounts(
  nodes: Node[],
  childrenMap: Map<string | null, Node[]>
): Map<string, AggregatedCounts> {
  const result = new Map<string, AggregatedCounts>();

  function aggregate(nodeId: string): AggregatedCounts {
    if (result.has(nodeId)) {
      return result.get(nodeId)!;
    }

    const children = childrenMap.get(nodeId) ?? [];
    let deviceCount = 0;
    let completedCount = 0;

    for (const child of children) {
      if (!child.id) continue;

      if (child.type === 'cohort') {
        deviceCount += child.deviceCount ?? 0;
        completedCount += child.completedCount ?? 0;
      } else {
        const childAggregated = aggregate(child.id);
        deviceCount += childAggregated.deviceCount;
        completedCount += childAggregated.completedCount;
      }
    }

    const counts = { deviceCount, completedCount };
    result.set(nodeId, counts);
    return counts;
  }

  for (const node of nodes) {
    if (node.id) {
      aggregate(node.id);
    }
  }

  return result;
}

/**
 * HierarchyTree Component
 *
 * Renders a hierarchical tree of nodes with:
 * - Expand/collapse functionality
 * - Node selection
 * - Aggregated device counts
 * - Loading and error states
 */
export function HierarchyTree({
  nodes,
  onSelect,
  selectedNodeId,
  isLoading = false,
  error = null,
}: HierarchyTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    return new Set(nodes.map((n) => n.id).filter((id): id is string => id !== undefined));
  });

  const childrenMap = useMemo(() => {
    const map = new Map<string | null, Node[]>();

    for (const node of nodes) {
      const parentId = node.parentId ?? null;
      const existing = map.get(parentId) ?? [];
      map.set(parentId, [...existing, node]);
    }

    return map;
  }, [nodes]);

  const aggregatedCounts = useMemo(() => {
    return calculateAggregatedCounts(nodes, childrenMap);
  }, [nodes, childrenMap]);

  const handleToggle = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div data-testid="loading-indicator" className="flex items-center justify-center p-8">
        <div className="animate-spin w-6 h-6 border-2 border-status-blue border-t-transparent rounded-full" />
        <span className="ml-2 text-text-secondary">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-surface-secondary rounded text-status-red">
        {error}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="p-8 text-center text-text-tertiary">
        No data available
      </div>
    );
  }

  const renderNode = (node: Node, depth: number = 0): React.ReactNode => {
    if (!node.id) return null;

    const children = childrenMap.get(node.id) ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedNodeId === node.id;

    const aggregated = aggregatedCounts.get(node.id);

    return (
      <div key={node.id} style={{ marginLeft: depth * 16 }}>
        <TreeNode
          node={node}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          isSelected={isSelected}
          aggregatedDeviceCount={aggregated?.deviceCount}
          aggregatedCompletedCount={aggregated?.completedCount}
          onToggle={handleToggle}
          onSelect={onSelect}
        />

        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = childrenMap.get(null) ?? [];

  return (
    <div className="space-y-1">
      {rootNodes.map((node) => renderNode(node))}
    </div>
  );
}
