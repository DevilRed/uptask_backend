import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { closeDB, connectDB } from "../../src/config/db";
import Project, { IProject } from '../../src/models/Project';

// Set environment variables for testing
process.env.NODE_ENV = 'development';
process.env.FRONTEND_URL = 'http://localhost:3000';

const mockedUserId = '507f1f77bcf86cd799439011'

// mock auth middleware before app is imported
vi.mock('../../src/middleware/auth', () => ({
	authenticate: (req: Request, res: Response, next: NextFunction) => {
		// Mock user data for testing
		req.user = {
			_id: mockedUserId,
			id: mockedUserId, // Add id property for controller access
			name: 'Test User',
			email: 'test@example.com'
		} as Request['user'];
		next();
	}
}));

import app from '../../src/server';
import Task from "../../src/models/Task";
import Note from "../../src/models/Note";

// Mock the module Project model, to simulate real document
vi.mock('../../src/models/Project', () => {
	const mockFind = vi.fn();
	const mockFindById = vi.fn();
	const mockFindByIdAndUpdate = vi.fn();

	const MockProject = vi.fn().mockImplementation(() => ({
		save: vi.fn()
	}));

	// Add static methods to the constructor
	Object.assign(MockProject, {
		find: mockFind,
		findById: mockFindById,
		findByIdAndUpdate: mockFindByIdAndUpdate
	});

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
		const mockProjects: MockProject[] = [{ name: 'Project 1' }, { name: 'Project 2' }]
		/** type casting from any to unknown as never
			`unknown` is safer than `any` because it requires type checking before use
			`never` represents a type that should never exist, making it clear this is a mock
			Testing Convention:
				Makes it clear that this type casting is intentional for testing purpose

				alternatives:
					use proper typing for mocks, create proper mock interfaces
					The as unknown as never pattern is widely adopted in modern TypeScript testing because it strikes the right balance between type safety and testing flexibility.
		*/
		vi.mocked(Project.find).mockResolvedValue(mockProjects as unknown as never);

		const res = await request(app).get('/api/projects');

		expect(res.status).toBe(200);
		expect(res.body).toEqual(mockProjects);
		// The controller uses a query structure that checks both manager and team
		expect(Project.find).toHaveBeenCalledWith({
			$or: [
				{ manager: { $in: mockedUserId } },
				{ team: { $in: mockedUserId }}
			]
		});
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
		const mockSavedProject = {
			_id: '123',
			...newProject,
			manager: mockedUserId // The controller adds this
		}

		// Create a mock instance with save method that returns the instance itself
		const mockInstance = {
			...mockSavedProject, // Include the _id and manager in the instance
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

	it('GET /api/projects/:id should return a project', async () => {
		// Mock project findById
		const mockProject = {
			// use a valid object id format to pass route validation
			_id: mockedUserId,
			manager: mockedUserId, // Same as the mocked user ID
			projectName: 'Test project',
			clientName: 'Thulio',
			description: 'lalala'
		}

		// Mock findById to return an object with populate method
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vi.mocked((Project as any).findById).mockReturnValue({
			populate: vi.fn().mockResolvedValue(mockProject)
		});

		const res = await request(app).get('/api/projects/507f1f77bcf86cd799439011');

		expect(res.status).toBe(200);
		expect(res.body).toEqual(mockProject);
	})
	it('PUT /api/projects/:id should update the project', async () => {
		const updateData = {
			projectName: 'Updated project',
			clientName: 'Updated client',
			description: 'Updated description'
		}
		// Create a mock document with save method since that's used on controller updateProject method
		const mockProject = {
			_id: mockedUserId,
			manager: mockedUserId, // Same as the mocked user ID
			...updateData,
			save: vi.fn().mockResolvedValue(true) // Mock save method
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vi.mocked((Project as any).findById).mockResolvedValue(mockProject)

		const res = await request(app).put('/api/projects/507f1f77bcf86cd799439011').send(updateData)

		expect(res.status).toBe(200)
		expect(res.body).toEqual('Project updated successfully')
		expect(mockProject.save).toHaveBeenCalled()
	})

	it('DELETE /api/projects/:id should delete a project', async () => {
		// 1. Create the mock project
		const mockProject = {
			_id: mockedUserId,
			manager: mockedUserId, // Same as the mocked user ID
			deleteOne: vi.fn().mockResolvedValue(true),
		}
		// 2. Properly mock Project.findById
		vi.mocked(Project.findById).mockResolvedValue(mockProject)

		// 3. Make the request
		const res = await request(app).delete('/api/projects/507f1f77bcf86cd799439011')

		// 4. Assertions
		expect(res.status).toBe(200)
		expect(res.body).toBe('Project deleted successfully')
	})

	// Test team membership scenarios for getAllProjects
	it('GET /api/projects should return projects where user is in team', async () => {
		const mockProjects = [
			{
				_id: mockedUserId,
				projectName: 'Team Project',
				clientName: 'Client',
				description: 'Description',
				manager: '507f1f77bcf86cd799439012', // different manager
				team: [mockedUserId] // mocked user is in team
			}
		];

		vi.mocked(Project.find).mockResolvedValue(mockProjects as unknown as never);

		const res = await request(app).get('/api/projects');

		expect(res.status).toBe(200);
		expect(res.body).toEqual(mockProjects);
		expect(Project.find).toHaveBeenCalledWith({
			$or: [
				{ manager: { $in: mockedUserId } },
				{ team: { $in: mockedUserId }}
			]
		});
	})

	it('GET /api/projects should return empty array when user is not manager or in team', async () => {
		const mockProjects: IProject[] = [];

		vi.mocked(Project.find).mockResolvedValue(mockProjects as unknown as never);

		const res = await request(app).get('/api/projects');

		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
		expect(Project.find).toHaveBeenCalledWith({
			$or: [
				{ manager: { $in: mockedUserId } },
				{ team: { $in: mockedUserId }}
			]
		});
	})

	// Test team membership scenarios for getProjectById
	it('GET /api/projects/:id should return project when user is in team', async () => {
		const mockProject = {
			_id: mockedUserId,
			projectName: 'Team Project',
			clientName: 'Client',
			description: 'Description',
			manager: '507f1f77bcf86cd799439012', // Different manager
			team: [mockedUserId], // User is in team
			tasks: []
		};

		vi.mocked(Project.findById).mockReturnValue({
			populate: vi.fn().mockResolvedValue(mockProject)
		} as unknown as never);

		const res = await request(app).get('/api/projects/507f1f77bcf86cd799439011');

		expect(res.status).toBe(200);
		expect(res.body).toEqual(mockProject);
	})

	it('GET /api/projects/:id should return 404 when user is neither manager nor in team', async () => {
		const mockProject = {
			_id: mockedUserId,
			projectName: 'Private Project',
			clientName: 'Client',
			description: 'Description',
			manager: '507f1f77bcf86cd799439012', // Different manager
			team: ['507f1f77bcf86cd799439013'], // Different team member
			tasks: []
		};

		vi.mocked(Project.findById).mockReturnValue({
			populate: vi.fn().mockResolvedValue(mockProject)
		} as unknown as never);

		const res = await request(app).get('/api/projects/507f1f77bcf86cd799439011');

		expect(res.status).toBe(404);
		expect(res.body).toEqual({ error: 'Invalid user action' });
	})

	it('GET /api/projects/:id should return 404 when project does not exist', async () => {
		vi.mocked(Project.findById).mockReturnValue({
			populate: vi.fn().mockResolvedValue(null)
		} as unknown as never);

		const res = await request(app).get('/api/projects/507f1f77bcf86cd799439011');

		expect(res.status).toBe(404);
		expect(res.body).toEqual({ error: 'Project not found' });
	})

	it('DELETE /:projectId should delete the project and all related task and notes', async () => {
		// Temporarily unmock Project model for this integration test
		vi.doUnmock('../../src/models/Project');
		// Re-import to get the real model
		const ProjectModule = await import('../../src/models/Project');
		const RealProject = ProjectModule.default;

		// Clean up any existing test data
		await Task.deleteMany({});
		await Note.deleteMany({});
		await RealProject.deleteMany({});

		// 1. Create a new project and task
		const project = await RealProject.create({
			projectName: 'Project Deletion Test',
			clientName: 'Test Client',
			description: 'Test project for note deletion',
			manager: mockedUserId
		})

		const task = await Task.create({
			name: 'Task with notes',
			description: 'Task that will be deleted with notes',
			project: project._id
		})

		// 2. Create multiple notes associated with the task
		const note1 = await Note.create({
			content: 'First note for the task',
			createdBy: mockedUserId,
			task: task._id
		})

		const note2 = await Note.create({
			content: 'Second note for the task',
			createdBy: mockedUserId,
			task: task._id
		})

		const note3 = await Note.create({
			content: 'Third note for the task',
			createdBy: mockedUserId,
			task: task._id
		})

		// Verify notes and task were created
		const notesBeforeDelete = await Note.find({ task: task._id })
		expect(notesBeforeDelete.length).toBe(3)
		const tasksBeforeDelete = await Task.find({ project: project._id })
		expect(tasksBeforeDelete.length).toBe(1)

		// Mock Project.findById to use the real model's findById
		// The middleware still uses the mocked Project, so we need to redirect it to the real model
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vi.mocked((Project as any).findById).mockImplementation((id: string) => {
			return RealProject.findById(id);
		});

		// 3. Delete the project via API
		const res = await request(app).delete(`/api/projects/${project._id}`)

		expect(res.status).toBe(200)
		expect(res.body).toBe("Project deleted successfully")

		// 4. Verify project is deleted
		const deletedProject = await RealProject.findById(project._id)
		expect(deletedProject).toBeNull()

		// 5. Verify all related tasks are deleted
		const tasksAfterDelete = await Task.find({ project: project._id })
		expect(tasksAfterDelete).toHaveLength(0)

		// 6. Verify all related notes are deleted
		const notesAfterDelete = await Note.find({ task: task._id })
		expect(notesAfterDelete).toHaveLength(0)

		// 7. Verify specific notes no longer exist
		const note1Check = await Note.findById(note1._id)
		const note2Check = await Note.findById(note2._id)
		const note3Check = await Note.findById(note3._id)
		expect(note1Check).toBeNull()
		expect(note2Check).toBeNull()
		expect(note3Check).toBeNull()
	}, 10000) // 10 second timeout for database operations
});
