import type { Node, DeviceType } from '../../domain/node.schema';

interface CohortRibbonProps {
  node: Node;
  isSelected: boolean;
  onSelect: (node: Node) => void;
}

const DeviceIcon = ({ deviceType }: { deviceType: DeviceType | null }) => {
  const iconClass = 'w-4 h-4 text-text-secondary';

  switch (deviceType) {
    case 'laptop':
      return (
        <svg
          data-testid="device-icon-laptop"
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );

    case 'sharedDesktop':
      return (
        <svg
          data-testid="device-icon-sharedDesktop"
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      );

    case 'kiosk':
      return (
        <svg
          data-testid="device-icon-kiosk"
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );

    case 'displayUnit':
      return (
        <svg
          data-testid="device-icon-displayUnit"
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 8h8M8 11h5"
          />
        </svg>
      );

    default:
      return (
        <svg
          data-testid="device-icon-default"
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
  }
};

export function CohortRibbon({
  node,
  isSelected,
  onSelect,
}: CohortRibbonProps) {
  const completedCount = node.completedCount ?? 0;
  const deviceCount = node.deviceCount ?? 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node);
  };

  return (
    <div
      data-testid="cohort-ribbon"
      onClick={handleClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-surface-tertiary/50 hover:bg-surface-hover
        cursor-pointer transition-colors
        ${isSelected ? 'ring-2 ring-accent' : ''}
      `}
    >
      {/* Device Type Icon */}
      <DeviceIcon deviceType={node.deviceType ?? null} />

      {/* Status Indicator */}
      <div
        data-testid="status-indicator"
        className={`status-indicator status-${node.status}`}
      />

      {/* Name */}
      <span className="font-medium text-text-primary text-sm truncate flex-grow">
        {node.name}
      </span>

      {/* Device Count Badge */}
      <span className="device-badge text-xs whitespace-nowrap">
        {completedCount}/{deviceCount}
      </span>

      {/* External Links */}
      <div className="flex items-center gap-1">
        {node.confluenceUrl && (
          <a
            href={node.confluenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="confluence-link"
            onClick={(e) => e.stopPropagation()}
            className="text-text-tertiary hover:text-accent"
            title="Confluence"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.96 16.54c-.28.46-.6.96-.96 1.46.96.94 2.96 2 5 2 3.08 0 5.56-2.08 6.84-4.5.28-.46.6-.96.92-1.42-.92-.5-2-1.08-3.08-1.08-3.08 0-5.64 1.54-8.72 3.54zm18.08-9.08c.28-.46.6-.96.96-1.46-.96-.94-2.96-2-5-2-3.08 0-5.56 2.08-6.84 4.5-.28.46-.6.96-.92 1.42.92.5 2 1.08 3.08 1.08 3.08 0 5.64-1.54 8.72-3.54z" />
            </svg>
          </a>
        )}
        {node.jiraUrl && (
          <a
            href={node.jiraUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="jira-link"
            onClick={(e) => e.stopPropagation()}
            className="text-text-tertiary hover:text-accent"
            title="Jira"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.15 2a9.85 9.85 0 100 19.69 9.85 9.85 0 000-19.69zm0 17.54a7.69 7.69 0 110-15.38 7.69 7.69 0 010 15.38z" />
              <path d="M16.92 7.08L12 12l4.92 4.92c2.73-2.73 2.73-7.11 0-9.84zM7.08 7.08L12 12 7.08 16.92c-2.73-2.73-2.73-7.11 0-9.84z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
