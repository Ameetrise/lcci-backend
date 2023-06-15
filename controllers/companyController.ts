import Company from "../models/company";
import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import HttpError from "../models/httpError";
import mongoose from "mongoose";
import fs from "fs";

const getCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let companies;
  try {
    companies = await Company.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    companies: companies.map((company) => company.toObject({ getters: true })),
  });
};

const postCompany = async (req: Request, res: Response, next: NextFunction) => {
  const { cName, owner } = req.body;
  const createdCompany = new Company({
    cName,
    cLogo: req.file?.path,
    owner,
  });

  let user;
  try {
    user = await User.findById(owner);
  } catch (err) {
    const error = new HttpError(
      "Creating company failed,is the owner id valid?",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCompany.save({ session: sess });
    //@ts-ignore
    user.company?.push(createdCompany);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Failed to save company.", 500);
    return next(error);
  }

  res.status(201).json({ company: createdCompany });
};

const deleteCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const companyId = req.params.cid;
  let company;
  try {
    company = await Company.findById(companyId).populate("owner");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete Company.",
      500
    );
    return next(error);
  }

  if (!company) {
    const error = new HttpError("Could not find company for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await company.deleteOne({ session: sess });
    //@ts-ignore
    company.owner.company.pull(company);
    //@ts-ignorets-ignore
    await company.owner.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Could not Delete company." + err, 404);
    return next(error);
  }

  fs.unlink(company.cLogo, (err) => {
    console.log(err);
  });

  res
    .status(200)
    .json({ error: null, data: { success: "Company deleted successfully" } });
};

export default { getCompanies, postCompany, deleteCompany };
