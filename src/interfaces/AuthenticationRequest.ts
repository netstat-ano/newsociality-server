import { Request } from "express";
import { ObjectId } from "mongodb";
import { PopulatedDoc, Document, Types } from "mongoose";
import { IUser } from "../models/User";
interface AuthenticationRequest extends Request {
    userId?: ObjectId;
    token?: string;
    user?: Document<unknown, {}, IUser> &
        Omit<
            IUser & {
                _id: Types.ObjectId;
            },
            never
        >;
}
export default AuthenticationRequest;
