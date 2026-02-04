import type { Node, Status } from '../../domain/node.schema';

export interface TreeNodeProps {
  node: Node;
  isExpanded: boolean;
  hasChildren: boolean;
  isSelected?: boolean;
  aggregatedDeviceCount?: number;
  aggregatedCompletedCount?: number;
  onToggle: (nodeId: string) => void;
  onSelect: (node: Node) => void;
  onAddChild?: (node: Node) => void;
}

/**
 * Status color class mapping
 */
const statusClasses: Record<Status, string> = {
  red: 'status-red',
  amber: 'status-amber',
  green: 'status-green',
  blue: 'status-blue',
};

/**
 * TreeNode Component
 *
 * Displays a single node in the hierarchy tree with:
 * - RAGB status indicator
 * - Node name and type
 * - Contact info
 * - Device count badge
 * - External link icons (Confluence, Jira)
 * - Expand/collapse toggle for parent nodes
 */
export function TreeNode({
  node,
  isExpanded,
  hasChildren,
  isSelected = false,
  aggregatedDeviceCount,
  aggregatedCompletedCount,
  onToggle,
  onSelect,
  onAddChild,
}: TreeNodeProps) {
  // Determine device counts to display
  const deviceCount =
    node.type === 'cohort' ? node.deviceCount : aggregatedDeviceCount;
  const completedCount =
    node.type === 'cohort' ? node.completedCount : aggregatedCompletedCount;
  const showDeviceBadge =
    deviceCount !== null && deviceCount !== undefined && deviceCount > 0;

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(node.id!);
  };

  const handleNodeClick = () => {
    onSelect(node);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild?.(node);
  };

  // Cohorts cannot have children
  const canAddChild = node.type !== 'cohort' && onAddChild;

  return (
    <div
      data-testid="tree-node"
      className={`tree-node ${isSelected ? 'tree-node-selected' : ''}`}
      onClick={handleNodeClick}
    >
      {/* Expand/Collapse Toggle */}
      {hasChildren ? (
        <button
          data-testid="expand-toggle"
          aria-expanded={isExpanded}
          onClick={handleToggleClick}
          className="w-5 h-5 flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ) : (
        <div className="w-5" /> // Spacer for alignment
      )}

      {/* Status Indicator */}
      <div
        data-testid="status-indicator"
        className={`status-indicator ${statusClasses[node.status]}`}
      />

      {/* Node Name */}
      <span className="font-medium text-text-primary flex-grow truncate">
        {node.name}
      </span>

      {/* Contact Info */}
      {node.contact && (
        <span
          data-testid="contact-info"
          className="text-sm text-text-secondary truncate max-w-[150px]"
        >
          {node.contact}
        </span>
      )}

      {/* Device Count Badge */}
      {showDeviceBadge && (
        <span data-testid="device-badge" className="device-badge">
          {completedCount ?? 0}/{deviceCount}
        </span>
      )}

      {/* External Links */}
      <div className="flex items-center gap-1">
        {node.confluenceUrl && (
          <a
            data-testid="confluence-link"
            href={node.confluenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-text-tertiary hover:text-text-primary"
            title="Open in Confluence"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.19 14.22c-.21-.36-.34-.72-.34-1.1 0-.37.13-.73.34-1.1l7.17-11.74c.23-.38.57-.68.96-.85.4-.16.83-.19 1.25-.08.42.1.8.34 1.09.69l7.17 11.74c.21.37.34.73.34 1.1 0 .38-.13.74-.34 1.1l-7.17 11.74c-.29.35-.67.59-1.09.69-.42.11-.85.08-1.25-.08-.39-.17-.73-.47-.96-.85L3.19 14.22z" />
            </svg>
          </a>
        )}

        {node.jiraUrl && (
          <a
            data-testid="jira-link"
            href={node.jiraUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-text-tertiary hover:text-text-primary"
            title="Open in Jira"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.53.67L4.84 7.36a1.15 1.15 0 000 1.62l6.69 6.69a1.15 1.15 0 001.62 0l6.69-6.69a1.15 1.15 0 000-1.62L13.15.67a1.15 1.15 0 00-1.62 0zM12 6.85l1.32 1.32L12 9.49l-1.32-1.32L12 6.85z" />
            </svg>
          </a>
        )}
      </div>

      {/* Add Child Button */}
      {canAddChild && (
        <button
          data-testid="add-child-button"
          onClick={handleAddClick}
          className="w-6 h-6 flex items-center justify-center text-text-tertiary hover:text-accent hover:bg-surface-hover rounded transition-colors"
          title="Add child node"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
}
