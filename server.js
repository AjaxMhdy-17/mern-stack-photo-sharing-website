const express = require("express");
const cors = require("cors");
const path = require("path");
const ConnectDB = require("./config/db");
const { errorHandler } = require("./middlewares/errorMiddleware");

// init mainApp
const app = express();

///connect database
ConnectDB();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

///Routes
const userAuth = require("./routers/userAuth");
const postRoutes = require("./routers/postRoutes");

// app.use("/api/post", createPost);
app.use("/api/auth", userAuth);
app.use("/api/post", postRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Api Running");
  });
}

///port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
