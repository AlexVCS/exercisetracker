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
  log: [],
});

const User = mongoose.model("User", userSchema);

app.get("/api/users", function (req, res) {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

app.get("/api/users/:_id/logs", function (req, res) {
  const id = req.params._id;
  return User.findById(id, (err, userRecord) => {
    if (err) {
      console.log(err);
    } else {
      res.json({
        _id: id.toString(),
        username: userRecord.username,
        count: userRecord.log.length,
        log: userRecord.log,
      });
    }
  });
});

app.post("/api/users", async function (req, res) {
  let nameToString = req.body.username.toString();
  let hash = crypto.randomBytes(20).toString("hex");
  const newUser = new User({
    username: nameToString,
    _id: hash,
    log: [],
  });
  const userRecord = await newUser.save();
  res.json(userRecord);
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

app.post("/api/users/:_id/exercises", function (req, res, saveData) {
  const id = req.params._id;
  const { date, duration, description } = req.body;
  const username = User.findById(id, (err, userRecord) => {
    if (err) {
      console.log(err);
    } else {
      userRecord.log.push({ date, duration, description });
      userRecord.save();
      res.json({
        id: id,
        date: date,
      });
    }
  });
  // console.log(username);
  // saveData(id, username, date, duration, description, async (error) => {
  //   if (!error) {
  //     const newExercise = new User({
  //       id: id,
  //       username: username,
  //       date: date,
  //       duration: duration,
  //       description,
  //     });
  //     const { id, username, date, duration, description } =
  //       await newExercise.save();
  //     res.json({
  //       _id: id,
  //       username: username,
  //       date: date,
  //       duration: duration,
  //       description: description,
  //     });
  //   } else {
  //     res.json({
  //       error: "error",
  //     });
  //   }
  // });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
