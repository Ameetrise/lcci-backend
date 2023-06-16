import companyController from "../controllers/companyController";
import express from "express";
import fileUpload from "../middlewares/file-upload";
import { check } from "express-validator";
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
router.patch("/:cid", companyController.updateCompany);
router.post("/removegalleryimage", companyController.removeGalleryImage);
router.post("/removeclogo", companyController.removeLogo);
router.post(
  "/uploadcgallery",
  fileUpload("company").fields([{ name: "imageGallery", maxCount: 3 }]),
  companyController.uploadcGallery
);
router.post(
  "/uploadcLogo",
  fileUpload("company").single("cLogo"),
  companyController.uploadLogo
);
router.delete(
  "/:cid",
  fileUpload("company").fields([
    { name: "cLogo", maxCount: 1 },
    { name: "imageGallery", maxCount: 3 },
  ]),
  companyController.deleteCompany
);

// module.exports = router;
export default router;
