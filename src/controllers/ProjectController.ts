import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [
          { manager: { $in: req.user?.id } },
          { team: { $in: req.user?.id }}
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

      const project = await Project.findById(id).populate('tasks');
      if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ error: error.message });
      }
      if (project.manager?.toString() !== req.user?.id.toString() && !project.team.includes(req.user?.id)) {
        const error = new Error('Invalid user action')
        return res.status(404).json({ error: error.message })
      }
      res.status(200).json(project);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting projects" });
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.clientName = req.body.clientName
      req.project.projectName = req.body.projectName
      req.project.description = req.body.description
      await req.project.save();
      res.status(200).json("Project updated successfully");
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting project" });
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.status(200).json("Project deleted successfully");
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting project" });
    }
  };
}
