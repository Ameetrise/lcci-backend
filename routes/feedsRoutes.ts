import {
  getFeeds,
  postFeeds,
  deleteFeed,
  updateFeeds,
} from "../controllers/feedsController";
import express from "express";
import checkAuth from "../middlewares/check-auth";
import fileUpload from "../middlewares/file-upload";
const router = express.Router();
router.get("/", getFeeds);
router.use(checkAuth);
router.delete("/:fid", deleteFeed);
router.patch("/:fid", updateFeeds);
router.post("/post", fileUpload("feeds").single("newsImage"), [], postFeeds);
// module.exports = router;
export default router;
