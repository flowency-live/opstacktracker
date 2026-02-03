import { useState, useRef, useEffect } from 'react';

type EditableFieldType = 'text' | 'number' | 'select' | 'textarea';

interface SelectOption {
  value: string;
  label: string;
}

interface EditableFieldProps {
  value: string | number | null;
  onSave: (value: string | number | null) => Promise<void> | void;
  label: string;
  placeholder?: string;
  type?: EditableFieldType;
  options?: SelectOption[];
}

type EditState =
  | { mode: 'viewing' }
  | { mode: 'editing'; draftValue: string }
  | { mode: 'saving'; draftValue: string }
  | { mode: 'error'; draftValue: string; error: string };

export function EditableField({
  value,
  onSave,
  label,
  placeholder = 'Click to edit',
  type = 'text',
  options = [],
}: EditableFieldProps) {
  const [state, setState] = useState<EditState>({ mode: 'viewing' });
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  const displayValue =
    type === 'number' && typeof value === 'number'
      ? value.toLocaleString()
      : type === 'select'
        ? options.find((opt) => opt.value === value)?.label ?? value
        : value;

  const isEmpty = value === null || value === '' || value === undefined;

  useEffect(() => {
    if (state.mode === 'editing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.mode]);

  const enterEditMode = () => {
    const initialValue =
      type === 'number'
        ? (value?.toString() ?? '')
        : (value?.toString() ?? '');
    setState({ mode: 'editing', draftValue: initialValue });
  };

  const handleSave = async () => {
    if (state.mode !== 'editing' && state.mode !== 'error') return;

    const { draftValue } = state;

    // Don't save if unchanged
    const originalValue = value?.toString() ?? '';
    if (draftValue === originalValue) {
      setState({ mode: 'viewing' });
      return;
    }

    setState({ mode: 'saving', draftValue });

    try {
      const newValue =
        type === 'number'
          ? draftValue === ''
            ? null
            : Number(draftValue)
          : draftValue === ''
            ? null
            : draftValue;

      await onSave(newValue);
      setState({ mode: 'viewing' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setState({ mode: 'error', draftValue, error: errorMessage });
    }
  };

  const handleCancel = () => {
    setState({ mode: 'viewing' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (state.mode === 'editing' || state.mode === 'error') {
      setState({ mode: 'editing', draftValue: e.target.value });
    }
  };

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setState({ mode: 'saving', draftValue: newValue });

    try {
      await onSave(newValue);
      setState({ mode: 'viewing' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setState({ mode: 'error', draftValue: newValue, error: errorMessage });
    }
  };

  const handleBlur = () => {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (state.mode === 'editing') {
        handleSave();
      }
    }, 150);
  };

  const errorId = `${label}-error`;
  const isEditing = state.mode !== 'viewing';
  const isSaving = state.mode === 'saving';
  const hasError = state.mode === 'error';
  const draftValue = isEditing && 'draftValue' in state ? state.draftValue : '';

  return (
    <div
      data-testid="editable-field"
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={label}
    >
      {!isEditing ? (
        // View mode
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-surface-hover rounded px-2 py-1 -mx-2"
          onClick={enterEditMode}
        >
          <span
            className={isEmpty ? 'text-text-tertiary italic' : 'text-text-primary'}
          >
            {isEmpty ? placeholder : displayValue}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              enterEditMode();
            }}
            className={`text-text-tertiary hover:text-text-secondary transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Edit"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>
      ) : (
        // Edit mode
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {type === 'textarea' ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={draftValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                disabled={isSaving}
                className="w-full px-2 py-1 bg-surface-tertiary text-text-primary rounded border border-surface-hover focus:outline-none focus:ring-2 focus:ring-status-blue disabled:opacity-50"
                rows={3}
                aria-label={label}
                aria-describedby={hasError ? errorId : undefined}
              />
            ) : type === 'select' ? (
              <select
                ref={inputRef as React.RefObject<HTMLSelectElement>}
                value={draftValue}
                onChange={handleSelectChange}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="w-full px-2 py-1 bg-surface-tertiary text-text-primary rounded border border-surface-hover focus:outline-none focus:ring-2 focus:ring-status-blue disabled:opacity-50"
                aria-label={label}
                aria-describedby={hasError ? errorId : undefined}
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={type}
                value={draftValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                disabled={isSaving}
                className="w-full px-2 py-1 bg-surface-tertiary text-text-primary rounded border border-surface-hover focus:outline-none focus:ring-2 focus:ring-status-blue disabled:opacity-50"
                aria-label={label}
                aria-describedby={hasError ? errorId : undefined}
              />
            )}
            {isSaving && (
              <div
                data-testid="saving-indicator"
                className="w-4 h-4 border-2 border-status-blue border-t-transparent rounded-full animate-spin"
              />
            )}
          </div>

          {type !== 'select' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs px-2 py-0.5 bg-status-blue text-white rounded hover:opacity-90 disabled:opacity-50"
                aria-label="Save"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="text-xs px-2 py-0.5 bg-surface-tertiary text-text-secondary rounded hover:bg-surface-hover disabled:opacity-50"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          )}

          {hasError && (
            <p id={errorId} className="text-sm text-status-red">
              {state.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
