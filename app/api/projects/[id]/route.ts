import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = dbHelpers.getProject(params.id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at)
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = dbHelpers.deleteProject(params.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}