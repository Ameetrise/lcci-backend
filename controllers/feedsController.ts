import Feeds from "../models/feeds";
import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import HttpError from "../models/httpError";
import mongoose from "mongoose";
import fs from "fs";

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
  const { title, description, author } = req.body;
  const createdFeed = new Feeds({
    title,
    description,
    createdAt: new Date().getTime(),
    newsImage: req.file?.path,
    author,
  });

  let user;
  try {
    user = await User.findById(author);
  } catch (err) {
    const error = new HttpError(
      "Creating feed failed,is the author id valid?",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }
  //@ts-ignore
  if (createdFeed.author.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to post this feed.", 401);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdFeed.save({ session: sess });
    //@ts-ignore
    user.feedsList?.push(createdFeed);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Failed to save Feed.", 500);
    return next(error);
  }

  res.status(201).json({ feed: createdFeed });
};

const deleteFeed = async (req: Request, res: Response, next: NextFunction) => {
  const feedId = req.params.fid;
  let feed;
  try {
    feed = await Feeds.findById(feedId).populate("author");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete Feed.",
      500
    );
    return next(error);
  }

  if (!feed) {
    const error = new HttpError("Could not find Feed for this id.", 404);
    return next(error);
  }
  //@ts-ignore
  if (feed.author.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this feed.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await feed.deleteOne({ session: sess });
    //@ts-ignore
    await feed.author.feedsList.pull(feed);
    //@ts-ignorets-ignore
    await feed.author.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Could not Delete Feed." + err, 404);
    return next(error);
  }

  fs.unlink(feed.newsImage, (err) => {
    console.log("fletis: ", err);
  });

  res
    .status(200)
    .json({ error: null, data: { success: "News feed deleted successfully" } });
};

const updateFeeds = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;
  const fid = req.params.fid;

  let thisFeeds;
  try {
    thisFeeds = await Feeds.findById(fid);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update feeds.",
      500
    );
    return next(error);
  }

  //@ts-ignore
  if (feed.author.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this feed.", 401);
    return next(error);
  }

  if (thisFeeds) {
    title ? (thisFeeds.title = title) : null;
    description ? (thisFeeds.description = description) : null;
    try {
      await thisFeeds.save();
    } catch (err) {
      const error = new HttpError(
        `Something went wrong, could not update feeds. ${err}`,
        500
      );
      return next(error);
    }

    res.json({ status: "Success", data: thisFeeds });
  }
};
export { getFeeds, postFeeds, deleteFeed, updateFeeds };
