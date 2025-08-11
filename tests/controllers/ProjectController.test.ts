import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import request from "supertest"
import app from '../../src/server'
import { connectDB, closeDB } from "../../src/config/db";

// Mock the Project model
vi.mock('../../src/models/Project', () => ({
	default: {
		find: vi.fn(),
		findById: vi.fn()
	}
}));

import Project from '../../src/models/Project';

interface MockProject {
	name: string;
}

describe('ProjectController', () => {
	beforeEach(async () => {
		await connectDB();
		vi.clearAllMocks(); // Reset mocks between tests
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
});