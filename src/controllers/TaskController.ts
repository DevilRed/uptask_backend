import type { Request, Response } from "express";
import { Types } from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";

export class TaskController {
	static addTask = async (req: Request, res: Response) => {
		const { projectId } = req.params
		const project = await Project.findById(projectId)
		if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ error: error.message });
      }
    try {
      const task = new Task(req.body);
			// add project to task, project.id is of ObjectId type
			task.project = project._id as Types.ObjectId;
      await task.save();
			// add task to project, task.id is ObjectId type
			project.tasks.push(task._id as Types.ObjectId);
      await project.save();
      res.status(201).json(task);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error adding task" });
    }
  };
}