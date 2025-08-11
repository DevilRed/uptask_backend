import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import request from "supertest"
import app from '../../src/server'
import { connectDB, closeDB } from "../../src/config/db";
import Project from '../../src/models/Project';

// Mock the Project model
vi.mock('../../src/models/Project', () => {
	const MockProject = vi.fn().mockImplementation(() => ({
		save: vi.fn()
	}));

	// Add static methods to the constructor

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(MockProject as any).find = vi.fn();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(MockProject as any).findById = vi.fn();

	return {
		default: MockProject
	};
});



interface MockProject {
	name: string;
}

describe('ProjectController', () => {
	beforeAll(async () => {
		await connectDB()
	})
	beforeEach(async () => {
		vi.clearAllMocks(); // Reset mocks between tests

		// Reset the Project mock to default behavior
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Project as any).mockClear();
	});

	afterAll(async () => {
		await closeDB();
	});

	it('GET /api/projects should return all projects', async () => {
		// Mock project find
		const mockProjects: MockProject[] = [{ name: 'Project 1' }, { name: 'Project 2' }]		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vi.mocked(Project.find).mockResolvedValue(mockProjects as any);

		const res = await request(app).get('/api/projects');

		expect(res.status).toBe(200);
		expect(res.body).toEqual(mockProjects);
		expect(Project.find).toHaveBeenCalledWith({});
	})

	it('GET /projects  should handle errors', async () => {
		vi.mocked(Project.find).mockRejectedValue(new Error('DB error'))

		const res = await request(app).get('/api/projects');

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ message: 'Error getting projects' })
	})

	it('POST /projects should create a project', async () => {
		const newProject = {
			projectName: 'New Project',
			clientName: 'Test Client',
			description: 'Test Description'
		}
		const mockSavedProject = { _id: '123', ...newProject }

		// Create a mock instance with save method that returns the instance itself
		const mockInstance = {
			...mockSavedProject, // Include the _id in the instance
			save: vi.fn().mockResolvedValue(mockSavedProject)
		};

		// Mock the constructor to return our mock instance
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vi.mocked(Project as any).mockReturnValue(mockInstance);

		const res = await request(app).post('/api/projects').send(newProject)

		expect(res.status).toBe(201)
		expect(res.body).toEqual(mockSavedProject)
		// Verify the constructor was called with the request data
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(vi.mocked(Project as any)).toHaveBeenCalledWith(newProject)
		// Verify save was called
		expect(mockInstance.save).toHaveBeenCalled()
	})
});