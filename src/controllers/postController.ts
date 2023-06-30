import { Request, Response, NextFunction } from "express";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import Post from "../models/Post";
import { validationResult } from "express-validator";
import formatValidationErrors from "../utils/formatValidationErrors";
import User, { IUser } from "../models/User";
import mongoose, { mongo } from "mongoose";
import checkIfLastPage from "../utils/checkIfLastPage";
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
            isNews: false,
        });
    } else {
        var post = new Post({
            userId: req.body.userId,
            tags: tags,
            imgUrl: `/public/images/${req.file?.filename}`,
            postText: req.body.postText,
            isNews: false,
        });
    }
    await post.save();
    return res.status(201).json({
        ok: true,
        message: "Post created successfully.",
        postId: post._id,
    });
};

interface PostFetchingBody extends Express.Request {
    body: {
        tag: string | string[];
        page: string;
        type: string;
    };
}

const postFetchPostsByTag = async (
    req: PostFetchingBody,
    res: Response,
    next: NextFunction
) => {
    const page = Number(req.body.page);

    if (req.body.type === "news") {
        if (typeof req.body.tag === "object") {
            const tags = req.body.tag.map((value) => `#${value}`);
            var postsCount = await Post.countDocuments({ tags: { $in: tags } });
            var posts = await Post.find({
                tags: { $in: tags },
                isNews: true,
            })
                .select(
                    "userId newsUrl tags createdAt updatedAt newsDescription newsUrl likes"
                )
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl")
                .skip(page * 40)
                .limit(40)
                .sort({ createdAt: "descending" });
        } else {
            var postsCount = await Post.countDocuments({
                tags: `#${req.body.tag}`,
                isNews: true,
            });
            var posts = await Post.find({
                tags: `#${req.body.tag}`,
                isNews: true,
            })
                .select(
                    "userId newsUrl tags createdAt updatedAt newsDescription newsUrl likes"
                )
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl")
                .skip(page * 40)
                .limit(40)
                .sort({ createdAt: "descending" });
        }
    } else if (req.body.type === "posts") {
        if (typeof req.body.tag === "object") {
            const tags = req.body.tag.map((value) => `#${value}`);
            var postsCount = await Post.countDocuments({
                tags: { $in: tags },
                $or: [{ isNews: undefined }, { isNews: false }],
            });
            var posts = await Post.find({
                tags: { $in: tags },
                $or: [{ isNews: undefined }, { isNews: false }],
            })
                .select("userId postText tags createdAt updatedAt imgUrl likes")
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl")
                .skip(page * 40)
                .limit(40)
                .sort({ createdAt: "descending" });
        } else {
            var postsCount = await Post.countDocuments({
                tags: `#${req.body.tag}`,
                $or: [{ isNews: undefined }, { isNews: false }],
            });
            var posts = await Post.find({
                tags: `#${req.body.tag}`,
                $or: [{ isNews: undefined }, { isNews: false }],
            })
                .select("userId postText tags createdAt updatedAt imgUrl likes")
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl")
                .skip(page * 40)
                .limit(40)
                .sort({ createdAt: "descending" });
        }
    } else {
        return res.status(400).json({
            ok: false,
            message: "Bad request",
            posts: [],
            lastPage: true,
        });
    }
    if (posts.length > 0) {
        return res.status(200).json({
            posts,
            ok: true,
            message: "Posts founded successfully.",
            lastPage: checkIfLastPage(page, postsCount, 40),
        });
    } else {
        return res.status(200).json({
            posts: [],
            ok: true,
            message: "Posts not founded.",
            lastPage: true,
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
                post.likes += 1;
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

interface CheckLikeStatusBody extends AuthenticationRequest {
    body: {
        id: string;
    };
}
const postCheckLikeStatusById = (
    req: CheckLikeStatusBody,
    res: Response,
    next: NextFunction
) => {
    if (req.user) {
        const findedPid = req.user.likedPost.find((pid) => pid === req.body.id);
        if (findedPid) {
            return res.status(200).json({ ok: true, message: "LIKED" });
        } else {
            return res.status(200).json({ ok: false, message: "NOT LIKED" });
        }
    }
    return res.status(200).json({ ok: false, message: "NOT LIKED" });
};

interface FetchPopularPostsBody extends AuthenticationRequest {
    body: {
        page?: string;
        popularTime: Date;
        type: string;
    };
}

const postFetchPopularPosts = async (
    req: FetchPopularPostsBody,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.body.page);
        const postsCount = await Post.countDocuments({
            createdAt: { $gte: req.body.popularTime },
        });
        if (req.body.type === "post") {
            var posts = await Post.find({
                createdAt: { $gte: req.body.popularTime },
                isNews: false,
            })
                .select(
                    "userId postText tags createdAt updatedAt imgUrl likes newsDescription newsUrl newsTitle"
                )
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl")
                .skip(page * 40)
                .limit(40)
                .sort({ likes: "descending" });
        } else {
            var posts = await Post.find({
                createdAt: { $gte: req.body.popularTime },
                isNews: true,
            })
                .select(
                    "userId postText tags createdAt updatedAt imgUrl likes newsDescription newsUrl newsTitle"
                )
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl")
                .skip(page * 40)
                .limit(40)
                .sort({ likes: "descending" });
        }
        if (posts.length > 0) {
            return res.status(200).json({
                posts,
                ok: true,
                message: "Posts founded successfully.",
                lastPage: checkIfLastPage(page, postsCount, 40),
            });
        } else {
            return res.status(404).json({
                posts: [],
                ok: false,
                message: "Posts not founded.",
                lastPage: true,
            });
        }
    } catch (err: any) {
        return res.status(400).json({
            ok: false,
            message: err.message,
            posts: [],
            lastPage: true,
        });
    }
};

interface FetchPostByIdBody extends Request {
    body: {
        id: string;
        type: string;
    };
}

const postFetchPostById = async (
    req: FetchPostByIdBody,
    res: Response,
    next: NextFunction
) => {
    if (mongoose.Types.ObjectId.isValid(req.body.id)) {
        if (req.body.type === "post") {
            var post = await Post.findOne({ _id: req.body.id, isNews: false })
                .select("userId postText tags createdAt updatedAt imgUrl likes")
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl");
        } else {
            var post = await Post.findOne({ _id: req.body.id })
                .select(
                    "userId newsUrl tags createdAt updatedAt newsDescription newsTitle likes"
                )
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl");
        }
        if (post) {
            return res
                .status(200)
                .json({ ok: true, message: "Post founded", post: post });
        } else {
            return res
                .status(200)
                .json({ ok: false, message: "Post not founded", post: {} });
        }
    } else {
        return res
            .status(400)
            .json({ ok: false, message: "Bad format id", post: {} });
    }
};

interface FetchPostsByUserId {
    body: {
        id: string;
        page: string;
        type: string;
    };
}

const postFetchPostsByUserId = async (
    req: FetchPostsByUserId,
    res: Response,
    next: NextFunction
) => {
    if (!req.body.page) {
        var page = 0;
    } else {
        var page = Number(req.body.page);
    }
    if (mongoose.Types.ObjectId.isValid(req.body.id)) {
        if (req.body.type === "news") {
            var postsCount = await Post.countDocuments({
                userId: req.body.id,
                isNews: true,
            });
            var posts = await Post.find({ userId: req.body.id, isNews: true })
                .select(
                    "userId newsUrl tags createdAt updatedAt newsDescription newsTitle likes isNews"
                )
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl")
                .skip(page * 40)
                .limit(40)
                .sort({ createdAt: "descending" });
        } else {
            var postsCount = await Post.countDocuments({
                userId: req.body.id,
                $or: [{ isNews: false }, { isNews: undefined }],
            });
            var posts = await Post.find({
                userId: req.body.id,
                $or: [{ isNews: false }, { isNews: undefined }],
            })
                .select("userId postText tags createdAt updatedAt imgUrl likes")
                .populate<{
                    userId: IUser;
                }>("userId", "username avatarUrl")
                .skip(page * 40)
                .limit(40)
                .sort({ createdAt: "descending" });
        }
        return res.status(200).json({
            message: "Post founded",
            ok: true,
            posts,
            lastPage: checkIfLastPage(page, postsCount, 40),
        });
    } else {
        return res.status(400).json({
            message: "Bad format of id",
            ok: false,
            posts: [],
            lastPage: true,
        });
    }
};

const postFetchLikedPostsByUserId = async (
    req: FetchPostsByUserId,
    res: Response,
    next: NextFunction
) => {
    const loopThroughLikedPosts = async (likedPosts: any[]) => {
        return new Promise(async (resolve) => {
            const array: any[] = [];
            for (const id of likedPosts) {
                const post = await Post.findById(id)
                    .select(
                        "userId postText tags createdAt updatedAt imgUrl likes isNews newsUrl newsDescription newsTitle"
                    )
                    .populate<{
                        userId: IUser;
                    }>("userId", "username avatarUrl");
                if (post) {
                    array.push(post);
                }
            }
            resolve(array);
        });
    };
    let page = 0;
    if (req.body.page) {
        page = Number(req.body.page);
    }
    if (mongoose.Types.ObjectId.isValid(req.body.id)) {
        const user = await User.findById(req.body.id);
        const likedPosts = user?.likedPost.slice(page * 40, page * 40 + 40);
        if (likedPosts) {
            const arrayOfLikedPosts = await loopThroughLikedPosts(likedPosts);
            return res.status(200).json({
                ok: true,
                message: "Posts founded",
                posts: arrayOfLikedPosts,
                lastPage: checkIfLastPage(page, likedPosts.length, 40),
            });
        }
        return res.status(400).json({
            ok: false,
            message: "Something went wrong",
            posts: [],
            lastPage: true,
        });
    } else {
        return res.status(400).json({
            ok: false,
            message: "Invalid format of user id",
            posts: [],
            lastPage: true,
        });
    }
};
interface CreateNewsRequest extends AuthenticationRequest {
    body: {
        newsDescription: string;
        newsUrl: string;
        tags: string;
        newsTitle: string;
    };
}
const postCreateNews = async (
    req: CreateNewsRequest,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = formatValidationErrors(errors.array());
        return res
            .status(422)
            .json({ ok: false, message: formattedErrors, newsId: "" });
    }
    const news = new Post({
        userId: req.user?._id,
        newsDescription: req.body.newsDescription,
        newsUrl: req.body.newsUrl,
        tags: req.body.tags,
        newsTitle: req.body.newsTitle,
        isNews: true,
    });
    try {
        await news.save();
        return res
            .status(200)
            .json({ ok: true, message: "News created.", newsId: news._id });
    } catch (err: any) {
        return res
            .status(400)
            .json({ ok: false, message: err.message, newsId: "" });
    }
};
interface FollowTagBody extends AuthenticationRequest {
    body: {
        tag: string;
    };
}
const postFollowTag = async (
    req: FollowTagBody,
    res: Response,
    next: NextFunction
) => {
    if (req.user) {
        if (req.user.followedTags.indexOf(req.body.tag) === -1) {
            req.user.followedTags.push(req.body.tag);
            await req.user.save();
            return res
                .status(200)
                .json({ ok: true, message: `Tag #${req.body.tag} followed` });
        } else {
            req.user.followedTags = req.user.followedTags.filter(
                (tag) => tag === req.query.tag
            );
            await req.user.save();
            return res
                .status(200)
                .json({ ok: true, message: `Tag #${req.body.tag} unfollowed` });
        }
    } else {
        return res
            .status(422)
            .json({ ok: false, message: "Not authenticated" });
    }
};
interface DeletePostBody {
    body: {
        id: string;
    };
}
const postDeletePost = async (
    req: DeletePostBody,
    res: Response,
    next: NextFunction
) => {
    try {
        const post = Post.findById(req.body.id);
        await post.deleteOne();
        return res.status(200).json({ ok: true, message: "Post deleted" });
    } catch (err) {
        res.status(400).json({ ok: false, message: "error" });
    }
};
export default {
    postCreatePost,
    postFetchPostsByTag,
    postFetchCommentsByPostId,
    postCreateComment,
    postLikePost,
    postCheckLikeStatusById,
    postFetchPopularPosts,
    postFetchPostById,
    postFetchPostsByUserId,
    postFetchLikedPostsByUserId,
    postCreateNews,
    postFollowTag,
    postDeletePost,
};
