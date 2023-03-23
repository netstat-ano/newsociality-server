import { Request, Response, NextFunction } from "express";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import Post from "../models/Post";
import { validationResult } from "express-validator";
import formatValidationErrors from "../utils/formatValidationErrors";
import User, { IUser } from "../models/User";
import { IComment } from "../models/Comment";
import { ObjectId } from "mongoose";
interface PostCreationBody extends AuthenticationRequest {
    body: {
        postText: string;
        userId: string;
        tags: string;
    };
    file?: any;
}

const postCreatePost = async (
    req: PostCreationBody,
    res: Response,
    next: NextFunction
) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(422).json({
            message: formatValidationErrors(result.array()),
            ok: false,
        });
    }
    const tags = JSON.parse(req.body.tags);
    if (!req.file?.filename) {
        var post = new Post({
            userId: req.body.userId,
            tags: tags,
            imgUrl: undefined,
            postText: req.body.postText,
        });
    } else {
        var post = new Post({
            userId: req.body.userId,
            tags: tags,
            imgUrl: `/public/images/${req.file?.filename}`,
            postText: req.body.postText,
        });
    }
    await post.save();
    return res
        .status(201)
        .json({ ok: true, message: "Post created successfully." });
};

interface PostFetchingBody extends Express.Request {
    body: {
        tag: string;
    };
}

const postFetchPostsByTag = async (
    req: PostFetchingBody,
    res: Response,
    next: NextFunction
) => {
    const posts = await Post.find({ tags: `#${req.body.tag}` })
        .select("userId postText tags createdAt updatedAt imgUrl")
        .populate<{
            userId: IUser;
        }>("userId", "username avatarUrl")
        // .populate<{ userId: IUser }>({
        //     path: "comments",
        //     populate: {
        //         path: "userId",
        //         select: "username avatarUrl",
        //     },
        // })
        .sort({ createdAt: "descending" });
    if (posts.length > 0) {
        return res.status(200).json({
            posts,
            ok: true,
            message: "Posts founded successfully.",
        });
    } else {
        return res.status(404).json({
            posts: [],
            ok: false,
            message: "Posts not founded.",
        });
    }
};
interface CommentFetchingBody {
    body: {
        id: string;
    };
}
const postFetchCommentsByPostId = async (
    req: CommentFetchingBody,
    res: Response,
    next: NextFunction
) => {
    const post = await Post.findById(req.body.id)
        .populate<{
            userId: IUser;
        }>("userId", "username avatarUrl")
        .populate<{ userId: IUser }>({
            path: "comments",
            populate: {
                path: "userId",
                select: "username avatarUrl",
            },
        })
        .sort({ createdAt: "descending" });
    if (post) {
        return res.status(200).json({
            comments: post.comments,
            ok: true,
            message: "Posts founded successfully.",
        });
    } else {
        return res.status(404).json({
            comments: [],
            ok: false,
            message: "Post not founded.",
        });
    }
};

interface CommentCreationBody extends AuthenticationRequest {
    body: {
        userId: string;
        commentText: string;
        postId: string;
    };
}

const postCreateComment = async (
    req: CommentCreationBody,
    res: Response,
    next: NextFunction
) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(422).json({
            message: formatValidationErrors(result.array()),
            ok: false,
            addedComment: {},
        });
    }
    const post = await Post.findById(req.body.postId);
    if (req.user) {
        post?.comments.push({
            userId: req.user,
            commentText: req.body.commentText,
        });

        await post?.save();

        return res.status(201).json({ ok: true, message: "Comment added." });
    }
    return res.status(404).json({ ok: false, message: "Post not found." });
};
export default {
    postCreatePost,
    postFetchPostsByTag,
    postFetchCommentsByPostId,
    postCreateComment,
};
