'use client';

import { Project } from '@/lib/types';
import { Calendar, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? This will also delete all associated endpoints.')) {
      onDelete(project.id);
    }
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDelete}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              title="Delete project"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500">
          <Calendar size={14} className="mr-1" />
          Created {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}