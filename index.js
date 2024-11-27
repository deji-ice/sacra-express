import express from "express";
import dbConnection from "./db/conn.js";
import userRoute from "./routes/usersRoute.js";

dbConnection();
const app = express();
const port = 5000;

app.use(express.json());
app.use("/users", userRoute);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

