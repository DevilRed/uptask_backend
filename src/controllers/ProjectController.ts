import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [
          { manager: { $in: req.user?.id } }
        ]
      });
      res.status(200).json(projects);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting projects" });
    }
  };
  static addProject = async (req: Request, res: Response) => {
    try {
      const project = new Project(req.body);
      if (req.user)
        project.manager = req.user.id
      await project.save();
      res.status(201).json(project);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error adding project" });
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log('Fetching project with ID:', id);

      const project = await Project.findById(id).populate('tasks');
      if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ error: error.message });
      }
      res.status(200).json(project);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting projects" });
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ error: error.message });
      }
      project.clientName = req.body.clientName
      project.projectName = req.body.projectName
      project.description = req.body.description
      await project.save();
      res.status(200).json("Project updated successfully");
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting project" });
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ error: error.message });
      }
      await project.deleteOne();
      res.status(200).json("Project deleted");
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting project" });
    }
  };
}
