import express from "express";
import { Request } from "express";
import connect from "./database/connect";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postsRoutes";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import commentsRoutes from "./routes/commentsRoutes";
const app = async () => {
    const app = express();
    connect();
    const storage = multer.diskStorage({
        destination: (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, destination: string) => void
        ) => {
            cb(null, `./public/images/`);
        },
        filename: (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, filename: string) => void
        ) => {
            cb(null, `${Date.now()}_${file.originalname}`);
        },
    });
    app.use(
        "/public/images",
        express.static(path.join(__dirname, "..", "public", "images"))
    );

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        next();
    });
    app.use(bodyParser.json());
    app.use(
        "/comment",
        multer({ storage: storage }).single("image"),
        commentsRoutes
    );
    app.use(
        "/auth",
        multer({ storage: storage }).single("newAvatar"),
        userRoutes
    );
    app.use("/posts", multer({ storage: storage }).single("image"), postRoutes);
    app.listen(8080);
};
app();
