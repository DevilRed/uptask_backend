import type { Request, Response } from "express";
import { Types } from "mongoose";
import Task from "../models/Task";

export class TaskController {
  static addTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      // add project to task, project.id is of ObjectId type
      task.project = req.project._id as Types.ObjectId;

      // Save the task first to get the _id
      await task.save();

      // Now add task to project's tasks array
      req.project.tasks.push(task._id as Types.ObjectId);
      await req.project.save();

      res.status(201).json(task);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error adding task" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project._id }).populate({
        path: 'project',
        select: 'projectName clientName'
      });
      res.json(tasks);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting task" });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.params.id)
      if (!task) {
        const error = new Error('Task not found')
        res.status(404).json({ message: error.message })
      }
      if (task && task.project.toString() !== req.params.projectId) {
        return res.status(400).json({ error: 'Task does not belong to project' })
      }
      return res.json(task)
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting task" });
    }
  };
}