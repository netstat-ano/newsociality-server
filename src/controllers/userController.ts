import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import formatValidationErrors from "../utils/formatValidationErrors";
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
        });
    }
    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(403).json({
            ok: false,
            message: "E-mail is already registered.",
            userId: undefined,
            token: undefined,
        });
    }
    const isUsernameExist = await User.findOne({ username: req.body.username });
    if (isUsernameExist) {
        res.status(403).json({
            ok: false,
            message: "Username is already registered.",
            userId: undefined,
            token: undefined,
        });
    }
    const hashedPassword = await bcryptjs.hash(req.body.password, 12);
    const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
    });
    await user.save();
    let expiresTime = "1h";
    var token = jsonwebtoken.sign(
        {
            email: user.email,
            id: user._id,
        },
        process.env.SECRET_KEY!,
        { expiresIn: expiresTime }
    );

    return res.status(200).json({
        token: token,
        userId: user._id,
        ok: true,
        message: "User succesfully created and logged in.",
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
                    id: user._id,
                },
                process.env.SECRET_KEY!,
                { expiresIn: expiresTime }
            );

            return res.status(200).json({
                token: token,
                userId: user._id,
                ok: true,
                message: "User succesfully logged in.",
            });
        }
        return res.status(403).json({
            ok: false,
            token: undefined,
            userId: undefined,
            message: "User can't log in.",
        });
    }
    return res.status(403).json({
        ok: false,
        token: undefined,
        userId: undefined,
        message: "User not founded.",
    });
};
export default { postCreateUser, postLoginUser };
