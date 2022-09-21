const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const app = express();
const cors = require("cors");
require("dotenv").config();
const myURI = process.env["MONGO_URI"];
const crypto = require("crypto");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(`${myURI}`);

const userSchema = new mongoose.Schema({
  username: String,
  _id: String,
});

const User = mongoose.model("User", userSchema);

app.post("/api/users", function (req, res) {
  let nameToString = req.body.username.toString();
  let hash = crypto.randomBytes(20).toString("hex");
  const newUser = new User({
    username: nameToString,
    _id: hash,
  });
  const { username, _id } = newUser.save();
  res.json({
    username: nameToString,
    _id: hash,
  });
});

app.get("/api/users", function (req, res) {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

app.post("/api/users/:_id/exercises", function (req, res) {
  // let username = req.body.username.toString();
  const date = new Date();
  res.json({
    // username: username,
    description: "pushup",
    duration: 30,
    date: date.toDateString(),
    _id: "1",
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
