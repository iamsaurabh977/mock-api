export interface Project {
  _id?: string;
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockEndpoint {
  _id?: string;
  id: string;
  projectId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  response: any;
  statusCode: number;
  headers?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface CreateEndpointRequest {
  projectId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  response: any;
  statusCode?: number;
  headers?: Record<string, string>;
}