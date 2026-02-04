import { useState, useEffect } from 'react';
import type { NodeType, DeviceType } from '../../domain/node.schema';

interface AddNodeModalProps {
  isOpen: boolean;
  parentType: NodeType;
  parentId: string;
  onClose: () => void;
  onCreate: (data: CreateNodeData) => Promise<void> | void;
}

interface CreateNodeData {
  parentId: string;
  type: NodeType;
  name: string;
  status: 'red' | 'amber';
  deviceType?: DeviceType;
}

/**
 * Maps parent type to allowed child types.
 * Cohorts can be added at any level (except under another cohort).
 */
const allowedChildTypes: Record<NodeType, NodeType[]> = {
  organisation: ['directorate', 'cohort'],
  directorate: ['department', 'cohort'],
  department: ['subdepartment', 'cohort'],
  subdepartment: ['cohort'],
  cohort: [], // Cohorts cannot have children
};

const typeLabels: Record<NodeType, string> = {
  organisation: 'Organisation',
  directorate: 'Directorate',
  department: 'Department',
  subdepartment: 'Subdepartment',
  cohort: 'Cohort',
};

const deviceTypeOptions: { value: DeviceType; label: string }[] = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'sharedDesktop', label: 'Shared Desktop' },
  { value: 'kiosk', label: 'Kiosk' },
  { value: 'displayUnit', label: 'VID (Display)' },
];

export function AddNodeModal({
  isOpen,
  parentType,
  parentId,
  onClose,
  onCreate,
}: AddNodeModalProps) {
  const allowedTypes = allowedChildTypes[parentType];
  const [selectedType, setSelectedType] = useState<NodeType>(allowedTypes[0]);
  const [name, setName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('laptop');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedType(allowedTypes[0]);
      setName('');
      setDeviceType('laptop');
    }
  }, [isOpen, allowedTypes]);

  if (!isOpen) {
    return null;
  }

  const isCohort = selectedType === 'cohort';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);

    const data: CreateNodeData = {
      parentId,
      type: selectedType,
      name: name.trim(),
      status: isCohort ? 'amber' : 'red',
    };

    if (isCohort) {
      data.deviceType = deviceType;
    }

    try {
      await onCreate(data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-secondary rounded-lg shadow-xl p-6 w-full max-w-md border border-surface-tertiary">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Add New Node
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          {allowedTypes.length > 1 && (
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as NodeType)}
                className="w-full px-3 py-2 bg-surface-primary border border-surface-tertiary rounded text-text-primary focus:outline-none focus:border-accent"
              >
                {allowedTypes.map((type) => (
                  <option key={type} value={type}>
                    {typeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Single type - show as label */}
          {allowedTypes.length === 1 && (
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Type
              </label>
              <div className="px-3 py-2 bg-surface-primary border border-surface-tertiary rounded text-text-primary">
                {typeLabels[allowedTypes[0]]}
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
              className="w-full px-3 py-2 bg-surface-primary border border-surface-tertiary rounded text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Device Type (for cohorts) */}
          {isCohort && (
            <div>
              <label
                htmlFor="deviceType"
                className="block text-sm text-text-secondary mb-1"
              >
                Device Type
              </label>
              <select
                id="deviceType"
                aria-label="Device Type"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                className="w-full px-3 py-2 bg-surface-primary border border-surface-tertiary rounded text-text-primary focus:outline-none focus:border-accent"
              >
                {deviceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-accent text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
