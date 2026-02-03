import { useMemo } from 'react';
import type { Node, Status, NodeType } from '../../domain/node.schema';

interface DashboardProps {
  nodes: Node[];
}

interface StatusCounts {
  red: number;
  amber: number;
  green: number;
  blue: number;
}

interface TypeCounts {
  organisation: number;
  directorate: number;
  department: number;
  subdepartment: number;
  cohort: number;
}

interface Metrics {
  statusCounts: StatusCounts;
  typeCounts: TypeCounts;
  totalDevices: number;
  completedDevices: number;
  completionPercent: number;
  totalCohorts: number;
}

function calculateMetrics(nodes: Node[]): Metrics {
  const statusCounts: StatusCounts = {
    red: 0,
    amber: 0,
    green: 0,
    blue: 0,
  };

  const typeCounts: TypeCounts = {
    organisation: 0,
    directorate: 0,
    department: 0,
    subdepartment: 0,
    cohort: 0,
  };

  let totalDevices = 0;
  let completedDevices = 0;
  let totalCohorts = 0;

  for (const node of nodes) {
    // Count by status
    statusCounts[node.status]++;

    // Count by type
    typeCounts[node.type]++;

    // Count cohort-specific metrics
    if (node.type === 'cohort') {
      totalCohorts++;
      totalDevices += node.deviceCount ?? 0;
      completedDevices += node.completedCount ?? 0;
    }
  }

  const completionPercent =
    totalDevices > 0 ? Math.round((completedDevices / totalDevices) * 100) : 0;

  return {
    statusCounts,
    typeCounts,
    totalDevices,
    completedDevices,
    completionPercent,
    totalCohorts,
  };
}

function StatusCard({
  status,
  count,
  total,
}: {
  status: Status;
  count: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  const labels: Record<Status, string> = {
    red: 'Not Engaged',
    amber: 'In Progress',
    green: 'Planned',
    blue: 'Completed',
  };

  return (
    <div
      className={`p-4 rounded-lg bg-surface-tertiary border-l-4 border-status-${status}`}
    >
      <div className="text-sm text-text-tertiary">{labels[status]}</div>
      <div className="flex items-end justify-between mt-1">
        <span
          data-testid={`status-${status}-count`}
          className="text-2xl font-semibold text-text-primary"
        >
          {count}
        </span>
        <span
          data-testid={`status-${status}-percent`}
          className="text-sm text-text-secondary"
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  testId,
  suffix,
}: {
  label: string;
  value: number | string;
  testId: string;
  suffix?: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-surface-tertiary">
      <div className="text-sm text-text-tertiary">{label}</div>
      <div className="mt-1 flex items-end gap-1">
        <span
          data-testid={testId}
          className="text-2xl font-semibold text-text-primary"
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-sm text-text-secondary">{suffix}</span>}
      </div>
    </div>
  );
}

function TypeCountItem({
  type,
  count,
}: {
  type: NodeType;
  count: number;
}) {
  const labels: Record<NodeType, string> = {
    organisation: 'Organisations',
    directorate: 'Directorates',
    department: 'Departments',
    subdepartment: 'Subdepartments',
    cohort: 'Cohorts',
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-text-secondary">{labels[type]}</span>
      <span
        data-testid={`type-${type}-count`}
        className="text-sm font-medium text-text-primary"
      >
        {count}
      </span>
    </div>
  );
}

export function Dashboard({ nodes }: DashboardProps) {
  const metrics = useMemo(() => calculateMetrics(nodes), [nodes]);
  const totalNodes = nodes.length;

  return (
    <div data-testid="dashboard" className="space-y-6">
      {/* Status Distribution */}
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Status Distribution
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusCard
            status="red"
            count={metrics.statusCounts.red}
            total={totalNodes}
          />
          <StatusCard
            status="amber"
            count={metrics.statusCounts.amber}
            total={totalNodes}
          />
          <StatusCard
            status="green"
            count={metrics.statusCounts.green}
            total={totalNodes}
          />
          <StatusCard
            status="blue"
            count={metrics.statusCounts.blue}
            total={totalNodes}
          />
        </div>
      </section>

      {/* Device Progress */}
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Device Progress
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Total Devices"
            value={metrics.totalDevices}
            testId="total-devices"
          />
          <MetricCard
            label="Completed"
            value={metrics.completedDevices}
            testId="completed-devices"
          />
          <MetricCard
            label="Completion Rate"
            value={metrics.completionPercent}
            testId="completion-percent"
            suffix="%"
          />
          <MetricCard
            label="Total Cohorts"
            value={metrics.totalCohorts}
            testId="total-cohorts"
          />
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-status-blue transition-all duration-500"
              style={{ width: `${metrics.completionPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-text-tertiary">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </section>

      {/* Hierarchy Summary */}
      <section>
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Hierarchy Summary
        </h3>
        <div className="bg-surface-tertiary rounded-lg p-4 divide-y divide-surface-hover">
          <TypeCountItem type="organisation" count={metrics.typeCounts.organisation} />
          <TypeCountItem type="directorate" count={metrics.typeCounts.directorate} />
          <TypeCountItem type="department" count={metrics.typeCounts.department} />
          <TypeCountItem type="subdepartment" count={metrics.typeCounts.subdepartment} />
          <TypeCountItem type="cohort" count={metrics.typeCounts.cohort} />
        </div>
      </section>
    </div>
  );
}
