import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("Name cannot be empty"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("The password requires minimum 8 characters"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The passwords do not match");
    }
    return true;
  }),
  body("email").isEmail().withMessage("Not valid email"),
  handleInputErrors,
  AuthController.creatAccount
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("Token cannot be empty"),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Not valid email"),
  body("password").notEmpty().withMessage("The password is required"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/request-code",
  body("email").isEmail().withMessage("Not valid email"),
  handleInputErrors,
  AuthController.requestConfirmationCode
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Not valid email"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("Token cannot be empty"),
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("No valid token"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("The password requires minimum 8 characters"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The passwords do not match");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
);

router.get("/user", authenticate, AuthController.user);

/**Profile */
router.put(
  "/profile",
  authenticate,
  body("name").notEmpty().withMessage("Name cannot be empty"),
  body("email").isEmail().withMessage("Not valid email"),
  handleInputErrors,
  AuthController.updateProfile
);

router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .notEmpty()
    .withMessage("Current password cannot be empty"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("The password requires minimum 8 characters"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The passwords do not match");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);

router.post(
  "/check-password",
  authenticate,
  body("password").notEmpty().withMessage("Password cannot be empty"),
  handleInputErrors,
  AuthController.checkPassword
);

export default router;
