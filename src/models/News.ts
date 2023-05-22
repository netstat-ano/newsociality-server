import { Schema, model, PopulatedDoc } from "mongoose";
import { IUser } from "./User";
import { IComment } from "./Comment";
import commentSchema from "./Comment";
interface INews {
    userId: PopulatedDoc<IUser>;
    newsDescription: string;
    tags: string[];
    newsUrl: string;
    comments: IComment[];
    likes?: number;
    newsTitle: string;
}

const newsSchema = new Schema<INews>(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        newsDescription: { type: String, required: true },
        newsUrl: { type: String, required: true },
        tags: { type: [String], required: false },
        comments: [commentSchema],
        likes: { type: Number, required: false },
        newsTitle: { type: String, required: true },
    },
    { timestamps: true }
);
const News = model<INews>("News", newsSchema);
export default News;
