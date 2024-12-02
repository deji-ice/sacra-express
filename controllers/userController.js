import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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

    console.log(process.env.JWT_SECRET);
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
    let secretKey = await OTPgenrator(email); // Generate OTP
    console.log(secretKey);
    res.status(200).send("OTP sent successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
};
