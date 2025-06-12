import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const projects = dbHelpers.getProjects();
    
    // Transform database results to match expected format
    const formattedProjects = projects.map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at)
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const projectId = nanoid();
    
    dbHelpers.createProject({
      id: projectId,
      name: name.trim(),
      description: description?.trim() || ''
    });

    const project = dbHelpers.getProject(projectId);
    
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at)
    };

    return NextResponse.json(formattedProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}