import { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./User";
import { IComment } from "./Comment";
import commentSchema from "./Comment";
interface IPost {
    userId: PopulatedDoc<IUser>;
    imgUrl: string;
    postText: string;
    tags: string[];
    comments: IComment[];
    likes?: number;
}

const postSchema = new Schema<IPost>(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        imgUrl: { type: String, required: false },
        postText: { type: String, required: true },
        tags: { type: [String], required: false },
        comments: [commentSchema],
        likes: { type: Number, required: false },
    },
    { timestamps: true }
);
const Post = model<IPost>("Post", postSchema);
export default Post;
