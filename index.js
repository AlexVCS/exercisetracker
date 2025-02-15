require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const myURI = process.env["MONGO_URI"];
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

app.get("/api/users/:_id/logs?", function (req, res) {
  // logging
  console.log("GET Logs");
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  console.log(`req.params: ${JSON.stringify(req.params)}`);
  console.log(`req.query: ${JSON.stringify(req.query)}`);

  const { _id } = req.params;
  let query = {};
  let from = req.query.from;
  let to = req.query.to;
  let limit = parseInt(req.query.limit);
  const validDate = /^\d{4}-\d{2}-\d{2}$/;

  User.findById(_id, async (err, userRecord) => {
    if (err) {
      console.log(err);
      res.json("Invalid request please try again");
    } else {
      // error conditions
      // !validDate.test(from) ||
      // !validDate.test(to) ||
      // limit !== Number

      // zod library

      const logCopy = [...userRecord.log];
      console.log(`this is the userRecord.log ` + logCopy);
      console.log(`this is the limit ` + typeof limit);
      const logLimit = logCopy.slice(0, limit);

      // $gte greater than or = to
      // $lte less than or = to
      // https://www.mongodb.com/docs/manual/reference/operator/query/gte/

      res.json({
        _id: _id,
        username: userRecord.username,
        count: !limit ? userRecord.log.length : logLimit.length,
        log: !limit ? userRecord.log : logLimit,
      });
    }
  });
});

app.post("/api/users/:_id/exercises", async function (req, res) {
  // logging
  console.log("POST exercise");
  console.log(`req.params: ${JSON.stringify(req.params)}`);
  console.log(`req.query: ${JSON.stringify(req.query)}`);

  const { _id } = req.params;
  const { date, duration, description } = req.body;

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

  User.findById(_id, async (err, userRecord) => {
    if (err) {
      console.log(err);
    } else {
      let newExerise = {
        description: description,
        duration: parseInt(duration),
        date: makeDate(date),
      };
      await userRecord.log.push(newExerise);
      console.log(userRecord.log);
      await userRecord.save();
      console.log("This is the userRecord " + userRecord);
      console.log("this is date " + req.body.date);
      console.log(
        "last log entry " + userRecord.log[userRecord.log.length - 1]
      );

      const savedLogEntry = userRecord.log[userRecord.log.length - 1];
      res.json({
        username: userRecord.username,
        description: savedLogEntry.description,
        duration: savedLogEntry.duration,
        date: savedLogEntry.date,
        _id: _id,
      });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
