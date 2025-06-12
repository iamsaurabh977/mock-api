import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';
import { nanoid } from 'nanoid';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const endpoints = dbHelpers.getEndpoints(params.id);

    // Transform database results to match expected format
    const formattedEndpoints = endpoints.map((endpoint: any) => ({
      id: endpoint.id,
      projectId: endpoint.project_id,
      method: endpoint.method,
      path: endpoint.path,
      response: endpoint.response_data ? JSON.parse(endpoint.response_data) : {},
      statusCode: endpoint.status_code,
      headers: undefined, // SQLite version doesn't store headers yet
      createdAt: new Date(endpoint.created_at),
      updatedAt: new Date(endpoint.updated_at)
    }));

    return NextResponse.json(formattedEndpoints);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch endpoints' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if endpoint already exists
    const existingEndpoint = dbHelpers.getEndpointByPath(params.id, method, normalizedPath) as { id: string } | undefined;

    if (existingEndpoint) {
      return NextResponse.json(
        { error: 'Endpoint with this method and path already exists' },
        { status: 409 }
      );
    }

    const endpointId = nanoid();

    dbHelpers.createEndpoint({
      id: endpointId,
      project_id: params.id,
      name: `${method} ${normalizedPath}`,
      method,
      path: normalizedPath,
      response_data: JSON.stringify(response),
      status_code: statusCode
    });

    const endpoint = dbHelpers.getEndpoint(endpointId);

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

    return NextResponse.json(formattedEndpoint, { status: 201 });
  } catch (error) {
    console.error('Error creating endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to create endpoint' },
      { status: 500 }
    );
  }
}
