import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodeEditor } from './NodeEditor';
import type { Node } from '../../domain/node.schema';

const mockDirectorate: Node = {
  id: 'dir-1',
  type: 'directorate',
  name: 'Heathrow Operations',
  parentId: 'org-1',
  status: 'amber',
  contact: 'Tom Moran',
  additionalContacts: ['Andy Brown'],
  headcount: 6419,
  deviceType: null,
  deviceCount: null,
  completedCount: null,
  location: null,
  confluenceUrl: 'https://confluence.ba.com/heathrow',
  jiraUrl: null,
  notes: 'Main hub operations',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockCohort: Node = {
  id: 'coh-1',
  type: 'cohort',
  name: 'Baggage handlers',
  parentId: 'sub-1',
  status: 'green',
  contact: 'Jane Doe',
  additionalContacts: [],
  headcount: null,
  deviceType: 'laptop',
  deviceCount: 150,
  completedCount: 75,
  location: 'Terminal 5',
  confluenceUrl: null,
  jiraUrl: 'https://jira.ba.com/browse/PROJ-123',
  notes: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('NodeEditor', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpdate.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('renders node name', () => {
      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Heathrow Operations')).toBeInTheDocument();
    });

    it('renders node type badge', () => {
      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Directorate')).toBeInTheDocument();
    });

    it('renders status selector', () => {
      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Amber')).toBeInTheDocument();
    });

    it('renders contact info', () => {
      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Tom Moran')).toBeInTheDocument();
    });

    it('renders headcount for non-cohort nodes', () => {
      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('6,419')).toBeInTheDocument();
    });

    it('renders device info for cohort nodes', () => {
      render(<NodeEditor node={mockCohort} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    it('renders location for cohort nodes', () => {
      render(<NodeEditor node={mockCohort} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Terminal 5')).toBeInTheDocument();
    });

    it('renders external links', () => {
      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      expect(screen.getByRole('link', { name: /confluence/i })).toHaveAttribute(
        'href',
        'https://confluence.ba.com/heathrow'
      );
    });

    it('renders notes', () => {
      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Main hub operations')).toBeInTheDocument();
    });
  });

  describe('editing name', () => {
    it('allows editing node name', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Heathrow Operations'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Gatwick Operations{Enter}');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('dir-1', {
          name: 'Gatwick Operations',
        });
      });
    });
  });

  describe('editing status', () => {
    it('allows changing status', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Amber'));
      await user.selectOptions(screen.getByRole('combobox'), 'green');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('dir-1', { status: 'green' });
      });
    });
  });

  describe('editing contact', () => {
    it('allows editing contact name', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Sarah Connor{Enter}');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('dir-1', {
          contact: 'Sarah Connor',
        });
      });
    });
  });

  describe('editing headcount', () => {
    it('allows editing headcount', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('6,419'));
      await user.clear(screen.getByRole('spinbutton'));
      await user.type(screen.getByRole('spinbutton'), '7000{Enter}');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('dir-1', { headcount: 7000 });
      });
    });
  });

  describe('editing device counts (cohort)', () => {
    it('allows editing device count', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockCohort} onUpdate={mockOnUpdate} />);

      // Find the device count field (150)
      const deviceCountField = screen.getByText('150');
      await user.click(deviceCountField);
      await user.clear(screen.getByRole('spinbutton'));
      await user.type(screen.getByRole('spinbutton'), '200{Enter}');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('coh-1', { deviceCount: 200 });
      });
    });

    it('allows editing completed count', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockCohort} onUpdate={mockOnUpdate} />);

      // Find the completed count field (75)
      const completedCountField = screen.getByText('75');
      await user.click(completedCountField);
      await user.clear(screen.getByRole('spinbutton'));
      await user.type(screen.getByRole('spinbutton'), '100{Enter}');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('coh-1', {
          completedCount: 100,
        });
      });
    });
  });

  describe('editing notes', () => {
    it('allows editing notes with multiline input', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Main hub operations'));

      // Textarea for notes
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');

      await user.clear(textarea);
      await user.type(textarea, 'Updated notes');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('dir-1', {
          notes: 'Updated notes',
        });
      });
    });
  });

  describe('error handling', () => {
    it('shows error when update fails', async () => {
      const user = userEvent.setup();
      mockOnUpdate.mockRejectedValue(new Error('Update failed'));

      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Tom Moran'));
      await user.clear(screen.getByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'New Contact{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('editing links', () => {
    it('shows editable Confluence URL field', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      // Find the Confluence link and click to edit
      const confluenceLink = screen.getByRole('link', { name: /confluence/i });
      expect(confluenceLink).toHaveAttribute('href', 'https://confluence.ba.com/heathrow');

      // Click edit button (pencil icon next to link)
      const editButton = confluenceLink.parentElement?.querySelector('[data-testid="edit-confluence-btn"]');
      expect(editButton).toBeInTheDocument();
      await user.click(editButton as HTMLElement);

      // Should show input
      const input = screen.getByPlaceholderText(/confluence url/i);
      expect(input).toBeInTheDocument();
    });

    it('allows editing Confluence URL', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} />);

      // Click edit button
      const editButton = screen.getByTestId('edit-confluence-btn');
      await user.click(editButton);

      // Edit the URL
      const input = screen.getByPlaceholderText(/confluence url/i);
      await user.clear(input);
      await user.type(input, 'https://confluence.ba.com/new-page{Enter}');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('dir-1', {
          confluenceUrl: 'https://confluence.ba.com/new-page',
        });
      });
    });

    it('allows editing Jira URL', async () => {
      const user = userEvent.setup();

      render(<NodeEditor node={mockCohort} onUpdate={mockOnUpdate} />);

      // Click edit button
      const editButton = screen.getByTestId('edit-jira-btn');
      await user.click(editButton);

      // Edit the URL
      const input = screen.getByPlaceholderText(/jira url/i);
      await user.clear(input);
      await user.type(input, 'https://jira.ba.com/browse/NEW-456{Enter}');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('coh-1', {
          jiraUrl: 'https://jira.ba.com/browse/NEW-456',
        });
      });
    });

    it('allows adding new Confluence URL when none exists', async () => {
      const user = userEvent.setup();
      const nodeWithoutLinks: Node = {
        ...mockCohort,
        confluenceUrl: null,
      };

      render(<NodeEditor node={nodeWithoutLinks} onUpdate={mockOnUpdate} />);

      // Click add button
      const addButton = screen.getByTestId('add-confluence-btn');
      await user.click(addButton);

      // Enter URL
      const input = screen.getByPlaceholderText(/confluence url/i);
      await user.type(input, 'https://confluence.ba.com/new{Enter}');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('coh-1', {
          confluenceUrl: 'https://confluence.ba.com/new',
        });
      });
    });
  });

  describe('read-only mode', () => {
    it('disables editing when readOnly is true', () => {
      render(
        <NodeEditor node={mockDirectorate} onUpdate={mockOnUpdate} readOnly />
      );

      // Edit buttons should not be present
      expect(
        screen.queryByRole('button', { name: /edit/i })
      ).not.toBeInTheDocument();
    });
  });
});
