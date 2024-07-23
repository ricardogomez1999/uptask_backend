import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/Token";
import { AuthEmail } from "../emails/AuthEmails";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static creatAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      //prevent duplicates
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("This user already exists");
        return res.status(409).json({ error: error.message });
      }

      //Create a user
      const user = new User(req.body);

      //Hash pasword
      user.password = await hashPassword(password);

      //Generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //send email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Account created! Check your email to confirm your account");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error("Invalid token");
        return res.status(401).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("Account confirmed successfully");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("User not found");
        return res.status(401).json({ error: error.message });
      }

      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });
        const error = new Error(
          "The account has not been confirmed, we have sent a new confirmation email"
        );
        return res.status(401).json({ error: error.message });
      }

      //Verify password
      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("Incorrect password");
        return res.status(401).json({ error: error.message });
      }

      const token = generateJWT({ id: user.id });

      res.send(token);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //User exists
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("This user is not registered");
        return res.status(404).json({ error: error.message });
      }

      if (user.confirmed) {
        const error = new Error("This user is already confirmed");
        return res.status(403).json({ error: error.message });
      }

      //Generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //send email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("A new token has been sent, check your email");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //User exists
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("This user is not registered");
        return res.status(404).json({ error: error.message });
      }

      //Generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      await token.save();

      //send email
      AuthEmail.sendPassowordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send("Check your email for further instructions");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error("Invalid token");
        return res.status(401).json({ error: error.message });
      }

      res.send("Valid token, set your new password");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error("Invalid token");
        return res.status(401).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("Password has been updated successfully");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error("That email is already registered");
      return res.status(409).json({ error: error.message });
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.send("Profile updated successfully");
    } catch (error) {
      res.status(500).send("There was an error");
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("Current password is incorrect");
      return res.status(401).json({ error: error.message });
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      return res.send("Password has been updated successfully");
    } catch (error) {
      res.status(500).send("There was an error");
    }
  };
  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await User.findById(req.user.id);
    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error("Password is incorrect");
      return res.status(401).json({ error: error.message });
    }

    res.send("Correct password");
  };
}
