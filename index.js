const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();
const myURI = process.env["MONGO_URI"];
const crypto = require("crypto");
bodyParser = require("body-parser");

// const morgan = require("morgan");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(`${myURI}`);

// app.use(
//   "/",
//   (logger = (req, res, next) => {
//     console.log(`${req.body} ${req.params} - ${res.ip}`);
//     next();
//   })
// );

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
  // logging
  console.log("GET Logs");
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  console.log(`req.params: ${JSON.stringify(req.params)}`);
  console.log(`req.query: ${JSON.stringify(req.query)}`);

  const { _id } = req.params;
  // const from = req.query.from;
  // const to = req.query.to;
  // const limit = Number(req.query.limit);
  // const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  // if (!from.match(dateRegEx) && !to.match(dateRegEx)) return console.log(err);
  User.findById(_id, async (err, userRecord) => {
    if (err) {
      console.log(err);
    } else {
      console.log(userRecord);
      // console.log(userRecord.log);
      // console.log(stringify(res.json));
      res.json({
        _id: _id,
        username: userRecord.username,
        count: userRecord.log.length,
        log: userRecord.log,
      });
    }
  });
});

app.post("/api/users", async function (req, res) {
  // logging
  console.log("POST Users");
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  console.log(`req.params: ${JSON.stringify(req.params)}`);
  console.log(`req.query: ${JSON.stringify(req.query)}`);

  let nameToString = req.body.username.toString();
  let hash = crypto.randomBytes(20).toString("hex");
  const newUser = new User({
    username: nameToString,
    _id: hash,
    log: [],
  });
  const userRecord = await newUser.save();
  console.log(await newUser.save());
  res.json({
    _id: userRecord._id,
    username: userRecord.username,
  });
});

app.post("/api/users/:_id/exercises", async function (req, res) {
  // logging
  console.log("POST exercise");
  console.log(`req.params: ${JSON.stringify(req.params)}`);
  console.log(`req.query: ${JSON.stringify(req.query)}`);

  const { _id } = req.params;
  const { date, duration, description } = req.body;
  parseInt(duration);

  console.log(`req.body: ${JSON.stringify(req.body)}`);
  console.log(`date: ${JSON.stringify(date)}`);
  function isValidDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }
  function makeDate(date) {
    if (!isValidDate(date)) {
      return new Date().toDateString();
    } else {
      return new Date(date).toDateString();
    }
  }

  // req.body.date = makeDate(date);

  User.findById(_id, async (err, userRecord) => {
    if (err) {
      console.log(err);
    } else {
      await userRecord.log.push({ date, duration, description });
      await userRecord.save();
      console.log("This is the userRecord " + userRecord);
      console.log("this is date " + req.body.date);
      // console.log(JSON.stringify(res));
      res.json({
        username: userRecord.username,
        description: description,
        duration: duration,
        date: makeDate(date),
        _id: _id,
      });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
