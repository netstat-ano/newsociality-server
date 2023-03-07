import express from "express";
import connect from "./database/connect";
import userRoutes from "./routes/userRoutes";
import bodyParser from "body-parser";
const app = async () => {
    const app = express();
    connect();
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
    app.use("/auth", userRoutes);
    app.listen(8080);
};
app();
