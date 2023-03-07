import { NextFunction, Request, Response } from "express";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import jws from "jsonwebtoken";
import ResponseError from "../interfaces/ResponseError";
import secretKey from "../utils/secret";
import UserJwtPayload from "../interfaces/UserJwtPayload";
import User from "../models/User";
const isAuth = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.get("Authorization")?.split(" ")[1];
    if (token) {
        try {
            var decodedToken = jws.verify(token, secretKey) as UserJwtPayload;
        } catch (err) {
            throw err;
        }
        if (!decodedToken) {
            const error: ResponseError = new Error("Not authenticated");
            error.status = 401;
            throw error;
        }
        const currentUser = await User.findByPk(decodedToken.id);
        req.user = currentUser!;
        req.userId = decodedToken.id;
        req.token = decodedToken.token;
        req.type = decodedToken.type;
        next();
    }
};
export default isAuth;
