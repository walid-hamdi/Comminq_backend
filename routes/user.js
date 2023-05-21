import express from "express";

import userController from "../controllers/user.js";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);
router.get("/:id", userController.profile);
router.get("/", userController.users);
router.put("/:id", userController.updateProfile);
router.delete("/:id", userController.deleteProfile);

export default router;
