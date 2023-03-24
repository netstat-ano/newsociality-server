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
        .select("userId postText tags createdAt updatedAt imgUrl likes")
        .populate<{
            userId: IUser;
        }>("userId", "username avatarUrl")
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
    file?: any;
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
        if (req.file) {
            var index = post!.comments.push({
                userId: req.user._id,
                commentText: req.body.commentText,
                imageUrl: `/public/images/${req.file.filename}`,
            });
        } else {
            var index = post!.comments.push({
                userId: req.user._id,
                commentText: req.body.commentText,
            });
        }
        await post?.save();

        return res.status(201).json({
            ok: true,
            message: "Comment added.",
            addedComment: post!.comments[index - 1],
        });
    }
    return res
        .status(404)
        .json({ ok: false, message: "Post not found.", addedComment: {} });
};

interface LikePostBody extends AuthenticationRequest {
    body: {
        id: string;
    };
}

const postLikePost = async (
    req: LikePostBody,
    res: Response,
    next: NextFunction
) => {
    const post = await Post.findById(req.body.id);
    const user = req.user;
    if (post) {
        if (user?.likedPost.includes(req.body.id)) {
            if (post.likes) {
                post.likes -= 1;
            } else {
                post.likes = 0;
            }
            user.likedPost.splice(user.likedPost.indexOf(req.body.id), 1);
            await user.save();
            await post.save();
            return res
                .status(200)
                .json({ ok: true, message: "DISLIKED", likes: post.likes });
        } else if (user) {
            if (post.likes) {
                post.likes += 0;
            } else {
                post.likes = 1;
            }
            await post.save();
            user.likedPost.push(req.body.id);
            await user.save();
            return res
                .status(200)
                .json({ message: "LIKED", ok: true, likes: post.likes });
        }
    }
    return res.status(404).json({ ok: false, message: "Post not founded" });
};

export default {
    postCreatePost,
    postFetchPostsByTag,
    postFetchCommentsByPostId,
    postCreateComment,
    postLikePost,
};
