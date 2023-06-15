import { getFeeds, postFeeds } from "../controllers/feedsController";
import express from "express";
import fileUpload from "../middlewares/file-upload";
const router = express.Router();

router.get("/", getFeeds);
router.post("/post", fileUpload("feeds").single("newsImage"), [], postFeeds);
// module.exports = router;
export default router;
