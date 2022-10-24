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
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});

const User = mongoose.model("User", userSchema);

// User.deleteMany({}, function (err, result) {
//   if (err) return handleError(err);
//   console.log(result);
// });

app.get("/api/users", function (req, res) {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

app.get("/api/users/:_id/logs?", function (req, res) {
  const { _id } = req.params;
  const from = req.query.from || new Date(0);
  const to = req.query.to;
  const limit = Number(req.query.limit) || 0;
  // const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  // if (!from.match(dateRegEx) && !to.match(dateRegEx)) return console.log(err);
  return User.findById(_id, (err, userRecord) => {
    if (err) {
      console.log(err);
    } else {
      res.json({
        _id: userRecord._id,
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
  console.log(userRecord);
  res.json({
    _id: userRecord._id,
    username: userRecord.username,
  });
});

app.post("/api/users/:_id/exercises", async function (req, res) {
  const { _id } = req.params;
  const { date, duration, description } = req.body;
  function makeDate(string) {
    if (!date) {
      return new Date().toDateString();
    } else {
      return new Date(string).toDateString();
    }
  }
  User.findById(_id, async (err, userRecord) => {
    if (err) {
      console.log(err);
    } else {
      await userRecord.log.push({ date, duration, description });
      await userRecord.save();
      res.json({
        _id: _id,
        username: userRecord.username,
        date: makeDate(date),
        duration: parseInt(duration),
        description: description,
      });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
