import type { NextFunction, Request, Response } from "express";
import Task, { ITask } from "../models/Task";
import { Types } from "mongoose";


declare module "express-serve-static-core" {
	interface Request {
		task: ITask
	}
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
	try {
		const { taskId } = req.params
		if (!Types.ObjectId.isValid(taskId)) {
			return res.status(400).json({ error: 'Invalid project ID format' });
		}
		const task = await Task.findById(taskId)
		if (!task) {
			const error = new Error("Task not found");
			return res.status(404).json({ error: error.message });
		}
		req.task = task
		next()
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: 'There has been an error' })
	}
}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
	if (req.task.project.toString() !== req.params.projectId.toString()) {
		return res.status(400).json({ error: 'Task does not belong to project' })
	}
	next()
}