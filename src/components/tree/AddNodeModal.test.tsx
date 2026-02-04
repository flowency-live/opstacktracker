import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddNodeModal } from './AddNodeModal';

describe('AddNodeModal', () => {
  const mockOnCreate = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders modal when open', () => {
      render(
        <AddNodeModal
          isOpen={true}
          parentType="department"
          parentId="parent-123"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      expect(screen.getByText('Add New Node')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <AddNodeModal
          isOpen={false}
          parentType="department"
          parentId="parent-123"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      expect(screen.queryByText('Add New Node')).not.toBeInTheDocument();
    });
  });

  describe('type filtering by parent', () => {
    it('shows directorate and cohort options for organisation parent', () => {
      render(
        <AddNodeModal
          isOpen={true}
          parentType="organisation"
          parentId="org-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      expect(screen.getByText('Directorate')).toBeInTheDocument();
      expect(screen.getByText('Cohort')).toBeInTheDocument();
      expect(screen.queryByText('Department')).not.toBeInTheDocument();
    });

    it('shows department and cohort options for directorate parent', () => {
      render(
        <AddNodeModal
          isOpen={true}
          parentType="directorate"
          parentId="dir-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Cohort')).toBeInTheDocument();
      expect(screen.queryByText('Directorate')).not.toBeInTheDocument();
    });

    it('shows subdepartment and cohort options for department parent', () => {
      render(
        <AddNodeModal
          isOpen={true}
          parentType="department"
          parentId="dept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      expect(screen.getByText('Subdepartment')).toBeInTheDocument();
      expect(screen.getByText('Cohort')).toBeInTheDocument();
    });

    it('shows only cohort option for subdepartment parent', () => {
      render(
        <AddNodeModal
          isOpen={true}
          parentType="subdepartment"
          parentId="subdept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      expect(screen.getByText('Cohort')).toBeInTheDocument();
      expect(screen.queryByText('Subdepartment')).not.toBeInTheDocument();
      expect(screen.queryByText('Department')).not.toBeInTheDocument();
    });
  });

  describe('cohort device type', () => {
    it('shows device type dropdown when cohort is selected', async () => {
      render(
        <AddNodeModal
          isOpen={true}
          parentType="subdepartment"
          parentId="subdept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      // Cohort should be pre-selected for subdepartment parent
      expect(screen.getByText('Device Type')).toBeInTheDocument();
    });

    it('has all device type options', async () => {
      render(
        <AddNodeModal
          isOpen={true}
          parentType="subdepartment"
          parentId="subdept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      expect(screen.getByRole('option', { name: 'Laptop' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Shared Desktop' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Kiosk' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'VID (Display)' })).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls onCreate with correct data', async () => {
      const user = userEvent.setup();

      render(
        <AddNodeModal
          isOpen={true}
          parentType="department"
          parentId="dept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      // Fill in name
      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'New Subdepartment');

      // Submit form
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith({
          parentId: 'dept-1',
          type: 'subdepartment',
          name: 'New Subdepartment',
          status: 'red',
        });
      });
    });

    it('calls onCreate with device type for cohort', async () => {
      const user = userEvent.setup();

      render(
        <AddNodeModal
          isOpen={true}
          parentType="subdepartment"
          parentId="subdept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      // Fill in name
      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'Laptop Users');

      // Select device type
      const deviceTypeSelect = screen.getByLabelText('Device Type');
      await user.selectOptions(deviceTypeSelect, 'laptop');

      // Submit form
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith({
          parentId: 'subdept-1',
          type: 'cohort',
          name: 'Laptop Users',
          status: 'amber',
          deviceType: 'laptop',
        });
      });
    });

    it('requires name field', async () => {
      const user = userEvent.setup();

      render(
        <AddNodeModal
          isOpen={true}
          parentType="department"
          parentId="dept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      // Try to submit without name
      await user.click(screen.getByRole('button', { name: /create/i }));

      // onCreate should not be called
      expect(mockOnCreate).not.toHaveBeenCalled();
    });
  });

  describe('cancel behavior', () => {
    it('calls onClose when cancel button clicked', async () => {
      const user = userEvent.setup();

      render(
        <AddNodeModal
          isOpen={true}
          parentType="department"
          parentId="dept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets form when reopened', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <AddNodeModal
          isOpen={true}
          parentType="department"
          parentId="dept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      // Fill in name
      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'Test Name');

      // Close and reopen
      rerender(
        <AddNodeModal
          isOpen={false}
          parentType="department"
          parentId="dept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      rerender(
        <AddNodeModal
          isOpen={true}
          parentType="department"
          parentId="dept-1"
          onClose={mockOnClose}
          onCreate={mockOnCreate}
        />
      );

      // Name should be empty
      const newNameInput = screen.getByPlaceholderText('Enter name');
      expect(newNameInput).toHaveValue('');
    });
  });
});
