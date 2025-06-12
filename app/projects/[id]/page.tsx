'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Globe, Copy } from 'lucide-react';
import Link from 'next/link';
import EndpointCard from '@/components/EndpointCard';
import CreateEndpointModal from '@/components/CreateEndpointModal';
import { Project, MockEndpoint } from '@/lib/types';
import toast from 'react-hot-toast';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<MockEndpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else if (response.status === 404) {
        toast.error('Project not found');
        router.push('/');
      }
    } catch (error) {
      toast.error('Failed to fetch project');
    }
  }, [projectId, router]);

  const fetchEndpoints = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/endpoints`);
      if (response.ok) {
        const data = await response.json();
        setEndpoints(data);
      }
    } catch (error) {
      toast.error('Failed to fetch endpoints');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchEndpoints();
    }
  }, [projectId, fetchProject, fetchEndpoints]);

  const handleCreateEndpoint = async (data: {
    method: string;
    path: string;
    response: any;
    statusCode: number;
    headers?: Record<string, string>;
  }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/endpoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newEndpoint = await response.json();
        setEndpoints([newEndpoint, ...endpoints]);
        toast.success('Endpoint created successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create endpoint');
      }
    } catch (error) {
      toast.error('Failed to create endpoint');
    }
  };

  const handleUpdateEndpoint = async (data: {
    method: string;
    path: string;
    response: any;
    statusCode: number;
    headers?: Record<string, string>;
  }) => {
    if (!editingEndpoint) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/endpoints/${editingEndpoint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedEndpoint = await response.json();
        setEndpoints(endpoints.map(e => e.id === editingEndpoint.id ? updatedEndpoint : e));
        setEditingEndpoint(null);
        toast.success('Endpoint updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update endpoint');
      }
    } catch (error) {
      toast.error('Failed to update endpoint');
    }
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/endpoints/${endpointId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEndpoints(endpoints.filter(e => e.id !== endpointId));
        toast.success('Endpoint deleted successfully!');
      } else {
        toast.error('Failed to delete endpoint');
      }
    } catch (error) {
      toast.error('Failed to delete endpoint');
    }
  };

  const handleCopyBaseUrl = () => {
    const baseUrl = `${window.location.origin}/api/mock/${projectId}`;
    navigator.clipboard.writeText(baseUrl);
    toast.success('Base URL copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span>Back to Projects</span>
              </Link>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-600 mt-2">{project.description}</p>
                )}
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Globe size={16} />
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      /api/mock/{projectId}
                    </code>
                    <button
                      onClick={handleCopyBaseUrl}
                      className="text-blue-600 hover:text-blue-800"
                      title="Copy base URL"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>New Endpoint</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Endpoints */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Endpoints</h2>
          <span className="text-gray-500">{endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}</span>
        </div>

        {endpoints.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No endpoints yet</h3>
            <p className="text-gray-600 mb-6">Create your first endpoint to start serving mock data</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Endpoint
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {endpoints.map((endpoint) => (
              <EndpointCard
                key={endpoint.id}
                endpoint={endpoint}
                onEdit={setEditingEndpoint}
                onDelete={handleDeleteEndpoint}
              />
            ))}
          </div>
        )}
      </main>

      <CreateEndpointModal
        isOpen={isCreateModalOpen || !!editingEndpoint}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingEndpoint(null);
        }}
        onSubmit={editingEndpoint ? handleUpdateEndpoint : handleCreateEndpoint}
        editingEndpoint={editingEndpoint}
      />
    </div>
  );
}