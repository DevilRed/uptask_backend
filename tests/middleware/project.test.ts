import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import Project from "../../src/models/Project";
import { projectExists } from "../../src/middleware/project";
import { Types } from "mongoose";

vi.mock('../../src/models/Project')

describe('projectExists middleware', () => {
	let mockRequest: Partial<Request>
	let mockResponse: Partial<Response>
	let nextFunction: NextFunction

	beforeEach(() => {
		vi.clearAllMocks()
		mockRequest = {
			params: { projectId: new Types.ObjectId().toString() }
		}
		mockResponse = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn()
		}
		nextFunction = vi.fn()
	})

	it('should set req.project and call next() when project exists', async () => {
		// arrange
		const mockProject = {
			_id: mockRequest.params!.projectId,
			projectName: 'Test Project'
		}
		vi.mocked(Project.findById).mockResolvedValue(mockProject)

		// act
		await projectExists(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		)

		// assert
		expect(mockRequest.project).toEqual(mockProject)
		expect(nextFunction).toHaveBeenCalled()
		expect(mockResponse.status).not.toHaveBeenCalled()
	})

	it('should return 404 when project does not exist', async () => {
		// arrange
		vi.mocked(Project.findById).mockResolvedValue(null)

		// act
		await projectExists(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		)

		// assert
		expect(mockResponse.status).toHaveBeenCalledWith(404)
		expect(mockResponse.json).toHaveBeenCalledWith({
			error: 'Project not found'
		})
		expect(nextFunction).not.toHaveBeenCalled()
	})

	it('should return 500 for invalid project ID format', async () => {
		// arrange
		mockRequest.params = { projectId: 'invalid-id' }

		// act
		await projectExists(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		)

		// assert
		expect(mockResponse.status).toHaveBeenCalledWith(400)
		expect(nextFunction).not.toHaveBeenCalled()
	})

	it('should return 500 for database errors', async () => {
		vi.mocked(Project.findById).mockRejectedValue(new Error('DB Error'))

		await projectExists(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		)
		expect(mockResponse.status).toHaveBeenCalledWith(500)
	})
})