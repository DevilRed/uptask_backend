import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Set environment variables for testing
process.env.NODE_ENV = 'development';
process.env.FRONTEND_URL = 'http://localhost:3000';

const userId = '507f1f77bcf86cd799439011'
// mock auth middleware before app is imported
vi.mock('../../src/middleware/auth', () => ({
	authenticate: (req: Request, res: Response, next: NextFunction) => {
		// Mock user data for testing
		req.user = {
			_id: userId,
			id: userId, // Add id property for controller access
			name: 'Test User',
			email: 'test@example.com'
		} as Request['user'];
		next();
	}
}));

import { closeDB, connectDB } from "../../src/config/db";
import Project from '../../src/models/Project';
import Task from "../../src/models/Task";
import Note from "../../src/models/Note";
import app from "../../src/server";

describe('TaskController', () => {
	beforeAll(async () => {
		await connectDB()
		// clean up existing data
		await Project.deleteMany({});
		await Task.deleteMany({});
		await Note.deleteMany({});

		// create test data, save them to database
		const project = await Project.create({
			projectName: 'Integration Test',
			clientName: 'Test Client',
			description: 'Test project description',
			manager: userId
		})

		await Task.create({
			name: 'Task testing',
			description: 'Test description',
			project: project._id
		})
	})

	afterAll(async () => {
		await Project.deleteMany({})
		await Task.deleteMany({})
		await Note.deleteMany({})
		await closeDB();
	});

	it('GET /api/projects/:projectId/tasks should return all tasks for given project', async () => {
		const project = await Project.findOne()
		if (!project) throw new Error("Test project not found");

		const res = await request(app).get(`/api/projects/${project!._id}/tasks`)

		expect(res.status).toBe(200);
		expect(res.body[0].name).toBe('Task testing')
	})

	it('POST /api/projects/:projectId/tasks should add task and update project', async () => {
		const project = await Project.findOne()
		if (!project) throw new Error("Test project not found");

		const payload = { name: 'Task created', description: 'description' }

		const res = await request(app)
			.post(`/api/projects/${project!._id}/tasks`)
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')

		expect(res.status).toBe(201)
		expect(res.body).toHaveProperty('_id');
		expect(res.body.name).toBe('Task created');
	})

	it('GET /api/projects/:projectId/tasks/:id return specific task', async () => {
		const project = await Project.findOne()
		const task = await Task.findOne()
		if (!task) throw new Error("Test project not found");

		const res = await request(app).get(`/api/projects/${project!._id}/tasks/${task._id}`)
		expect(res.status).toBe(200)
		expect(res.body.name).toEqual('Task testing')
	})

	it('PUT /:projectId/tasks/:id updates the task', async () => {
		const project = await Project.findOne()
		const task = await Task.findOne()
		const payload = { name: 'Task updated', description: 'description updated' }

		const res = await request(app)
			.put(`/api/projects/${project!._id}/tasks/${task!._id}`)
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')

		expect(res.text).toEqual("Task updated succesfully")
	})

	it('DELETE /:projectId/tasks/:id with valid id deletes the task', async () => {
		const project = await Project.findOne()
		const task = await Task.findOne()

		const res = await request(app).delete(`/api/projects/${project!._id}/tasks/${task!._id}`)

		expect(res.status).toBe(200);
		expect(res.text).toEqual("Task deleted succesfully")

		// 5. Verify database state
		const deletedTask = await Task.findById(task!._id);
		expect(deletedTask).toBeNull();

		// 6. Verify task was removed from project's tasks array
		const updatedProject = await Project.findById(project!._id);
		expect(updatedProject?.tasks).not.toContainEqual(task!._id);
	})

	it('POST /:projectId/tasks/:id/status should update task status', async () => {
		const project = await Project.findOne()
		const task = await Task.findOne()
		const payload = { status: 'inProgress' }

		const res = await request(app)
			.post(`/api/projects/${project!._id}/tasks/${task!._id}/status`)
			.send(payload)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')

		expect(res.text).toEqual("Task status updated")
	})

	it('DELETE /:projectId/tasks/:id should delete task and all related notes', async () => {
		// 1. Create a new project and task
		const project = await Project.create({
			projectName: 'Note Deletion Test',
			clientName: 'Test Client',
			description: 'Test project for note deletion',
			manager: userId
		})

		const task = await Task.create({
			name: 'Task with notes',
			description: 'Task that will be deleted with notes',
			project: project._id
		})

		// 2. Create multiple notes associated with the task
		const note1 = await Note.create({
			content: 'First note for the task',
			createdBy: userId,
			task: task._id
		})

		const note2 = await Note.create({
			content: 'Second note for the task',
			createdBy: userId,
			task: task._id
		})

		const note3 = await Note.create({
			content: 'Third note for the task',
			createdBy: userId,
			task: task._id
		})

		// Verify notes were created
		const notesBeforeDelete = await Note.find({ task: task._id })
		expect(notesBeforeDelete.length).toBe(3)

		// 3. Delete the task via API
		const res = await request(app).delete(`/api/projects/${project._id}/tasks/${task._id}`)

		expect(res.status).toBe(200)
		expect(res.text).toEqual("Task deleted succesfully")

		// 4. Verify task is deleted
		const deletedTask = await Task.findById(task._id)
		expect(deletedTask).toBeNull()

		// 5. Verify all related notes are deleted
		const notesAfterDelete = await Note.find({ task: task._id })
		expect(notesAfterDelete).toHaveLength(0)

		// 6. Verify specific notes no longer exist
		const note1Check = await Note.findById(note1._id)
		const note2Check = await Note.findById(note2._id)
		const note3Check = await Note.findById(note3._id)
		expect(note1Check).toBeNull()
		expect(note2Check).toBeNull()
		expect(note3Check).toBeNull()

		// 7. Verify task was removed from project's tasks array
		const updatedProject = await Project.findById(project._id)
		expect(updatedProject?.tasks).not.toContainEqual(task._id)
	})
})