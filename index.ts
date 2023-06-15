import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import companyRoutes from "./routes/companyRoutes";
import userRoutes from "./routes/userRoutes";
import feedsRoutes from "./routes/feedsRoutes";
import { Request, Response, NextFunction } from "express";
import bearerToken from "express-bearer-token";
import HttpError from "./models/httpError";
const app = express();
app.use(bodyParser.json());

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
  const error = new HttpError("Route not found", 404);
  res.status(404).send({ error: error.message, code: error.code });
  throw error;
});

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Successful response.");
});

app.use(bearerToken());
app.use(function (req, res) {
  res.send("Token " + req.token);
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
