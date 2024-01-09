const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

const usersRoute = require("./routes/users");
const vehicleRoute = require("./routes/vehicles");
const vehicledataRoute = require("./routes/vehiclesdata");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://desafio-final-frontend-nodejs.herokuapp.com"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-access-token"
  );
  res.setHeader("Access-Control-Allow-Methods", "PUT, POST, DELETE, GET");

  next();
});

app.use("/users", usersRoute);
app.use("/vehicles", vehicleRoute);
app.use("/vehiclesdata", vehicledataRoute);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.send({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
