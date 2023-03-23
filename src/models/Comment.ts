import { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./User";
export interface IComment {
    commentText: string;
    userId: PopulatedDoc<IUser>;
    likes?: number;
}

const commentSchema = new Schema<IComment>(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        commentText: { type: String, required: true },
        likes: { type: Schema.Types.Number, required: false },
    },
    { timestamps: true }
);
export default commentSchema;
