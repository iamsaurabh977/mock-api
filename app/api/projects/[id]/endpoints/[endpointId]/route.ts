import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';

// Define the type for the endpoint returned from the database
interface DbEndpoint {
  id: string;
  project_id: string;
  name: string;
  method: string;
  path: string;
  response_data: string | null;
  status_code: number;
  created_at: string;
  updated_at: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; endpointId: string } }
) {
  try {
    const { method, path, response, statusCode = 200, headers } = await request.json();

    if (!method || !path || response === undefined) {
      return NextResponse.json(
        { error: 'Method, path, and response are required' },
        { status: 400 }
      );
    }

    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid HTTP method' },
        { status: 400 }
      );
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Check if another endpoint with same method and path exists (excluding current one)
    const existingEndpoint = dbHelpers.getEndpointByPath(params.id, method, normalizedPath) as { id: string } | undefined;

    if (existingEndpoint && existingEndpoint.id !== params.endpointId) {
      return NextResponse.json(
        { error: 'Another endpoint with this method and path already exists' },
        { status: 409 }
      );
    }

    const result = dbHelpers.updateEndpoint(params.endpointId, {
      name: `${method} ${normalizedPath}`,
      method,
      path: normalizedPath,
      response_data: JSON.stringify(response),
      status_code: statusCode
    });

    if (!result || result.changes === 0) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      );
    }

    const endpoint = dbHelpers.getEndpoint(params.endpointId) as DbEndpoint;

    const formattedEndpoint = {
      id: endpoint.id,
      projectId: endpoint.project_id,
      method: endpoint.method,
      path: endpoint.path,
      response: JSON.parse(endpoint.response_data),
      statusCode: endpoint.status_code,
      headers: undefined,
      createdAt: new Date(endpoint.created_at),
      updatedAt: new Date(endpoint.updated_at)
    };

    return NextResponse.json(formattedEndpoint);
  } catch (error) {
    console.error('Error updating endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to update endpoint' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; endpointId: string } }
) {
  try {
    const result = dbHelpers.deleteEndpoint(params.endpointId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to delete endpoint' },
      { status: 500 }
    );
  }
}
