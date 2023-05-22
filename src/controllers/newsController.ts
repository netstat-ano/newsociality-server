import { NextFunction, Response, Request } from "express";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import News from "../models/News";
import { validationResult } from "express-validator";
import formatValidationErrors from "../utils/formatValidationErrors";
import checkIfLastPage from "../utils/checkIfLastPage";
import { IUser } from "../models/User";
interface CreateNewsRequest extends AuthenticationRequest {
    body: {
        newsDescription: string;
        newsUrl: string;
        newsTags: string;
        newsTitle: string;
    };
}
const postCreateNews = async (
    req: CreateNewsRequest,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = formatValidationErrors(errors.array());
        return res
            .status(422)
            .json({ ok: false, message: formattedErrors, newsId: "" });
    }
    const news = new News({
        userId: req.user?._id,
        newsDescription: req.body.newsDescription,
        newsUrl: req.body.newsUrl,
        tags: req.body.newsTags,
        newsTitle: req.body.newsTitle,
    });
    try {
        await news.save();
        console.log(news._id);
        return res
            .status(200)
            .json({ ok: true, message: "News created.", newsId: news._id });
    } catch (err: any) {
        return res
            .status(400)
            .json({ ok: false, message: err.message, newsId: "" });
    }
};
interface FetchPopularNewsBody extends Request {
    body: {
        page?: string;
        popularTime: Date;
    };
}
const postFetchPopularNews = async (
    req: FetchPopularNewsBody,
    res: Response,
    next: NextFunction
) => {
    const page = Number(req.body.page);
    const newsCount = await News.countDocuments({
        createdAt: { $gte: req.body.popularTime },
    });
    const news = await News.find({
        createdAt: { $gte: req.body.popularTime },
    })
        .select("userId newsDescription tags createdAt updatedAt newsUrl likes")
        .populate<{
            userId: IUser;
        }>("userId", "username avatarUrl")
        .skip(page * 40)
        .limit(40)
        .sort({ likes: "descending" });
    if (news.length > 0) {
        return res.status(200).json({
            news,
            ok: true,
            message: "Posts founded successfully.",
            lastPage: checkIfLastPage(page, newsCount, 40),
        });
    } else {
        return res.status(404).json({
            news: [],
            ok: false,
            message: "Posts not founded.",
            lastPage: true,
        });
    }
};

export default { postCreateNews, postFetchPopularNews };
