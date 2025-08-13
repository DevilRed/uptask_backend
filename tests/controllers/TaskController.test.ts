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

		console.log(res);
		expect(res.status).toBe(200);
		expect(res.body[0].name).toBe('Task testing')
	})
})