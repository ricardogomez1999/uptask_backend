import type { Request, Response } from "express";

import Task from "../models/Task";

export class TaksController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task.id);
      console.log(req);
      await Promise.allSettled([task.save(), req.project.save()]);
      res.send("Task created successfully");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static getTaskByID = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({
          path: "completedBy.user",
          select: "id name email",
        })
        .populate({
          path: "notes",
          populate: { path: "createdBy", select: "id name email" },
        });

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      await req.task.save();
      res.json("Task updated successfully");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.params.taskId
      );

      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.json("Task deleted successfully");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      req.task.status = status;
      const data = {
        user: req.user.id,
        status,
      };
      req.task.completedBy.push(data);
      await req.task.save();
      res.send("Task status updated");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };
}
