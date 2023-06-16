import { CompanyType, ICompany } from "./../models/company";
import Company from "../models/company";
import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import HttpError from "../models/httpError";
import mongoose from "mongoose";
import fs from "fs";
import { validationResult } from "express-validator";

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
    //@ts-ignore
    cLogo: req.files.cLogo ? req.files?.cLogo[0].path : "",
    owner,
    //@ts-ignore
    imageGallery: req.files.imageGallery
      ? //@ts-ignore
        req.files?.imageGallery.map((file: any) => file.path)
      : null,
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
    user.companyList?.push(createdCompany);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Failed to save company.", 500);
    return next(error);
  }

  res.status(201).json({ status: "Success", company: createdCompany });
};

const removeLogo = async (req: Request, res: Response, next: NextFunction) => {
  const cId = req.body.cId;
  let thisCompany;
  try {
    thisCompany = await Company.findById(cId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update company.",
      500
    );
    return next(error);
  }
  if (thisCompany?.cLogo) {
    fs.unlink(thisCompany?.cLogo, async (err) => {
      if (err) {
        const error = new HttpError("Something went wrong" + err, 500);
        return next(error);
      }
    });
    try {
      if (thisCompany) {
        thisCompany.cLogo = null;
        console.log(thisCompany);
        await thisCompany.save();
      }
    } catch (err) {
      const error = new HttpError(
        `Something went wrong, could not update place. ${err}`,
        500
      );
      return next(error);
    }
  }
  res.json({ status: "Successfully removed", data: thisCompany });
};

const uploadLogo = async (req: Request, res: Response, next: NextFunction) => {
  const cId = req.body.cId;
  const cLogo = req.file?.path || null;
  let thisCompany;

  try {
    thisCompany = await Company.findById(cId);
    if (thisCompany) {
      if (thisCompany.cLogo) {
        fs.unlink(thisCompany.cLogo, (err) => {});
      }
      thisCompany.cLogo = cLogo;
      await thisCompany.save();
    }
  } catch (error) {}

  res.json({ error: null, data: thisCompany });
};

const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `Invalid inputs passed, please check your data.  ${JSON.stringify(
          errors
        )}`,
        422
      )
    );
  }

  const { facebook, website, phone, address, time, email, description } =
    req.body;
  const cId = req.params.cid;
  let thisCompany;
  try {
    thisCompany = await Company.findById(cId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update company.",
      500
    );
    return next(error);
  }
  if (thisCompany) {
    website ? (thisCompany.website = website) : null;
    facebook ? (thisCompany.facebook = facebook) : null;
    phone ? (thisCompany.phone = phone) : null;
    address ? (thisCompany.address = address) : null;
    time ? (thisCompany.time = time) : null;
    email ? (thisCompany.email = email) : null;
    description ? (thisCompany.description = description) : null;

    try {
      await thisCompany.save();
    } catch (err) {
      const error = new HttpError(
        `Something went wrong, could not update company. ${err}`,
        500
      );
      return next(error);
    }
  }

  res.status(200).json({
    place: thisCompany ? thisCompany.toObject({ getters: true }) : null,
  });
};

const deleteCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const companyId = req.params.cid;
  let thisCompany;
  try {
    thisCompany = await Company.findById(companyId).populate("owner");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete Company.",
      500
    );
    return next(error);
  }

  if (!thisCompany) {
    const error = new HttpError("Could not find company for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await thisCompany.deleteOne({ session: sess });
    //@ts-ignore
    //delete company in user of owner company.owner
    await thisCompany.owner.companyList.pull(thisCompany);
    //@ts-ignorets-ignore
    await thisCompany.owner.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Could not Delete company." + err, 404);
    return next(error);
  }
  fs.unlink(thisCompany.cLogo ? thisCompany.cLogo : "d", (err) => {
    console.log(err);
  });
  for (let i = 0; i < thisCompany.imageGallery.length; i++) {
    //@ts-ignore
    fs.unlink(thisCompany.imageGallery[i], (err) => {
      console.log("Images deleted successfully");
    });
  }

  res
    .status(200)
    .json({ error: null, data: { success: "Company deleted successfully" } });
};

export default {
  getCompanies,
  postCompany,
  deleteCompany,
  updateCompany,
  removeLogo,
  uploadLogo,
};
