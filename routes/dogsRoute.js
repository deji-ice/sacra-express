import express from "express";
import Dog from "../models/dogModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const allDogs = await Dog.find();
  res.status(200).json(allDogs);
});

router.get("/:id", async (req, res) => {
  const dog = await Dog.findById(req.params.id);
  res.status(200).json(dog);
});

router.post("/create", async (req, res) => {
  const dog = new Dog(req.body);
  dog
    .save()
    .then(() => {
      res.status(201).send("Dog created");
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

export default router;
