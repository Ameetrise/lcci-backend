import { Request } from "express";
import { FileFilterCallback } from "multer";
import fs from "fs-extra";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import HttpError from "../models/httpError";

const MIME_TYPE_MAP: any = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = (path: string) =>
  multer({
    limits: { fileSize: 512000 },
    storage: multer.diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
      ) => {
        const dir = `uploads/images/${path}`;
        fs.ensureDirSync(dir);
        cb(null, `uploads/images/${path}`);
      },
      filename: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
      ) => {
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, uuidv4() + "." + ext);
      },
    }),
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype]; //!! converts undefined or null to false
      let error: any = isValid
        ? null
        : new Error(
            "File format not supported, please upload png, jpg or jpeg images only"
          );
      cb(error, isValid);
    },
  });

export default fileUpload;
