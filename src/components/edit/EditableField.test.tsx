import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableField } from './EditableField';

describe('EditableField', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('display mode', () => {
    it('renders current value as text', () => {
      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      expect(screen.getByText('Tom Moran')).toBeInTheDocument();
    });

    it('renders placeholder when value is null', () => {
      render(
        <EditableField
          value={null}
          onSave={mockOnSave}
          label="Contact"
          placeholder="No contact"
        />
      );

      expect(screen.getByText('No contact')).toBeInTheDocument();
    });

    it('renders placeholder when value is empty string', () => {
      render(
        <EditableField
          value=""
          onSave={mockOnSave}
          label="Notes"
          placeholder="Add notes..."
        />
      );

      expect(screen.getByText('Add notes...')).toBeInTheDocument();
    });

    it('shows edit button on hover/focus', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      // Button is always in DOM, but visible (opacity-100) on hover
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveClass('opacity-0');

      const container = screen.getByTestId('editable-field');
      await user.hover(container);

      expect(editButton).toHaveClass('opacity-100');
    });
  });

  describe('edit mode', () => {
    it('switches to edit mode on click', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveValue('Tom Moran');
    });

    it('switches to edit mode on edit button click', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      // Button is always in DOM but hidden via opacity when not hovered
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });

    it('focuses input when entering edit mode', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));

      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('allows typing new value', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith');

      expect(screen.getByRole('textbox')).toHaveValue('Jane Smith');
    });
  });

  describe('saving', () => {
    it('saves on Enter key', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith{Enter}');

      expect(mockOnSave).toHaveBeenCalledWith('Jane Smith');
    });

    it('saves on blur', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith');
      await user.tab();

      // Wait for the blur timeout (150ms) to complete
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('Jane Smith');
      }, { timeout: 500 });
    });

    it('saves on save button click', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(mockOnSave).toHaveBeenCalledWith('Jane Smith');
    });

    it('does not save if value unchanged', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.keyboard('{Enter}');

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('exits edit mode after saving', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith{Enter}');

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('cancelling', () => {
    it('cancels on Escape key', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith');
      await user.keyboard('{Escape}');

      expect(mockOnSave).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Tom Moran')).toBeInTheDocument();
    });

    it('cancels on cancel button click', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith');
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnSave).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('number type', () => {
    it('renders number input for number type', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value={6419}
          onSave={mockOnSave}
          label="Headcount"
          type="number"
        />
      );

      await user.click(screen.getByText('6,419'));

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toHaveValue(6419);
    });

    it('saves number value', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value={6419}
          onSave={mockOnSave}
          label="Headcount"
          type="number"
        />
      );

      await user.click(screen.getByText('6,419'));
      await user.clear(screen.getByRole('spinbutton'));
      await user.type(screen.getByRole('spinbutton'), '7000{Enter}');

      expect(mockOnSave).toHaveBeenCalledWith(7000);
    });

    it('formats number with locale', () => {
      render(
        <EditableField
          value={6419}
          onSave={mockOnSave}
          label="Headcount"
          type="number"
        />
      );

      expect(screen.getByText('6,419')).toBeInTheDocument();
    });
  });

  describe('select type', () => {
    const statusOptions = [
      { value: 'red', label: 'Red' },
      { value: 'amber', label: 'Amber' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
    ];

    it('renders select for select type', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="amber"
          onSave={mockOnSave}
          label="Status"
          type="select"
          options={statusOptions}
        />
      );

      await user.click(screen.getByText('Amber'));

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays selected option label', () => {
      render(
        <EditableField
          value="amber"
          onSave={mockOnSave}
          label="Status"
          type="select"
          options={statusOptions}
        />
      );

      expect(screen.getByText('Amber')).toBeInTheDocument();
    });

    it('saves selected option', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="amber"
          onSave={mockOnSave}
          label="Status"
          type="select"
          options={statusOptions}
        />
      );

      await user.click(screen.getByText('Amber'));
      await user.selectOptions(screen.getByRole('combobox'), 'green');

      expect(mockOnSave).toHaveBeenCalledWith('green');
    });
  });

  describe('textarea type', () => {
    it('renders textarea for multiline type', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Some notes"
          onSave={mockOnSave}
          label="Notes"
          type="textarea"
        />
      );

      await user.click(screen.getByText('Some notes'));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
    });

    it('does not save on Enter (allows multiline)', async () => {
      const user = userEvent.setup();

      render(
        <EditableField
          value="Line 1"
          onSave={mockOnSave}
          label="Notes"
          type="textarea"
        />
      );

      await user.click(screen.getByText('Line 1'));
      await user.type(screen.getByRole('textbox'), '{Enter}Line 2');

      expect(mockOnSave).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox')).toHaveValue('Line 1\nLine 2');
    });
  });

  describe('loading state', () => {
    it('shows loading indicator while saving', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith{Enter}');

      expect(screen.getByTestId('saving-indicator')).toBeInTheDocument();
    });

    it('disables input while saving', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith{Enter}');

      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('shows error message when save fails', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/save failed/i)).toBeInTheDocument();
      });
    });

    it('keeps edit mode open on error', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible label', () => {
      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      expect(screen.getByLabelText('Contact')).toBeInTheDocument();
    });

    it('has aria-describedby for errors', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <EditableField
          value="Tom Moran"
          onSave={mockOnSave}
          label="Contact"
        />
      );

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Jane Smith{Enter}');

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-describedby');
      });
    });
  });
});
