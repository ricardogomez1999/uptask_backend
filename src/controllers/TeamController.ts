import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project.id).populate({
      path: "team",
      select: "id name email",
    });

    res.json(project.team);
  };
  static findMemberByEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email }).select("id email name");
      if (!user) {
        const error = new Error("User not found");
        return res.status(404).json({ error: error.message });
      }
      console.log(req);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static addMemberByID = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      const user = await User.findById(id).select("id");
      if (!user) {
        const error = new Error("User not found");
        return res.status(404).json({ error: error.message });
      }

      if (
        req.project.team.some((team) => team.toString() === user.id.toString())
      ) {
        const error = new Error("The user is a current member of the project");
        return res.status(409).json({ error: error.message });
      }
      req.project.team.push(user.id);
      await req.project.save();

      res.json("Member added correctly");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static deleteMemberByID = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!req.project.team.some((team) => team.toString() === userId)) {
        const error = new Error("The user does not exists");
        return res.status(409).json({ error: error.message });
      }

      req.project.team = req.project.team.filter(
        (teamMember) => teamMember.toString() !== userId
      );

      await req.project.save();
      res.json("Member deleted successfully");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
