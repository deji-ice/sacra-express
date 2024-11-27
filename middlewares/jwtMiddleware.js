import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const validateJWT = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token)
    return res.status(401).send("Access Denied - No token provided 😦");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(process.env.JWT_SECRET);
    req.id = decoded.id;
    next();
  } catch (error) {
    res.status(400).send("unauthorized accsess 😦");
  }
};
