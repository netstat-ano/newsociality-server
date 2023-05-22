import express from "express";
import newsController from "../controllers/newsController";
import isAuth from "../middlewares/is-auth";
import { body } from "express-validator";
const newsRoutes = express.Router();

newsRoutes.post("/fetch-popular-news", newsController.postFetchPopularNews);
export default newsRoutes;
