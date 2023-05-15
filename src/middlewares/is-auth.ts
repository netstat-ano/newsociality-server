import { NextFunction, Request, Response } from "express";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import jws from "jsonwebtoken";

import UserJwtPayload from "../interfaces/UserJwtPayload";
import User from "../models/User";
const isAuth = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.get("Authorization")?.split(" ")[1];
    let decodedToken;
    if (token) {
        try {
            decodedToken = jws.verify(
                token,
                process.env.SECRET_KEY!
            ) as UserJwtPayload;
        } catch (err) {
            if (err) {
                return res
                    .status(422)
                    .json({ message: "Not authenticated.", ok: false });
            }
        }
        if (!decodedToken) {
            return res
                .status(422)
                .json({ ok: false, message: "Not authenticated" });
        }

        const currentUser = await User.findById(decodedToken.userId);
        if (currentUser) {
            req.user = currentUser!;
            req.userId = currentUser._id;
            req.token = decodedToken.token;
            next();
            return;
        }
        return res.status(422).json({ message: "No authorized.", ok: false });
    }
    return res.status(422).json({ message: "Not authenticated.", ok: false });
};
export default isAuth;
