import { useState, useMemo } from 'react';
import type { Node } from '../../domain/node.schema';
import { OrgChartCard } from './OrgChartCard';

export interface OrgChartProps {
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

export function OrgChart({
  nodes,
  onSelect,
  selectedNodeId,
  isLoading = false,
  error = null,
}: OrgChartProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    return new Set(
      nodes
        .filter((n) => n.type !== 'cohort')
        .map((n) => n.id)
        .filter((id): id is string => id !== undefined)
    );
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

  const renderNode = (node: Node): React.ReactNode => {
    if (!node.id) return null;

    const children = childrenMap.get(node.id) ?? [];
    const nonCohortChildren = children.filter((c) => c.type !== 'cohort');
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const aggregated = aggregatedCounts.get(node.id) ?? { deviceCount: 0, completedCount: 0 };

    // Don't render cohorts as cards in org chart
    if (node.type === 'cohort') {
      return null;
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        <OrgChartCard
          node={node}
          childCount={children.length}
          aggregatedDeviceCount={aggregated.deviceCount}
          aggregatedCompletedCount={aggregated.completedCount}
          isExpanded={isExpanded}
          isSelected={isSelected}
          onToggle={handleToggle}
          onSelect={onSelect}
        />

        {/* Vertical connector line */}
        {nonCohortChildren.length > 0 && isExpanded && (
          <div className="w-px h-4 bg-surface-tertiary" />
        )}

        {/* Children row */}
        {nonCohortChildren.length > 0 && isExpanded && (
          <div className="flex flex-wrap justify-center gap-4">
            {/* Horizontal connector for multiple children */}
            {nonCohortChildren.length > 1 && (
              <div className="absolute w-full h-px bg-surface-tertiary" style={{ top: -8 }} />
            )}
            {nonCohortChildren.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = childrenMap.get(null) ?? [];

  return (
    <div className="overflow-auto p-4">
      <div className="flex flex-col items-center gap-4">
        {rootNodes.map((node) => renderNode(node))}
      </div>
    </div>
  );
}
