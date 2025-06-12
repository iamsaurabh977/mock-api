'use client';

import { MockEndpoint } from '@/lib/types';
import { Copy, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface EndpointCardProps {
  endpoint: MockEndpoint;
  onEdit: (endpoint: MockEndpoint) => void;
  onDelete: (endpointId: string) => void;
}

const methodColors = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
  PATCH: 'bg-purple-100 text-purple-800',
};

export default function EndpointCard({ endpoint, onEdit, onDelete }: EndpointCardProps) {
  const [showResponse, setShowResponse] = useState(false);

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/api/mock/${endpoint.projectId}${endpoint.path}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this endpoint?')) {
      onDelete(endpoint.id);
    }
  };

  const handleTestEndpoint = () => {
    const url = `${window.location.origin}/api/mock/${endpoint.projectId}${endpoint.path}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${methodColors[endpoint.method]}`}>
            {endpoint.method}
          </span>
          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {endpoint.path}
          </code>
          <span className="text-sm text-gray-500">
            Status: {endpoint.statusCode}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleTestEndpoint}
            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
            title="Test endpoint"
          >
            <ExternalLink size={16} />
          </button>
          <button
            onClick={handleCopyUrl}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
            title="Copy URL"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => onEdit(endpoint)}
            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
            title="Edit endpoint"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            title="Delete endpoint"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowResponse(!showResponse)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showResponse ? 'Hide Response' : 'Show Response'}
        </button>
      </div>

      {showResponse && (
        <div className="bg-gray-50 rounded p-4">
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(endpoint.response, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">
        Created: {new Date(endpoint.createdAt).toLocaleString()}
      </div>
    </div>
  );
}