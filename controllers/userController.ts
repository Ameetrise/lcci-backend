import HttpError from "../models/httpError";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import User from "../models/user";
import Company from "../models/company";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  let users: any[];
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }

  try {
    for (let i = 0; i < users.length; i++) {
      users = await User.find({}).populate("company").exec();
    }
  } catch (error) {}

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

  const { name, userName, phone, password, userRole, company, isActive } =
    req.body;

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
    userRole,
    password,
    isActive: isActive || true,
  });

  try {
    await createdUser.save();
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
      isActive: createdUser.isActive,
    },
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { userName, id, password, email, phone } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ userName: userName })
      .or([{ userName: userName }, { phone: phone }])
      .populate({ path: "company" })
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

  let userCompanies;

  try {
    userCompanies = await Company.find({ owner: existingUser.id });
  } catch (error) {
    res.status(500).send({ error: error, code: 404 });
    return next(error);
  }

  res.status(200).send({ user: existingUser, company: userCompanies });
};

export { getUsers, signup, login, getCompanyByUserId };
