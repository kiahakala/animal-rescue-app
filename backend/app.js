const express = require("express");
const app = express();
const cors = require("cors");
const usersRouter = require("./controllers/users");
const postsRouter = require("./controllers/posts");
const loginRouter = require("./controllers/login");

const config = require('./utils/config')
const middleware = require('./utils/middleware')

app.use(express.static('frontend'))

// cors - allow connection from different domains and ports
app.use(cors());

// convert json string to json object (from request)
app.use(express.json());

// mongo
const mongoose = require("mongoose");

const mongoDB = config.MONGODB_URI;

// connect mongodb
mongoose.connect(mongoDB);
const db = mongoose.connection;

// check connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log(`Database connected ${db.name}`);
});



app.use('/users', usersRouter)
app.use('/posts', postsRouter)
app.use('/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app;
