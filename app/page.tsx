'use client';

import { useState, useEffect } from 'react';
import { Plus, Database, Zap, Shield, Code } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectModal from '@/components/CreateProjectModal';
import { Project } from '@/lib/types';
import toast from 'react-hot-toast';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (data: { name: string; description: string }) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects([newProject, ...projects]);
        toast.success('Project created successfully!');
      } else {
        toast.error('Failed to create project');
      }
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        toast.success('Project deleted successfully!');
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mock API Generator</h1>
              <p className="text-gray-600 mt-1">Create and manage mock APIs for development and testing</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for mock APIs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build, test, and iterate faster with our comprehensive mock API platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Setup</h3>
              <p className="text-gray-600">Create mock endpoints in seconds without any configuration</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Persistent Storage</h3>
              <p className="text-gray-600">All your mock APIs are stored securely and available anytime</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="text-purple-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">RESTful APIs</h3>
              <p className="text-gray-600">Support for all HTTP methods with custom responses</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-orange-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reliable</h3>
              <p className="text-gray-600">Built for developers who need consistent, dependable mock data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
          <span className="text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <Database size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to start building mock APIs</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}