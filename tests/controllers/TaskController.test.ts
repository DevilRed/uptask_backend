import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/server";
import { connectDB, closeDB } from "../../src/config/db";
import Task from "../../src/models/Task";
import Project from '../../src/models/Project';

describe('TaskController', () => {
	beforeAll(async () => {
		await connectDB()
		// clean up existing data
		await Project.deleteMany({});
		await Task.deleteMany({});

		// create test data, save them to database
		const project = await Project.create({
			projectName: 'Integration Test',
			clientName: 'Test Client',
			description: 'Test project description'
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
		await closeDB();
	});

	it('GET /api/projects/:projectId/tasks should return all tasks for given project', async () => {
		const project = await Project.findOne()
		if (!project) throw new Error("Test project not found");

		const res = await request(app).get(`/api/projects/${project!._id}/tasks`)

		// console.log(res);
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

		expect(res.text).toEqual("Task deleted succesfully")
	})
})