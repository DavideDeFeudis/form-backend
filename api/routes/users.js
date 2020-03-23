const express = require("express");
const router = express.Router();
const { getUsers, validation, postUser } = require("../controllers/users");

router.get("/", getUsers);
router.post("/", validation, postUser);

module.exports = router;
