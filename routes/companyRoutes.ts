import companyController from "../controllers/companyController";
import express from "express";
import fileUpload from "../middlewares/file-upload";
const router = express.Router();

router.get("/", companyController.getCompanies);
router.post(
  "/post",
  fileUpload("company").single("cLogo"),
  companyController.postCompany
);
router.delete("/:cid", companyController.deleteCompany);

// module.exports = router;
export default router;
