import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { signInWithRedirect, signOut, getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { HierarchyTree } from './components/tree/HierarchyTree';
import { AddNodeModal } from './components/tree/AddNodeModal';
import { NodeEditor } from './components/edit';
import { SearchFilter } from './components/search';
import { Dashboard } from './components/dashboard';
import { OrgChart } from './components/orgchart';
import { useNodes } from './hooks/useNodes';
import { useNodeFilter } from './hooks/useNodeFilter';
import type { Node } from './domain/node.schema';
import outputs from '../amplify_outputs.json';
import './index.css';

Amplify.configure(outputs);

type ViewTab = 'tree' | 'orgchart' | 'dashboard';

function AppContent({ signOut }: { signOut?: () => void }) {
  const { nodes, isLoading, error, refetch, updateNode, createNode, deleteNode } = useNodes();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('tree');
  const [addNodeParent, setAddNodeParent] = useState<Node | null>(null);

  const {
    filteredNodes,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
  } = useNodeFilter(nodes);

  const handleSelect = (node: Node) => {
    setSelectedNode(node);
  };

  const handleUpdateNode = async (id: string, updates: Partial<Node>) => {
    await updateNode(id, updates);
    if (selectedNode?.id === id) {
      setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleAddChild = (parentNode: Node) => {
    setAddNodeParent(parentNode);
  };

  const handleCreateNode = async (nodeData: {
    parentId: string;
    type: Node['type'];
    name: string;
    status: 'red' | 'amber';
    deviceType?: Node['deviceType'];
  }) => {
    await createNode(nodeData);
    setAddNodeParent(null);
  };

  const handleDeleteNode = async (id: string) => {
    await deleteNode(id);
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      <header className="bg-surface-secondary border-b border-surface-tertiary px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-text-primary">CohortTrack</h1>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-tertiary rounded-lg p-1">
              <button
                onClick={() => setActiveTab('tree')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'tree'
                    ? 'bg-surface-hover text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Explorer
              </button>
              <button
                onClick={() => setActiveTab('orgchart')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'orgchart'
                    ? 'bg-surface-hover text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Org Chart
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'dashboard'
                    ? 'bg-surface-hover text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Dashboard
              </button>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-sm bg-surface-tertiary hover:bg-surface-hover rounded text-text-secondary"
            >
              Refresh
            </button>
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-sm bg-status-red/20 hover:bg-status-red/30 rounded text-status-red"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'dashboard' && (
          /* Dashboard View */
          <div className="bg-surface-secondary rounded-lg p-4">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Dashboard
            </h2>
            <Dashboard nodes={nodes} />
          </div>
        )}

        {activeTab === 'orgchart' && (
          /* Org Chart View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="bg-surface-secondary rounded-lg p-4">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Organisation Chart
                </h2>
                <OrgChart
                  nodes={nodes}
                  onSelect={handleSelect}
                  selectedNodeId={selectedNode?.id ?? null}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            </div>

            <div>
              {selectedNode ? (
                <div
                  data-testid="node-detail-panel"
                  className="p-4 bg-surface-secondary rounded-lg"
                >
                  <NodeEditor
                    node={selectedNode}
                    onUpdate={handleUpdateNode}
                    onDelete={handleDeleteNode}
                  />
                </div>
              ) : (
                <div className="p-4 bg-surface-secondary rounded-lg text-text-tertiary text-center">
                  Select a node to view details
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tree' && (
          /* Tree View */
          <>
            {/* Search and Filter Bar */}
            <div className="mb-4 bg-surface-secondary rounded-lg p-4">
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
              />
              {(searchQuery || statusFilter || typeFilter) && (
                <div className="mt-2 text-sm text-text-tertiary">
                  Showing {filteredNodes.length} of {nodes.length} nodes
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="bg-surface-secondary rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Organisation Hierarchy
                  </h2>
                  <HierarchyTree
                    nodes={filteredNodes}
                    onSelect={handleSelect}
                    onAddChild={handleAddChild}
                    selectedNodeId={selectedNode?.id ?? null}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              </div>

              <div>
                {selectedNode ? (
                  <div
                    data-testid="node-detail-panel"
                    className="p-4 bg-surface-secondary rounded-lg"
                  >
                    <NodeEditor
                      node={selectedNode}
                      onUpdate={handleUpdateNode}
                      onDelete={handleDeleteNode}
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-surface-secondary rounded-lg text-text-tertiary text-center">
                    Select a node to view details
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <AddNodeModal
        isOpen={addNodeParent !== null}
        parentType={addNodeParent?.type ?? 'organisation'}
        parentId={addNodeParent?.id ?? ''}
        onClose={() => setAddNodeParent(null)}
        onCreate={handleCreateNode}
      />
    </div>
  );
}

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; username: string }
  | { status: 'unauthenticated' };

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">CohortTrack</h1>
          <p className="text-text-secondary">Windows 11 Upgrade Tracking</p>
        </div>

        <div className="bg-surface-secondary rounded-lg p-8 border border-surface-tertiary">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">Sign In</h2>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          <p className="text-xs text-text-tertiary text-center mt-4">
            Restricted to authorized users only
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setAuthState({ status: 'authenticated', username: user.username });
      } catch {
        setAuthState({ status: 'unauthenticated' });
      }
    };

    checkAuth();

    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkAuth();
          break;
        case 'signedOut':
          setAuthState({ status: 'unauthenticated' });
          break;
      }
    });

    return () => hubListener();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (authState.status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-status-blue border-t-transparent" />
      </div>
    );
  }

  if (authState.status === 'unauthenticated') {
    return <LoginPage />;
  }

  return <AppContent signOut={handleSignOut} />;
}

export default App;
