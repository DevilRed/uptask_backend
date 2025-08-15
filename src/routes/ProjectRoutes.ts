import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { taskExists } from "../middleware/task";

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
router.param('projectId', projectExists)

router.post('/:projectId/tasks',
  body("name").notEmpty().withMessage("Task name is required"),
  body("description").notEmpty().withMessage("Task description is required"),
  handleInputErrors,
  TaskController.addTask)

router.get('/:projectId/tasks',
  TaskController.getProjectTasks
)
router.param('taskId', taskExists)
router.get('/:projectId/tasks/:taskId',
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  handleInputErrors,
  TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  body("name").notEmpty().withMessage("Task name is required"),
  body("description").notEmpty().withMessage("Task description is required"),
  handleInputErrors,
  TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  handleInputErrors,
  TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  body("status").notEmpty().withMessage("Status is required"),
  handleInputErrors,
  TaskController.updateStatus
)

export default router;
