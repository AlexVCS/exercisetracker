const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const app = express();
const cors = require("cors");
require("dotenv").config();
const myURI = process.env["MONGO_URI"];
const crypto = require("crypto");
const { doesNotMatch } = require("assert");

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

app.get("/api/users", function (req, res) {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

app.get("/api/users:_id/logs", function (req, res) {
  res.json({
    hi,
  });
});

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

function isNumbersOnly(string) {
  return /^\d+$/.test(string);
}

function makeDate(string) {
  if (isNumbersOnly(string)) {
    return new Date(parseInt(string));
  } else {
    return new Date(string);
  }
}

app.post("/api/users/:_id/exercises", function (req, res) {
  const id = req.body.id;
  const description = req.body.description;
  const date = new Date().toDateString();
  const findUserById = (userId, success) => {
    User.findById(userId, (err, _id) => {
      if (err) return console.log(err);
      success(null, _id);
    });
  };
  res.json({
    _id: id,
    // username: username,
    date: date,
    duration: 30,
    description: description,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
