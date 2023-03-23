import { Request } from "express";
import { ObjectId } from "mongodb";
import { PopulatedDoc } from "mongoose";
import { IUser } from "../models/User";
interface AuthenticationRequest extends Request {
    userId?: ObjectId;
    token?: string;
    user?: PopulatedDoc<IUser>;
}
export default AuthenticationRequest;
