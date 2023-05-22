import { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./User";
import { IComment } from "./Comment";
import commentSchema from "./Comment";
interface IPost {
    userId: PopulatedDoc<IUser>;
    imgUrl?: string;
    postText?: string;
    tags: string[];
    comments: IComment[];
    likes?: number;
    isNews?: boolean;
    newsDescription: string;
    newsUrl: string;
    newsTitle: string;
}

const postSchema = new Schema<IPost>(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        imgUrl: { type: String, required: false },
        postText: { type: String, required: false },
        tags: { type: [String], required: false },
        comments: [commentSchema],
        likes: { type: Number, required: false },
        isNews: { type: Boolean, required: false },
        newsUrl: { type: String, required: false },
        newsTitle: { type: String, required: false },
        newsDescription: { type: String, required: false },
    },
    { timestamps: true }
);
const Post = model<IPost>("Post", postSchema);
export default Post;
