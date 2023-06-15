import feedsController from "../controllers/feedsController";
import express from "express";
const router = express.Router();

router.get("/", feedsController.getFeeds);
router.post("/post", feedsController.postFeeds);
// module.exports = router;
export default router;
