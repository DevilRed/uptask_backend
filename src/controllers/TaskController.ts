import type { Request, Response } from "express";
import { Types } from "mongoose";
import Task from "../models/Task";

export class TaskController {
  static addTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
			// add project to task, project.id is of ObjectId type
      task.project = req.project._id as Types.ObjectId;
      // await task.save();
			// add task to project, task.id is ObjectId type
      req.project.tasks.push(task._id as Types.ObjectId);
      // await req.project.save();

      // improve performance by refactoring multiple await  by running all of them all at once since they are not dependent
      await Promise.allSettled([task.save(), req.project.save()])
      res.status(201).json(task);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error adding task" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate('project')
      res.json(tasks);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting task" });
    }
  };
}