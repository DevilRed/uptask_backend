import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { validateProjectExists } from "../middleware/project";

const router = Router();

router.get("/", ProjectController.getAllProjects);
router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid project ID"),
  handleInputErrors,
  ProjectController.getProjectById,
);
router.post(
  "/",
  body("projectName").notEmpty().withMessage("Project name is required"),
  body("clientName").notEmpty().withMessage("Client name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  handleInputErrors,
  ProjectController.addProject,
);
router.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid project ID"),
  // validate request body
  body("projectName").notEmpty().withMessage("Project name is required"),
  body("clientName").notEmpty().withMessage("Client name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  handleInputErrors,
  ProjectController.updateProject,
);
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid project ID"),
  handleInputErrors,
  ProjectController.deleteProject,
);

// routes for task
router.post('/:projectId/tasks',
  validateProjectExists,
  body("name").notEmpty().withMessage("Task name is required"),
  body("description").notEmpty().withMessage("Task description is required"),
  handleInputErrors,
  TaskController.addTask)

router.get('/:projectId/tasks',
  validateProjectExists,
  TaskController.getProjectTasks
)

router.get('/:projectId/tasks/:id',
  validateProjectExists,
  TaskController.getTaskById
)

export default router;
