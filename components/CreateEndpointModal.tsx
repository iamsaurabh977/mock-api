'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MockEndpoint } from '@/lib/types';

interface CreateEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    method: string;
    path: string;
    response: any;
    statusCode: number;
    headers?: Record<string, string>;
  }) => void;
  editingEndpoint?: MockEndpoint | null;
}

export default function CreateEndpointModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingEndpoint 
}: CreateEndpointModalProps) {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [response, setResponse] = useState('{\n  "message": "Hello World"\n}');
  const [statusCode, setStatusCode] = useState(200);
  const [headers, setHeaders] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    if (editingEndpoint) {
      setMethod(editingEndpoint.method);
      setPath(editingEndpoint.path);
      setResponse(JSON.stringify(editingEndpoint.response, null, 2));
      setStatusCode(editingEndpoint.statusCode);
      setHeaders(editingEndpoint.headers ? JSON.stringify(editingEndpoint.headers, null, 2) : '');
    } else {
      setMethod('GET');
      setPath('');
      setResponse('{\n  "message": "Hello World"\n}');
      setStatusCode(200);
      setHeaders('');
    }
    setJsonError('');
  }, [editingEndpoint, isOpen]);

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateJson(response)) {
      setJsonError('Invalid JSON in response');
      return;
    }

    let parsedHeaders = {};
    if (headers.trim()) {
      if (!validateJson(headers)) {
        setJsonError('Invalid JSON in headers');
        return;
      }
      parsedHeaders = JSON.parse(headers);
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        method,
        path: path.startsWith('/') ? path : `/${path}`,
        response: JSON.parse(response),
        statusCode,
        headers: Object.keys(parsedHeaders).length > 0 ? parsedHeaders : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResponseChange = (value: string) => {
    setResponse(value);
    if (jsonError && validateJson(value)) {
      setJsonError('');
    }
  };

  const handleHeadersChange = (value: string) => {
    setHeaders(value);
    if (jsonError && (!value.trim() || validateJson(value))) {
      setJsonError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingEndpoint ? 'Edit Endpoint' : 'Create New Endpoint'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
                Method *
              </label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label htmlFor="statusCode" className="block text-sm font-medium text-gray-700 mb-2">
                Status Code *
              </label>
              <input
                type="number"
                id="statusCode"
                value={statusCode}
                onChange={(e) => setStatusCode(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="100"
                max="599"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-2">
              Path *
            </label>
            <input
              type="text"
              id="path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/users/profile"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
              Response JSON *
            </label>
            <textarea
              id="response"
              value={response}
              onChange={(e) => handleResponseChange(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{\n  "message": "Hello World"\n}'
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="headers" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Headers (JSON, optional)
            </label>
            <textarea
              id="headers"
              value={headers}
              onChange={(e) => handleHeadersChange(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{\n  "X-Custom-Header": "value"\n}'
            />
          </div>

          {jsonError && (
            <div className="mb-4 text-red-600 text-sm">
              {jsonError}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!jsonError}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : editingEndpoint ? 'Update Endpoint' : 'Create Endpoint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}