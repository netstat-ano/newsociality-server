import { Schema, model } from "mongoose";
interface IUser {
    email: string;
    username: string;
    password: string;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});
const User = model<IUser>("User", userSchema);
export default User;
