import Company from "../models/company";
import { Request, Response, NextFunction } from "express";
import HttpError from "../models/httpError";

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

  try {
    await createdCompany.save();
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
    company = await Company.findById(companyId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!company) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  // if (place.creator.id !== req.userData.userId) {
  //   const error = new HttpError(
  //     'You are not allowed to delete this place.',
  //     401
  //   );
  //   return next(error);
  // }
  res.status(200).json({ company: company });
};

export default { getCompanies, postCompany, deleteCompany };
