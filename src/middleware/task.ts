import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

export async function taskExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      const error = new Error("task does not exist");
      return res.status(404).json({ error: error.message });
    }

    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ error: "There was an error" });
  }
}

export function tasksBelongsToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.task.project.toString() !== req.project.id.toString()) {
      const error = new Error("Invalid action");
      return res.status(404).json({ error: error.message });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "There was an error" });
  }
}

export function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.user.id.toString() !== req.project.manager.toString()) {
      const error = new Error("Invalid action");
      return res.status(404).json({ error: error.message });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "There was an error" });
  }
}
