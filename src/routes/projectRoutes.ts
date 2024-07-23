import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaksController } from "../controllers/TasksController";
import { projectExists } from "../middleware/project";
import {
  tasksBelongsToProject,
  taskExists,
  hasAuthorization,
} from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

router.use(authenticate);

router.post(
  "/",

  body("projectName").notEmpty().withMessage("Project name is mandatory"),
  body("clientName").notEmpty().withMessage("Client name is mandatory"),
  body("description").notEmpty().withMessage("Description is mandatory"),
  handleInputErrors,
  ProjectController.createProject
);
router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  ProjectController.getProjectByID
);

/** Routes for Task */
router.param("projectID", projectExists);

router.put(
  "/:projectID",
  param("projectID").isMongoId().withMessage("Not valid ID"),
  body("projectName").notEmpty().withMessage("Project name is mandatory"),
  body("clientName").notEmpty().withMessage("Client name is mandatory"),
  body("description").notEmpty().withMessage("Description is mandatory"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
);

router.delete(
  "/:projectID",
  param("projectID").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
);

router.post(
  "/:projectID/tasks",
  hasAuthorization,
  body("name").notEmpty().withMessage("Task name is mandatory"),
  body("description").notEmpty().withMessage("Description task is mandatory"),
  handleInputErrors,
  TaksController.createTask
);

router.get("/:projectID/tasks", TaksController.getProjectTasks);

/**TASK ID */

router.param("taskId", taskExists);
router.param("taskId", tasksBelongsToProject);
router.get(
  "/:projectID/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  TaksController.getTaskByID
);

router.put(
  "/:projectID/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Not valid ID"),
  body("name").notEmpty().withMessage("Task name is mandatory"),
  body("description").notEmpty().withMessage("Description task is mandatory"),
  handleInputErrors,
  TaksController.updateTask
);

router.delete(
  "/:projectID/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Not valid ID"),
  handleInputErrors,
  TaksController.deleteTask
);

router.post(
  "/:projectID/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("Not valid ID"),
  body("status").notEmpty().withMessage("Status is mandatory"),
  handleInputErrors,
  TaksController.updateStatus
);

/** Routes for Teams  */

router.get("/:projectID/team", TeamMemberController.getProjectTeam);

router.post(
  "/:projectID/team/find",
  body("email").isEmail().toLowerCase().withMessage("Not valid email"),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
);

router.post(
  "/:projectID/team",
  body("id").isMongoId().withMessage("No valid ID"),
  handleInputErrors,
  TeamMemberController.addMemberByID
);

router.delete(
  "/:projectID/team/:userId",
  param("userId").isMongoId().withMessage("No valid ID"),
  handleInputErrors,
  TeamMemberController.deleteMemberByID
);

/** Routes for Notes  */
router.post(
  "/:projectID/tasks/:taskId/notes",
  body("content")
    .notEmpty()
    .withMessage("The content of the note is mandatory"),
  handleInputErrors,
  NoteController.createNote
);

router.get("/:projectID/tasks/:taskId/notes", NoteController.getTaskNotes);

router.delete(
  "/:projectID/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("Invalid ID"),
  handleInputErrors,
  NoteController.deleteNoteByID
);

export default router;
