import { check } from "express-validator";
import {
  signup,
  getUsers,
  login,
  getCompanyByUserId,
} from "../controllers/userController";
import fileUpload from "../middlewares/file-upload";
import express from "express";

const userRoutes = express.Router();
userRoutes.post("/login", login);
userRoutes.get("/", getUsers);
userRoutes.post("/companies", getCompanyByUserId);

userRoutes.post(
  "/signup",
  fileUpload("users").single("userImage"),
  [
    check("name").not().isEmpty(),
    check("userName").isLength({ min: 4 }),
    check("phone").isLength({ min: 9 }),
  ],
  signup
);

export default userRoutes;
// module.exports = userRoutes;
