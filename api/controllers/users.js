const { check, body, validationResult } = require("express-validator");
const sendMail = require("../../mail");
const User = require("../../models/users");
require("dotenv").config();

const createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.json({ success: true, message: "User created" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error creating user", err });
  }
};

exports.postUser = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let { name, email, anfrage, beschreibungstext } = req.body;
  const subject = anfrage;
  if (beschreibungstext) {
    text = beschreibungstext;
  } else {
    text = anfrage;
  }
  sendMail(email, name, subject, text, (err, data) => {
    if (err) {
      res
        .status(500)
        .json({ success: false, message: "Error sending email", err });
    } else {
      createUser(req, res);
    }
  });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).json({ message: "Error getting users", err });
  }
};

exports.validation = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name is too short"),
  body("email", "Incorrect email format")
    .normalizeEmail()
    .trim()
    .isEmail(),
  body("beschreibungstext")
    .trim()
    .escape()
];
