import Feeds from "../models/feeds";
import { Request, Response, NextFunction } from "express";
import HttpError from "../models/httpError";

const getFeeds = async (req: Request, res: Response, next: NextFunction) => {
  let feeds;
  try {
    feeds = await Feeds.find({})
      .populate({ path: "author", select: ["name", "userRole"] })
      .exec();
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    feeds: feeds.map((feed: any) => feed.toObject({ getters: true })),
  });
};

const postFeeds = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, newsImage, author } = req.body;
  const createdFeed = new Feeds({
    title,
    description,
    createdAt: new Date(),
    newsImage,
    author,
  });

  try {
    await createdFeed.save();
  } catch (err) {
    const error = new HttpError("Failed to save Feed.", 500);
    return next(error);
  }

  res.status(201).json({ feed: "success" });
};

export default { getFeeds, postFeeds };
