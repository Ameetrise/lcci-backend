import HttpError from "../models/httpError";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Company from "../models/company";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  let users: any[];
  try {
    users = await User.find({}, "-password").populate({ path: "owner" });
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    error: null,
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const getCompanyByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  let companies = await Company.find({ owner: userId });
  let user = await User.findById(userId);
  res.json({ error: null, data: { companies: companies, user: user } });
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(res.status(404).send({ error: error }));
  }

  const { name, userName, phone, password, userRole, isActive } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ userName: userName });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    res.status(500).send({ error: error.message, code: error.code });
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    res.status(422).send({ error: error.message, code: error.code });
    return next(error);
  }

  const createdUser = new User({
    name,
    userName,
    phone,
    userImage: req.file?.path,
    userRole,
    password,
    isActive: isActive || true,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later." + err,
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    error: null,
    status: "success",
    data: {
      userName: createdUser.userName,
      userId: createdUser.id,
      phone: createdUser.phone,
      userRole: createdUser.userRole,
      userImage: createdUser.userImage,
      isActive: createdUser.isActive,
      token: token,
    },
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { userName, id, password, email, phone } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ userName: userName })
      .or([{ userName: userName }, { phone: phone }])
      .populate([{ path: "companyList" }, { path: "feedsList" }])
      .exec();
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    res.status(500).send({ error: error.message, code: error.code });
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    res.status(500).send({ error: error.message, code: error.code });
    return next(error);
  }
  let isValidPassword = false;
  try {
    isValidPassword = password === existingUser.password ? true : false;
    if (!isValidPassword) {
      res.status(500).send({ error: "Invalid Password", code: 500 });
      return;
    }
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    res.status(500).send({ error: error.message, code: error.code });
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }
  res.status(200).send({ user: existingUser, token: token });
};

export { getUsers, signup, login, getCompanyByUserId };
