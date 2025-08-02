import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({});
      res.status(200).json(projects);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting projects" });
    }
  };
  static addProject = async (req: Request, res: Response) => {
    try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).json(project);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error adding project" });
    }
  };
}
