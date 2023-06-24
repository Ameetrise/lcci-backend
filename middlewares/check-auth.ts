import HttpError from "../models/httpError";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    //@ts-ignore
    const token = req.headers.authorization.split(" ")[1]; // Bearer Token   Bearer v_jxahl!-Jiakdsds...
    if (!token) {
      const error = new HttpError("Authentication failed!", 401);
      return next(error);
    }
    const decodedToken = jwt.verify(token, "supersecret_dont_share");
    //@ts-ignore
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    const err = new HttpError("Authentication failed!" + error, 401);
    return next(err);
  }
};

export default checkAuth;
