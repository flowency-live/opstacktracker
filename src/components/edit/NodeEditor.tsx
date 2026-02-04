import { useState } from 'react';
import type { Node, Status, DeviceType } from '../../domain/node.schema';
import { EditableField } from './EditableField';

interface NodeEditorProps {
  node: Node;
  onUpdate: (id: string, updates: Partial<Node>) => Promise<void>;
  readOnly?: boolean;
}

const statusOptions = [
  { value: 'red', label: 'Red' },
  { value: 'amber', label: 'Amber' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

const deviceTypeOptions = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'sharedDesktop', label: 'Shared Desktop' },
  { value: 'kiosk', label: 'Kiosk' },
  { value: 'displayUnit', label: 'Display Unit' },
];

const nodeTypeLabels: Record<string, string> = {
  organisation: 'Organisation',
  directorate: 'Directorate',
  department: 'Department',
  subdepartment: 'Subdepartment',
  cohort: 'Cohort',
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-text-tertiary uppercase tracking-wide">
      {children}
    </span>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <FieldLabel>{label}</FieldLabel>
      <div>{children}</div>
    </div>
  );
}

function ReadOnlyValue({
  value,
  placeholder = '-',
}: {
  value: string | number | null | undefined;
  placeholder?: string;
}) {
  const displayValue =
    typeof value === 'number'
      ? value.toLocaleString()
      : value ?? placeholder;

  return (
    <span className={value ? 'text-text-primary' : 'text-text-tertiary'}>
      {displayValue}
    </span>
  );
}

interface EditableLinkProps {
  value: string | null | undefined;
  onSave: (value: string | null) => Promise<void>;
  label: string;
  testIdPrefix: string;
  readOnly?: boolean;
}

