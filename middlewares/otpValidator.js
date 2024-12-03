import * as OTPAuth from "otpauth"; // Importing the otpauth module
import User from "../models/userModel.js";

export const validateOtp = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    if (!otp || !email) {
      return res.status(400).send("Please provide OTP and email");
    }
    // Find the user with the provided email
    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id
      .toString()
      .replace(/^new ObjectId\("(.+)"\)$/, "$1"); // Remove ObjectId wrapper from user._id

    // Create a new TOTP object.
    let totp = new OTPAuth.TOTP({
      issuer: "ACME",
      label: "Alice",
      algorithm: "SHA1",
      digits: 6,
      period: 60,
      secret: OTPAuth.Secret.fromHex(userId), // Use the user's ID as the secret, dont let them know ;)
    });

    let otpString = otp.toString(); // Convert the OTP to a string
    console.log("OTP:", otpString); // Log the OTP for debugging

    let delta = totp.validate({ token: otpString, window: 1 }); // Validate the OTP with a window of 1 second (30 seconds before and after)
    if (delta === null) {
      return res.status(400).send("Invalid OTP");
    }
    next(); // Move to the next middleware
  } catch (error) {
    console.error(error); // Log the error for debugging
    next(error); // Passes the error to the error handler
  }
};