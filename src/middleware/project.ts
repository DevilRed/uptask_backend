import type { NextFunction, Request, Response } from "express";
import Project, { IProject } from "../models/Project";
import { Types } from "mongoose";

// Extend Express Request interface using module augmentation, to include project
// By extending express-serve-static-core directly, we ensure that the project property is properly recognized across all Express-related type definitions.
declare module "express-serve-static-core" {
	interface Request {
		project: IProject
	}
}

export async function projectExists(req: Request, res: Response, next: NextFunction) {
	try {
		const { projectId } = req.params
		if (!Types.ObjectId.isValid(projectId)) {
			return res.status(400).json({ error: 'Invalid project ID format' });
		}
		const project = await Project.findById(projectId)
		if (!project) {
			const error = new Error("Project not found");
			return res.status(404).json({ error: error.message });
		}
		req.project = project
		next()
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: 'There has been an error' })
	}
}