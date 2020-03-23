const express = require("express");
const app = express();
const mongoose = require("mongoose");
const usersRoutes = require("./api/routes/users");
require("dotenv").config();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use((req, res, next) => {
  res.set("ACCESS-CONTROL-ALLOW-ORIGIN", process.env.CORS_ORIGIN);
  res.set("ACCESS-CONTROL-ALLOW-HEADERS", "*");
  res.set("ACCESS-CONTROL-ALLOW-METHODS", "GET, POST");
  next();
});
app.use("/users", usersRoutes);

const mongoUrl = process.env.MONGO;

mongoose.connect(
  mongoUrl,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  },
  err => {
    if (!err) console.log("MongoDB Connection succeeded");
    else console.log("Error on DB connection: " + err);
  }
);

app.use((err, req, res, next) => {
  res.status(500).send({ error: err.message || err });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
