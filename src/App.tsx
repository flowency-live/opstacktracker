import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { HierarchyTree } from './components/tree/HierarchyTree';
import { useNodes } from './hooks/useNodes';
import type { Node } from './domain/node.schema';
import outputs from '../amplify_outputs.json';
import './index.css';

Amplify.configure(outputs);

function NodeDetailPanel({ node }: { node: Node }) {
  return (
    <div
      data-testid="node-detail-panel"
      className="p-4 bg-surface-secondary rounded-lg"
    >
      <h2 className="text-lg font-semibold text-text-primary mb-4">{node.name}</h2>

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-text-tertiary">Type:</span>
          <span className="ml-2 text-text-primary capitalize">{node.type}</span>
        </div>

        <div>
          <span className="text-text-tertiary">Status:</span>
          <span className={`ml-2 capitalize status-${node.status}`}>{node.status}</span>
        </div>

        {node.contact && (
          <div>
            <span className="text-text-tertiary">Contact:</span>
            <span className="ml-2 text-text-primary">{node.contact}</span>
          </div>
        )}

        {node.additionalContacts && node.additionalContacts.length > 0 && (
          <div>
            <span className="text-text-tertiary">Additional Contacts:</span>
            <ul className="ml-2 text-text-secondary">
              {node.additionalContacts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {node.headcount !== null && node.headcount !== undefined && (
          <div>
            <span className="text-text-tertiary">Headcount:</span>
            <span className="ml-2 text-text-primary">{node.headcount.toLocaleString()}</span>
          </div>
        )}

        {node.type === 'cohort' && node.deviceCount !== null && (
          <div>
            <span className="text-text-tertiary">Devices:</span>
            <span className="ml-2 text-text-primary">
              {node.completedCount ?? 0} / {node.deviceCount} completed
            </span>
          </div>
        )}

        {node.location && (
          <div>
            <span className="text-text-tertiary">Location:</span>
            <span className="ml-2 text-text-primary">{node.location}</span>
          </div>
        )}

        {node.notes && (
          <div>
            <span className="text-text-tertiary">Notes:</span>
            <p className="mt-1 text-text-secondary">{node.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {node.confluenceUrl && (
            <a
              href={node.confluenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-status-blue hover:underline"
            >
              Confluence
            </a>
          )}
          {node.jiraUrl && (
            <a
              href={node.jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-status-blue hover:underline"
            >
              Jira
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { nodes, isLoading, error, refetch } = useNodes();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleSelect = (node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      <header className="bg-surface-secondary border-b border-surface-tertiary px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-text-primary">CohortTrack</h1>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 text-sm bg-surface-tertiary hover:bg-surface-hover rounded text-text-secondary"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-surface-secondary rounded-lg p-4">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Organisation Hierarchy
              </h2>
              <HierarchyTree
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
              <NodeDetailPanel node={selectedNode} />
            ) : (
              <div className="p-4 bg-surface-secondary rounded-lg text-text-tertiary text-center">
                Select a node to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
