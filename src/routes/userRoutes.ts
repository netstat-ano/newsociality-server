import express from "express";
import userController from "../controllers/userController";
import { body } from "express-validator";
import isAuth from "../middlewares/is-auth";
const userRoutes = express.Router();

userRoutes.post(
    "/create-user",
    [
        body("email").isEmail().withMessage("Invalid e-mail."),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must have min 8 characters."),
        body("username")
            .isLength({ min: 4 })
            .withMessage("Username must have min 4 characters."),
    ],
    userController.postCreateUser
);

userRoutes.post(
    "/login-user",
    [
        body("email").isEmail().withMessage("Invalid e-mail."),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must contain min 8 characters."),
    ],
    userController.postLoginUser
);

userRoutes.post("/change-avatar", isAuth, userController.postChangeAvatar);
export default userRoutes;
