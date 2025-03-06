const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");

const app = express();
const PORT = process.env.PORT || 3000;

// connect to mongodb
connectDB();

// custom middleware logger
app.use(logger);

// handle options credentials check - before CORS! and fetch cookies credentials requirements
app.use(credentials);

// cross origin resource sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// serve static files
app.use("/", express.static(path.join(__dirname, "public")));

// routes
app.use("/", require("./routes/root"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));

// default route - 404 page
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not found");
  }
});

// middleware for error handling
app.use(errorHandler);

// listening the server on the given PORT
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
