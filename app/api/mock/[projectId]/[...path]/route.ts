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

async function handleMockRequest(
  request: NextRequest,
  { params }: { params: { projectId: string; path: string[] } }
) {
  try {
    const method = request.method;
    const path = '/' + (params.path?.join('/') || '');

    const endpoint = dbHelpers.getEndpointByPath(params.projectId, method, path) as DbEndpoint | undefined;

    if (!endpoint) {
      return NextResponse.json(
        { 
          error: 'Mock endpoint not found',
          message: `No mock endpoint found for ${method} ${path} in project ${params.projectId}`
        },
        { status: 404 }
      );
    }

    // Prepare response headers
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Mock-API': 'true',
      'X-Project-ID': params.projectId,
      'X-Endpoint-ID': endpoint.id || '',
    };

    const responseData = endpoint.response_data ? JSON.parse(endpoint.response_data) : {};

    return NextResponse.json(
      responseData,
      { 
        status: endpoint.status_code,
        headers: responseHeaders
      }
    );
  } catch (error) {
    console.error('Error serving mock endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export handlers for all HTTP methods
export const GET = handleMockRequest;
export const POST = handleMockRequest;
export const PUT = handleMockRequest;
export const DELETE = handleMockRequest;
export const PATCH = handleMockRequest;
export const HEAD = handleMockRequest;
export const OPTIONS = handleMockRequest;
