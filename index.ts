import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import companyRoutes from "./routes/companyRoutes";
import userRoutes from "./routes/userRoutes";
import feedsRoutes from "./routes/feedsRoutes";
import { Request, Response, NextFunction } from "express";
import bearerToken from "express-bearer-token";
import HttpError from "./models/httpError";
import fs from "fs";

const app = express();
import path from "path";
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join("uploads"))); //allowing images from this path to run on browser
const url = `mongodb+srv://ameetrise:Bhattarai123@cluster0.wrjej8r.mongodb.net/lcci?retryWrites=true&w=majority`;

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/feeds", feedsRoutes);

app.use((req, res, next) => {
  console.log(
    "runs after next() in controller when there is no action from the controller"
  );
  const error = new HttpError("Route not found", 404);
  res.status(404).send({ error: error.message, code: error.code });
  throw error;
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    //deletes file if the api transaction is incomplete
    fs.unlink(req.file.path, (err) => {
      console.log("error deleting file: ", err);
    });
  }
  if (res.headersSent) {
    //error response already sent
    return next(error);
  }
  res.status(isNaN(error.code) ? 223 : error.code || 500);
  res.json({
    error: error.message || "An unknown error occured.",
    code: error.code,
  });
});

mongoose
  .connect(url)
  .then((res) => {
    app.listen(3000);
    console.log("Connection Successful"); //res.connection.collections
  })
  .catch((err: any) => {
    console.log("Connection error: ", err);
  });
