import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import formatValidationErrors from "../utils/formatValidationErrors";
import path from "path";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import mongoose from "mongoose";
interface CreateUserRequst extends Request {
    body: {
        email: string;
        username: string;
        password: string;
    };
}
const postCreateUser = async (
    req: CreateUserRequst,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const messages = formatValidationErrors(errors.array());

        return res.status(403).json({
            ok: false,
            message: messages,
            userId: undefined,
            token: undefined,
            avatarUrl: undefined,
            username: undefined,
        });
    }
    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(403).json({
            ok: false,
            message: "E-mail is already registered.",
            userId: undefined,
            token: undefined,
            avatarUrl: undefined,
            username: undefined,
        });
    }
    const isUsernameExist = await User.findOne({ username: req.body.username });
    if (isUsernameExist) {
        res.status(403).json({
            ok: false,
            message: "Username is already registered.",
            userId: undefined,
            token: undefined,
            avatarUrl: undefined,
            username: undefined,
        });
    }
    const hashedPassword = await bcryptjs.hash(req.body.password, 12);
    const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
        avatarUrl: path.join("public", "images", "default-avatar.png"),
    });
    await user.save();
    let expiresTime = "1h";
    var token = jsonwebtoken.sign(
        {
            email: user.email,
            userId: user._id,
            username: user.username,
        },
        process.env.SECRET_KEY!,
        { expiresIn: expiresTime }
    );

    return res.status(200).json({
        token: token,
        userId: user._id,
        ok: true,
        message: "User succesfully created and logged in.",
        avatarUrl: user.avatarUrl,
        username: user.username,
    });
};

interface LoginUserBody extends Request {
    body: {
        email: string;
        password: string;
        expire?: number;
    };
}

const postLoginUser = async (
    req: LoginUserBody,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const messages = formatValidationErrors(errors.array());

        return res.status(403).json({
            ok: false,
            message: messages,
            userId: undefined,
            token: undefined,
            username: undefined,
        });
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        const result = await bcryptjs.compare(req.body.password, user.password);
        if (result) {
            let expiresTime = "1h";
            if (req.body.expire) {
                expiresTime = `${req.body.expire}h`;
            }
            var token = jsonwebtoken.sign(
                {
                    email: user.email,
                    userId: user._id,
                    username: user.username,
                },
                process.env.SECRET_KEY!,
                { expiresIn: expiresTime }
            );

            return res.status(200).json({
                token: token,
                userId: user._id,
                avatarUrl: user.avatarUrl,
                username: user.username,
                ok: true,
                message: "User succesfully logged in.",
            });
        }
        return res.status(403).json({
            ok: false,
            token: undefined,
            userId: undefined,
            avatarUrl: undefined,
            username: undefined,
            message: "Wrong e-mail or password.",
        });
    }
    return res.status(403).json({
        ok: false,
        token: undefined,
        userId: undefined,
        username: undefined,
        message: "Wrong e-mail or password.",
        avatarUrl: undefined,
    });
};

interface ChangeAvatarBody extends AuthenticationRequest {
    body: {
        id: string;
    };
    file?: any;
}

const postChangeAvatar = async (
    req: ChangeAvatarBody,
    res: Response,
    next: NextFunction
) => {
    if (req.user && req.file.path) {
        req.user.avatarUrl = req.file.path;
        await req.user.save();
        return res.status(200).json({
            message: "Avatar changed.",
            ok: true,
            path: req.file.path,
        });
    }

    return res.status(200).json({ message: "Avatar not changed.", ok: false });
};

interface FetchUserByIdBody {
    body: {
        userId: string;
    };
}

const postFetchUserById = async (
    req: FetchUserByIdBody,
    res: Response,
    next: NextFunction
) => {
    if (mongoose.Types.ObjectId.isValid(req.body.userId)) {
        const user = await User.findById(req.body.userId).select(
            "username password avatarUrl"
        );
        return res.status(200).json({
            message: "User founded",
            ok: true,
            user,
        });
    } else {
        return res.status(404).json({ message: "User not founded", ok: false });
    }
};
export default {
    postCreateUser,
    postLoginUser,
    postChangeAvatar,
    postFetchUserById,
};
