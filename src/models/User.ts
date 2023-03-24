import { Schema, model } from "mongoose";
export interface IUser {
    email: string;
    username: string;
    password: string;
    avatarUrl: string;
    likedPost: string[];
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, required: false },
    likedPost: { type: [String], required: false },
});
const User = model<IUser>("User", userSchema);
export default User;
