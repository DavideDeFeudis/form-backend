const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  anrede: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  anfrage: { type: String, required: true },
  beschreibungstext: { type: String, required: false }
});

module.exports = mongoose.model("User", UserSchema);
