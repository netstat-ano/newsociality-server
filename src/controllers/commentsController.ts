import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import { NextFunction, Response, Request } from "express";
import Post from "../models/Post";
interface LikeCommentBody extends AuthenticationRequest {
    body: {
        id: string;
        postId: string;
    };
}
const postLikeComment = async (
    req: LikeCommentBody,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;
    const post = await Post.findById(req.body.postId);
    const comment = post?.comments.find(
        (comment) => comment._id === req.body.id
    );
    if (post && comment) {
        if (user?.likedComment.includes(req.body.id)) {
            if (comment.likes) {
                comment.likes -= 1;
            } else {
                comment.likes = 0;
            }
            user.likedComment.splice(user.likedComment.indexOf(req.body.id), 1);
            await user.save();
            await post.save();
            return res.status(200).json({
                ok: true,
                message: "DISLIKED",
                likes: comment.likes,
            });
        } else if (user) {
            if (comment.likes) {
                comment.likes += 1;
            } else {
                comment.likes = 1;
            }
            await post.save();
            user.likedComment.push(req.body.id);
            await user.save();
            return res
                .status(200)
                .json({ message: "LIKED", ok: true, likes: comment.likes });
        }
    }
    return res.status(404).json({ ok: false, message: "Comment not founded" });
};

interface checkLikeCommentStatusBody extends AuthenticationRequest {
    body: {
        id: string;
    };
}

const postCheckLikeCommentStatusById = (
    req: checkLikeCommentStatusBody,
    res: Response,
    next: NextFunction
) => {
    const comment = req.user?.likedComment.find((id) => id === req.body.id);
    if (comment) {
        res.status(200).json({ ok: true, message: "LIKED" });
    }
    return res.status(200).json({ ok: false, message: "NOT LIKED" });
};
export default { postLikeComment, postCheckLikeCommentStatusById };
