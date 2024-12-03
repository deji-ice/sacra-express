import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OTPgenerator } from "../lib/OTPgenrator.js";
import nodemailer from "nodemailer";

dotenv.config();

export const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const user = new User(req.body);
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    await user.save();
    res.status(201).send("User created");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}, { password: 0 });
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    // throw new Error("Simulating a server-side error");
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(401).send("Please provide username and password");
    }

    const user = await User.findOne({ username });

    if (!user) return res.status(401).send("username does not exist");
    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(401).send("Invalid password");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    }); // expires in 1 hour

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateUsernameById = async (req, res) => {
  try {
    const { id } = req.params;
    const { newUsername } = req.body;
    const user = await User.findByIdAndUpdate(id, { username: newUsername });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("Username updated successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePasswordById = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, oldPassword } = req.body;
    if (!newPassword || !oldPassword)
      return res.status(400).send("Please provide old and new password");

    if (newPassword === oldPassword)
      return res
        .status(400)
        .send("New password cannot be the same as old password");

    const user = await User.findBy(id);
    if (!user) return res.status(404).send("User not found");

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password
    );
    if (!isOldPasswordCorrect) {
      return res.status(401).send("Old password is incorrect");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send("Password updated successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }); // Check if user exists
    if (!user) return res.status(404).send("User not found"); // Return 404 if user not found

    // Generate OTP
    let otp = await OTPgenerator(email);

    // Send OTP to user's email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "dejixice@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
    const mailOptions = {
      from: "dejixice@gmail.com",
      to: email,
      subject: "Your One-Time Password (OTP) Code",
      html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  width: 100%;
                  padding: 40px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                  margin: 20px auto;
                }
                .header {
                  text-align: center;
                  color: #333333;
                }
                .otp {
                  font-size: 30px;
                  font-weight: bold;
                  color: #3498db;
                  margin: 20px 0;
                  text-align: center;
                }
                .footer {
                  text-align: center;
                  color: #7f8c8d;
                  font-size: 14px;
                }
                .button {
                  display: inline-block;
                  background-color: #3498db;
                  color: #ffffff;
                  padding: 12px 30px;
                  font-size: 16px;
                  text-decoration: none;
                  border-radius: 4px;
                  text-align: center;
                  margin: 20px 0;
                }
                .button:hover {
                  background-color: #2980b9;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Welcome to Our Platform!</h2>
                </div>
                <p>Hello,</p>
                <p>We received a request to verify your identity. Please use the following One-Time Password (OTP) to proceed:</p>
                <div class="otp">
                  ${otp}
                </div>
                <p>This OTP is valid for the next 10 minutes. If you did not request this, please ignore this email.</p>
                <a href="#" class="button">Verify Now</a>
                <div class="footer">
                  <p>Thank you for using our service.</p>
                  <p>If you have any questions, feel free to contact us.</p>
                </div>
              </div>
            </body>
          </html>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        res.status(500).send(error.message);
      } else {
        console.log("Email sent: ", info.response);
        res.status(200).send("OTP sent successfully");
      }
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
