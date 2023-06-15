import companyController from "../controllers/companyController";
import express from "express";
const router = express.Router();

router.get("/", companyController.getCompanies);
router.post("/post", companyController.postCompany);
router.delete("/:cid", companyController.deleteCompany);

// module.exports = router;
export default router;
