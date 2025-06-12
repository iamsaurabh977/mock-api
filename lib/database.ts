import Database from 'better-sqlite3';
import path from 'path';

// Define the types for the database entities
interface DbProject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

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

// Create database file in the project directory
const dbPath = path.join(process.cwd(), 'mock-api-generator.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDb = () => {
  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Endpoints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS endpoints (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      response_data TEXT,
      status_code INTEGER DEFAULT 200,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    )
  `);
};

// Initialize database on first import
initDb();

export default db;

// Helper functions for database operations
export const dbHelpers = {
  // Projects
  createProject: (project: { id: string; name: string; description?: string }) => {
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, description)
      VALUES (?, ?, ?)
    `);
    return stmt.run(project.id, project.name, project.description || null);
  },

  getProjects: (): DbProject[] => {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    return stmt.all() as DbProject[];
  },

  getProject: (id: string): DbProject | undefined => {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id) as DbProject | undefined;
  },

  updateProject: (id: string, updates: { name?: string; description?: string }) => {
    const fields = [];
    const values = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`);
    return stmt.run(...values);
  },

  deleteProject: (id: string) => {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    return stmt.run(id);
  },

  // Endpoints
  createEndpoint: (endpoint: {
    id: string;
    project_id: string;
    name: string;
    method: string;
    path: string;
    response_data?: string;
    status_code?: number;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO endpoints (id, project_id, name, method, path, response_data, status_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      endpoint.id,
      endpoint.project_id,
      endpoint.name,
      endpoint.method,
      endpoint.path,
      endpoint.response_data || null,
      endpoint.status_code || 200
    );
  },

  getEndpoints: (projectId: string): DbEndpoint[] => {
    const stmt = db.prepare('SELECT * FROM endpoints WHERE project_id = ? ORDER BY created_at DESC');
    return stmt.all(projectId) as DbEndpoint[];
  },

  getEndpoint: (id: string): DbEndpoint | undefined => {
    const stmt = db.prepare('SELECT * FROM endpoints WHERE id = ?');
    return stmt.get(id) as DbEndpoint | undefined;
  },

  getEndpointByPath: (projectId: string, method: string, path: string): DbEndpoint | undefined => {
    const stmt = db.prepare('SELECT * FROM endpoints WHERE project_id = ? AND method = ? AND path = ?');
    return stmt.get(projectId, method, path) as DbEndpoint | undefined;
  },

  updateEndpoint: (id: string, updates: {
    name?: string;
    method?: string;
    path?: string;
    response_data?: string;
    status_code?: number;
  }) => {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE endpoints SET ${fields.join(', ')} WHERE id = ?`);
    return stmt.run(...values);
  },

  deleteEndpoint: (id: string) => {
    const stmt = db.prepare('DELETE FROM endpoints WHERE id = ?');
    return stmt.run(id);
  }
};
