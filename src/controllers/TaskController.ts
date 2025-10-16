import type { Request, Response } from "express";
import { Types } from "mongoose";
import Task, { isValidTaskStatus } from "../models/Task";

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
      const task = await Task.findById(req.params.taskId).populate({
        path: 'completedBy',
        select: 'id name email'
      })
      if (!task) {
        const error = new Error('Task not found')
        res.status(404).json({ message: error.message })
        return
      }

      return res.json(task)
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting task" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {

      if (req.task) {
        req.task.name = req.body.name
        req.task.description = req.body.description
        await req.task.save()
      }
      return res.send('Task updated succesfully')
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating task" });
    }
  };
  static deleteTask = async (req: Request, res: Response) => {
    try {
      if (req.task) {
        // await task.deleteOne()
        // delete task from project document
        req.project.tasks = req.project.tasks.filter(taskId => taskId?.toString() !== req.params.taskId)
        // await req.project.save()
        await Promise.allSettled([req.task.deleteOne(), req.project.save()])
      }
      return res.send('Task deleted succesfully')
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating task" });
    }
  };
  static updateStatus = async (req: Request, res: Response) => {
    try {
      if (req.task) {
        const { status } = req.body
        if (!isValidTaskStatus(status)) {
          return res.status(400).send("Invalid task status");
        }
        req.task.status = status
        if (status === 'pending') {
          req.task.completedBy = null
        } else {
          req.task.completedBy = req.user?.id
        }
        await req.task.save()
        return res.status(200).send('Task status updated')
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating task" });
    }
  };
}
