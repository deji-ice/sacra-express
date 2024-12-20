import express from "express";
import User from "../models/userModel.js";
import {
  createUser,
  getAllUsers,
  login_otp,
  sendOTP,
  updatePasswordById,
  updateUsernameById,
  userLogin,
} from "../controllers/userController.js";
import { validateUser } from "../middlewares/validateUser.js";
import { validateJWT } from "../middlewares/jwtMiddleware.js";
import { validateOtp } from "../middlewares/otpValidator.js";
const router = express.Router();

router.get("/", validateJWT, getAllUsers);

router.post("/create", createUser);

router.post("/login", userLogin);
router.patch("/update-username/:id",validateJWT, updateUsernameById);
router.patch("/update-password/:id",validateJWT, updatePasswordById);
router.post("/send-otp", sendOTP )
router.post("/login-otp",validateOtp, login_otp)

export default router;
