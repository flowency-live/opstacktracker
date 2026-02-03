import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilter } from './SearchFilter';

describe('SearchFilter', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnStatusFilterChange = vi.fn();
  const mockOnTypeFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('search input', () => {
    it('renders search input', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(
        screen.getByPlaceholderText(/search nodes/i)
      ).toBeInTheDocument();
    });

    it('displays current search query', () => {
      render(
        <SearchFilter
          searchQuery="heathrow"
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(screen.getByDisplayValue('heathrow')).toBeInTheDocument();
    });

    it('calls onSearchChange when typing', async () => {
      const user = userEvent.setup();

      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      await user.type(screen.getByPlaceholderText(/search nodes/i), 'test');

      expect(mockOnSearchChange).toHaveBeenCalled();
    });

    it('shows clear button when search query is not empty', () => {
      render(
        <SearchFilter
          searchQuery="heathrow"
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(
        screen.getByRole('button', { name: /clear search/i })
      ).toBeInTheDocument();
    });

    it('clears search on clear button click', async () => {
      const user = userEvent.setup();

      render(
        <SearchFilter
          searchQuery="heathrow"
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /clear search/i }));

      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('status filter', () => {
    it('renders status filter dropdown', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('shows all status options', async () => {
      const user = userEvent.setup();

      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);

      expect(screen.getByRole('option', { name: /all statuses/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /red/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /amber/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /green/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /blue/i })).toBeInTheDocument();
    });

    it('calls onStatusFilterChange when selecting status', async () => {
      const user = userEvent.setup();

      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      await user.selectOptions(screen.getByLabelText(/status/i), 'red');

      expect(mockOnStatusFilterChange).toHaveBeenCalledWith('red');
    });

    it('displays current status filter', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter="amber"
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(screen.getByLabelText(/status/i)).toHaveValue('amber');
    });
  });

  describe('type filter', () => {
    it('renders type filter dropdown', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    });

    it('shows all type options', async () => {
      const user = userEvent.setup();

      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      const typeSelect = screen.getByLabelText(/type/i);
      await user.click(typeSelect);

      expect(screen.getByRole('option', { name: 'All Types' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Organisation' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Directorate' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Department' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Subdepartment' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Cohort' })).toBeInTheDocument();
    });

    it('calls onTypeFilterChange when selecting type', async () => {
      const user = userEvent.setup();

      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      await user.selectOptions(screen.getByLabelText(/type/i), 'cohort');

      expect(mockOnTypeFilterChange).toHaveBeenCalledWith('cohort');
    });

    it('displays current type filter', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter="department"
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(screen.getByLabelText(/type/i)).toHaveValue('department');
    });
  });

  describe('reset filters', () => {
    it('shows reset button when filters are active', () => {
      render(
        <SearchFilter
          searchQuery="test"
          onSearchChange={mockOnSearchChange}
          statusFilter="red"
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter="cohort"
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(
        screen.getByRole('button', { name: /reset all/i })
      ).toBeInTheDocument();
    });

    it('does not show reset button when no filters active', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(
        screen.queryByRole('button', { name: /reset all/i })
      ).not.toBeInTheDocument();
    });

    it('resets all filters on reset button click', async () => {
      const user = userEvent.setup();

      render(
        <SearchFilter
          searchQuery="test"
          onSearchChange={mockOnSearchChange}
          statusFilter="red"
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter="cohort"
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /reset all/i }));

      expect(mockOnSearchChange).toHaveBeenCalledWith('');
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith(null);
      expect(mockOnTypeFilterChange).toHaveBeenCalledWith(null);
    });
  });

  describe('accessibility', () => {
    it('has accessible labels for all inputs', () => {
      render(
        <SearchFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          statusFilter={null}
          onStatusFilterChange={mockOnStatusFilterChange}
          typeFilter={null}
          onTypeFilterChange={mockOnTypeFilterChange}
        />
      );

      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });
  });
});
