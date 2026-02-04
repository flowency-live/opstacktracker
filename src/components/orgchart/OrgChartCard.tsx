import type { Node } from '../../domain/node.schema';

interface OrgChartCardProps {
  node: Node;
  childCount: number;
  aggregatedDeviceCount: number;
  aggregatedCompletedCount: number;
  isExpanded: boolean;
  isSelected?: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (node: Node) => void;
}

const typeLabels: Record<string, string> = {
  organisation: 'Organisation',
  directorate: 'Directorate',
  department: 'Department',
  subdepartment: 'Subdepartment',
  cohort: 'Cohort',
};

const childTypeLabels: Record<string, string> = {
  organisation: 'directorates',
  directorate: 'departments',
  department: 'subdepts',
  subdepartment: 'cohorts',
  cohort: '',
};

export function OrgChartCard({
  node,
  childCount,
  aggregatedDeviceCount,
  aggregatedCompletedCount,
  isExpanded,
  isSelected = false,
  onToggle,
  onSelect,
}: OrgChartCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.id) {
      onToggle(node.id);
    }
  };

  const hasChildren = childCount > 0;

  return (
    <div
      data-testid="org-chart-card"
      onClick={handleClick}
      className={`
        w-48 bg-surface-secondary border border-surface-tertiary rounded-lg p-3
        shadow-sm hover:shadow-md transition-shadow cursor-pointer
        ${isSelected ? 'ring-2 ring-accent' : ''}
      `}
    >
      {/* Header with status */}
      <div className="flex items-center gap-2 mb-2">
        <div
          data-testid="status-indicator"
          className={`status-indicator status-${node.status}`}
        />
        <span className="text-xs text-text-tertiary">
          {typeLabels[node.type] ?? node.type}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-text-primary text-sm truncate mb-1">
        {node.name}
      </h3>

      {/* Contact */}
      {node.contact && (
        <p className="text-xs text-text-secondary truncate mb-2">
          {node.contact}
        </p>
      )}

      {/* Stats Row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Device Count */}
        <span className="device-badge">
          {aggregatedCompletedCount}/{aggregatedDeviceCount}
        </span>

        {/* Child Count */}
        {hasChildren && (
          <span className="text-text-tertiary">
            {childCount} {childTypeLabels[node.type] ?? 'children'}
          </span>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {hasChildren && (
        <button
          data-testid={isExpanded ? 'collapse-btn' : 'expand-btn'}
          onClick={handleToggleClick}
          className="w-full mt-2 py-1 text-xs text-text-secondary hover:text-text-primary bg-surface-tertiary hover:bg-surface-hover rounded transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      )}
    </div>
  );
}
