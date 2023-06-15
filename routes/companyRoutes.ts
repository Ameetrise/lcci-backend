import companyController from "../controllers/companyController";
import express from "express";
import fileUpload from "../middlewares/file-upload";
const router = express.Router();

router.get("/", companyController.getCompanies);
router.post(
  "/post",
  fileUpload("company").fields([
    { name: "cLogo", maxCount: 1 },
    { name: "imageGallery", maxCount: 3 },
  ]),
  companyController.postCompany
);
router.delete("/:cid", companyController.deleteCompany);

// module.exports = router;
export default router;
