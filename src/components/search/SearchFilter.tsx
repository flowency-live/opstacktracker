import type { Status, NodeType } from '../../domain/node.schema';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: Status | null;
  onStatusFilterChange: (status: Status | null) => void;
  typeFilter: NodeType | null;
  onTypeFilterChange: (type: NodeType | null) => void;
}

const statusOptions: { value: Status | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'red', label: 'Red' },
  { value: 'amber', label: 'Amber' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

const typeOptions: { value: NodeType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'organisation', label: 'Organisation' },
  { value: 'directorate', label: 'Directorate' },
  { value: 'department', label: 'Department' },
  { value: 'subdepartment', label: 'Subdepartment' },
  { value: 'cohort', label: 'Cohort' },
];

export function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: SearchFilterProps) {
  const hasActiveFilters = searchQuery || statusFilter || typeFilter;

  const handleReset = () => {
    onSearchChange('');
    onStatusFilterChange(null);
    onTypeFilterChange(null);
  };

  return (
    <div
      data-testid="search-filter"
      className="flex flex-wrap items-center gap-3"
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="search"
          role="searchbox"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search nodes..."
          className="w-full px-3 py-2 pl-9 bg-surface-tertiary text-text-primary rounded border border-surface-hover focus:outline-none focus:ring-2 focus:ring-status-blue placeholder:text-text-tertiary"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            aria-label="Clear search"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm text-text-tertiary">
          Status
        </label>
        <select
          id="status-filter"
          value={statusFilter ?? ''}
          onChange={(e) =>
            onStatusFilterChange(
              e.target.value === '' ? null : (e.target.value as Status)
            )
          }
          className="px-3 py-2 bg-surface-tertiary text-text-primary rounded border border-surface-hover focus:outline-none focus:ring-2 focus:ring-status-blue"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="type-filter" className="text-sm text-text-tertiary">
          Type
        </label>
        <select
          id="type-filter"
          value={typeFilter ?? ''}
          onChange={(e) =>
            onTypeFilterChange(
              e.target.value === '' ? null : (e.target.value as NodeType)
            )
          }
          className="px-3 py-2 bg-surface-tertiary text-text-primary rounded border border-surface-hover focus:outline-none focus:ring-2 focus:ring-status-blue"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary bg-surface-tertiary hover:bg-surface-hover rounded transition-colors"
          aria-label="Reset all"
        >
          Reset All
        </button>
      )}
    </div>
  );
}
