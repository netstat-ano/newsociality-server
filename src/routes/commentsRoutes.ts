import express from "express";
import isAuth from "../middlewares/is-auth";
import commentsController from "../controllers/commentsController";
const commentsRoutes = express.Router();

commentsRoutes.post(
    "/like-comment",
    isAuth,
    commentsController.postLikeComment
);

commentsRoutes.post(
    "/check-like-status",
    isAuth,
    commentsController.postCheckLikeCommentStatusById
);
export default commentsRoutes;
