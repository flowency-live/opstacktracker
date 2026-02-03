import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { HierarchyTree } from './components/tree/HierarchyTree';
import { NodeEditor } from './components/edit';
import { SearchFilter } from './components/search';
import { Dashboard } from './components/dashboard';
import { useNodes } from './hooks/useNodes';
import { useNodeFilter } from './hooks/useNodeFilter';
import type { Node } from './domain/node.schema';
import outputs from '../amplify_outputs.json';
import './index.css';

Amplify.configure(outputs);

type ViewTab = 'tree' | 'dashboard';

function App() {
  const { nodes, isLoading, error, refetch, updateNode } = useNodes();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('tree');

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
    // Update selected node if it was edited
    if (selectedNode?.id === id) {
      setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      <header className="bg-surface-secondary border-b border-surface-tertiary px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-text-primary">CohortTrack</h1>
          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex bg-surface-tertiary rounded-lg p-1">
              <button
                onClick={() => setActiveTab('tree')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'tree'
                    ? 'bg-surface-hover text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Hierarchy
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'dashboard' ? (
          /* Dashboard View */
          <div className="bg-surface-secondary rounded-lg p-4">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Dashboard
            </h2>
            <Dashboard nodes={nodes} />
          </div>
        ) : (
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
    </div>
  );
}

export default App;
