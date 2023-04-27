import { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./User";
export interface IComment {
    commentText: string;
    userId: PopulatedDoc<IUser>;
    likes?: number;
    imageUrl?: string;
    _id?: string;
}

const commentSchema = new Schema<IComment>(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        commentText: { type: String, required: true },
        likes: { type: Schema.Types.Number, required: false },
        imageUrl: { type: String, required: false },
        _id: { type: String, required: false },
    },
    { timestamps: true }
);
export default commentSchema;
