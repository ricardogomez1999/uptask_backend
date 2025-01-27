import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

export async function projectExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectID } = req.params;
    const project = await Project.findById(projectID);

    if (!project) {
      const error = new Error("Project does not exist");
      return res.status(404).json({ error: error.message });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: "There was an error" });
  }
}
