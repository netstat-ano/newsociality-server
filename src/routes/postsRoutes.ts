import express from "express";
import isAuth from "../middlewares/is-auth";
import postController from "../controllers/postController";
import { body } from "express-validator";
const postRoutes = express.Router();

postRoutes.post(
    "/create-post",
    body("postText")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Post must contain min 8 characters."),
    isAuth,
    postController.postCreatePost
);
postRoutes.post(
    "/create-comment",
    body("commentText")
        .trim()
        .isLength({ min: 4 })
        .withMessage("Comment must contain min 4 characters."),
    isAuth,
    postController.postCreateComment
);
postRoutes.post(
    "/fetch-comments-by-post-id",
    postController.postFetchCommentsByPostId
);
postRoutes.post("/fetch-posts-by-tag", postController.postFetchPostsByTag);
postRoutes.post("/like-post", isAuth, postController.postLikePost);
postRoutes.post(
    "/check-like-status-by-id",
    isAuth,
    postController.postCheckLikeStatusById
);
postRoutes.post("/fetch-popular-posts", postController.postFetchPopularPosts);
postRoutes.post("/fetch-post-by-id", postController.postFetchPostById);
postRoutes.post(
    "/fetch-posts-by-user-id",
    postController.postFetchPostsByUserId
);
postRoutes.post(
    "/fetch-liked-posts-by-user-id",
    postController.postFetchLikedPostsByUserId
);
export default postRoutes;
