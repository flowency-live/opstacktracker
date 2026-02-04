import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { Node } from './domain/node.schema';

const mockNodes: Node[] = [
  {
    id: 'org-1',
    type: 'organisation',
    name: 'British Airways',
    parentId: null,
    status: 'red',
    contact: null,
    additionalContacts: [],
    headcount: null,
    deviceType: null,
    deviceCount: null,
    completedCount: null,
    location: null,
    confluenceUrl: null,
    jiraUrl: null,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dir-1',
    type: 'directorate',
    name: 'Heathrow Operations',
    parentId: 'org-1',
    status: 'amber',
    contact: 'Tom Moran',
    additionalContacts: [],
    headcount: 6419,
    deviceType: null,
    deviceCount: null,
    completedCount: null,
    location: null,
    confluenceUrl: null,
    jiraUrl: null,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockUseNodes = vi.fn();

vi.mock('./hooks/useNodes', () => ({
  useNodes: () => mockUseNodes(),
}));

vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: vi.fn(),
  },
}));

vi.mock('aws-amplify/auth', () => ({
  signInWithRedirect: vi.fn().mockResolvedValue({}),
  signOut: vi.fn().mockResolvedValue({}),
  getCurrentUser: vi.fn().mockResolvedValue({ username: 'test-user' }),
}));

vi.mock('aws-amplify/utils', () => ({
  Hub: {
    listen: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading indicator while fetching', async () => {
      mockUseNodes.mockReturnValue({
        nodes: [],
        isLoading: true,
        error: null,
        createNode: vi.fn(),
        updateNode: vi.fn(),
        deleteNode: vi.fn(),
        refetch: vi.fn(),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('shows error message when fetch fails', async () => {
      mockUseNodes.mockReturnValue({
        nodes: [],
        isLoading: false,
        error: 'Failed to fetch nodes',
        createNode: vi.fn(),
        updateNode: vi.fn(),
        deleteNode: vi.fn(),
        refetch: vi.fn(),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/failed to fetch nodes/i)).toBeInTheDocument();
      });
    });
  });

  describe('tree display', () => {
    it('renders the hierarchy tree with nodes', async () => {
      mockUseNodes.mockReturnValue({
        nodes: mockNodes,
        isLoading: false,
        error: null,
        createNode: vi.fn(),
        updateNode: vi.fn(),
        deleteNode: vi.fn(),
        refetch: vi.fn(),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('British Airways')).toBeInTheDocument();
      });
      expect(screen.getByText('Heathrow Operations')).toBeInTheDocument();
    });

    it('displays app header', async () => {
      mockUseNodes.mockReturnValue({
        nodes: mockNodes,
        isLoading: false,
        error: null,
        createNode: vi.fn(),
        updateNode: vi.fn(),
        deleteNode: vi.fn(),
        refetch: vi.fn(),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/cohorttrack/i)).toBeInTheDocument();
      });
    });
  });

  describe('node selection', () => {
    it('shows node details when a node is selected', async () => {
      const user = userEvent.setup();

      mockUseNodes.mockReturnValue({
        nodes: mockNodes,
        isLoading: false,
        error: null,
        createNode: vi.fn(),
        updateNode: vi.fn(),
        deleteNode: vi.fn(),
        refetch: vi.fn(),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Heathrow Operations')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Heathrow Operations'));

      await waitFor(() => {
        expect(screen.getByTestId('node-detail-panel')).toBeInTheDocument();
      });

      // Verify detail panel shows the node info (headcount only appears in detail panel)
      expect(screen.getByText('6,419')).toBeInTheDocument();
    });
  });
});