function EditableLink({
  value,
  onSave,
  label,
  testIdPrefix,
  readOnly = false,
}: EditableLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      await onSave(inputValue.trim() || null);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(value ?? '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => handleSubmit()}
          placeholder={`${label} URL`}
          autoFocus
          className="flex-1 px-2 py-1 text-sm bg-surface-primary border border-surface-tertiary rounded text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
        />
        {isSaving && (
          <span className="text-xs text-text-tertiary">Saving...</span>
        )}
      </div>
    );
  }

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:underline"
        >
          {label}
        </a>
        {!readOnly && (
          <button
            data-testid={`edit-${testIdPrefix}-btn`}
            onClick={() => setIsEditing(true)}
            className="text-text-tertiary hover:text-text-secondary"
            title={`Edit ${label} URL`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  if (readOnly) {
    return null;
  }

  return (
    <button
      data-testid={`add-${testIdPrefix}-btn`}
      onClick={() => setIsEditing(true)}
      className="text-sm text-text-tertiary hover:text-text-secondary flex items-center gap-1"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add {label}
    </button>
  );
}

export function NodeEditor({ node, onUpdate, readOnly = false }: NodeEditorProps) {
  const handleUpdate = async (field: keyof Node, value: string | number | null) => {
    await onUpdate(node.id ?? '', { [field]: value });
  };

  const isCohort = node.type === 'cohort';

  return (
    <div data-testid="node-editor" className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {readOnly ? (
            <h2 className="text-lg font-semibold text-text-primary">
              {node.name}
            </h2>
          ) : (
            <EditableField
              value={node.name}
              onSave={(value) => handleUpdate('name', value)}
              label="Name"
              placeholder="Enter name"
            />
          )}
        </div>
        <span className="px-2 py-0.5 text-xs font-medium bg-surface-tertiary text-text-secondary rounded capitalize">
          {nodeTypeLabels[node.type] ?? node.type}
        </span>
      </div>

      {/* Status */}
      <FieldRow label="Status">
        {readOnly ? (
          <span className={`capitalize status-${node.status}`}>
            {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
          </span>
        ) : (
          <EditableField
            value={node.status}
            onSave={(value) => handleUpdate('status', value as Status)}
            label="Status"
            type="select"
            options={statusOptions}
          />
        )}
      </FieldRow>

      {/* Contact */}
      <FieldRow label="Contact">
        {readOnly ? (
          <ReadOnlyValue value={node.contact} placeholder="No contact" />
        ) : (
          <EditableField
            value={node.contact}
            onSave={(value) => handleUpdate('contact', value)}
            label="Contact"
            placeholder="Add contact..."
          />
        )}
      </FieldRow>

      {/* Contact Email */}
      {(node.contactEmail || !readOnly) && (
        <FieldRow label="Email">
          {readOnly ? (
            <ReadOnlyValue value={node.contactEmail} />
          ) : (
            <EditableField
              value={node.contactEmail}
              onSave={(value) => handleUpdate('contactEmail', value)}
              label="Email"
              placeholder="Add email..."
            />
          )}
        </FieldRow>
      )}

      {/* Headcount (for non-cohort nodes) */}
      {!isCohort && (
        <FieldRow label="Headcount">
          {readOnly ? (
            <ReadOnlyValue value={node.headcount} placeholder="-" />
          ) : (
            <EditableField
              value={node.headcount}
              onSave={(value) => handleUpdate('headcount', value)}
              label="Headcount"
              type="number"
              placeholder="Add headcount..."
            />
          )}
        </FieldRow>
      )}

      {/* Cohort-specific fields */}
      {isCohort && (
        <>
          {/* Device Type */}
          <FieldRow label="Device Type">
            {readOnly ? (
              <ReadOnlyValue
                value={
                  node.deviceType
                    ? deviceTypeOptions.find((o) => o.value === node.deviceType)?.label
                    : null
                }
              />
            ) : (
              <EditableField
                value={node.deviceType}
                onSave={(value) => handleUpdate('deviceType', value as DeviceType | null)}
                label="Device Type"
                type="select"
                options={deviceTypeOptions}
              />
            )}
          </FieldRow>

          {/* Device Count */}
          <FieldRow label="Device Count">
            {readOnly ? (
              <ReadOnlyValue value={node.deviceCount} />
            ) : (
              <EditableField
                value={node.deviceCount}
                onSave={(value) => handleUpdate('deviceCount', value)}
                label="Device Count"
                type="number"
                placeholder="Add device count..."
              />
            )}
          </FieldRow>

          {/* Completed Count */}
          <FieldRow label="Completed">
            {readOnly ? (
              <ReadOnlyValue value={node.completedCount} />
            ) : (
              <EditableField
                value={node.completedCount}
                onSave={(value) => handleUpdate('completedCount', value)}
                label="Completed Count"
                type="number"
                placeholder="Add completed count..."
              />
            )}
          </FieldRow>

          {/* Location */}
          <FieldRow label="Location">
            {readOnly ? (
              <ReadOnlyValue value={node.location} />
            ) : (
              <EditableField
                value={node.location}
                onSave={(value) => handleUpdate('location', value)}
                label="Location"
                placeholder="Add location..."
              />
            )}
          </FieldRow>
        </>
      )}

      {/* External Links */}
      <div className="space-y-2">
        <FieldLabel>Links</FieldLabel>
        <div className="flex flex-col gap-2">
          <EditableLink
            value={node.confluenceUrl}
            onSave={(value) => handleUpdate('confluenceUrl', value)}
            label="Confluence"
            testIdPrefix="confluence"
            readOnly={readOnly}
          />
          <EditableLink
            value={node.jiraUrl}
            onSave={(value) => handleUpdate('jiraUrl', value)}
            label="Jira"
            testIdPrefix="jira"
            readOnly={readOnly}
          />
          {!node.confluenceUrl && !node.jiraUrl && readOnly && (
            <span className="text-sm text-text-tertiary">No links</span>
          )}
        </div>
      </div>

      {/* Notes */}
      <FieldRow label="Notes">
        {readOnly ? (
          <ReadOnlyValue value={node.notes} placeholder="No notes" />
        ) : (
          <EditableField
            value={node.notes}
            onSave={(value) => handleUpdate('notes', value)}
            label="Notes"
            type="textarea"
            placeholder="Add notes..."
          />
        )}
      </FieldRow>
    </div>
  );
}
