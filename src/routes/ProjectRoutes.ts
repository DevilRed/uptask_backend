import { Router } from "express";
import { body, param } from "express-validator";
import { NoteController } from "../controllers/NoteController";
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { TeamMemberController } from "../controllers/TeamMemberController";
import { authenticate } from "../middleware/auth";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.use(authenticate)// set middleware globally for this module
// route params
// params for project
router.param('projectId', projectExists)
// params for task
router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

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


// routes for tasks
router.post('/:projectId/tasks',
  hasAuthorization,
  body("name").notEmpty().withMessage("Task name is required"),
  body("description").notEmpty().withMessage("Task description is required"),
  handleInputErrors,
  TaskController.addTask)

router.get('/:projectId/tasks',
  TaskController.getProjectTasks
)

router.get('/:projectId/tasks/:taskId',
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  handleInputErrors,
  TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  body("name").notEmpty().withMessage("Task name is required"),
  body("description").notEmpty().withMessage("Task description is required"),
  handleInputErrors,
  TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
  hasAuthorization,
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

router.post('/:projectId/team/find',
  body("email")
    .isEmail().toLowerCase().withMessage("Invalid email"),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
  /* body("id")
    .isMongoId().withMessage("Invalid project ID"),
  handleInputErrors, */
  TeamMemberController.getProjectTeam
)

router.post('/:projectId/team',
  body("id")
    .isMongoId().withMessage("Invalid user ID"),
  handleInputErrors,
  TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
  param("userId")
    .isMongoId().withMessage("Invalid user ID"),
  handleInputErrors,
  TeamMemberController.removeMemberById
)

// note's routes
router.post('/:projectId/tasks/:taskId/notes',
  body('content')
    .notEmpty().withMessage('Content is required'),
  handleInputErrors,
  NoteController.createNote
)
router.get('/:projectId/tasks/:taskId/notes',
  NoteController.getTaskNotes
)

export default router;
