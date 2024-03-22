const express = require("express");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");
const dotenv = require("dotenv").config({path:"./.env"});
const mongoStore = require('connect-mongo');
const http = require("http");
app.use(cors({ origin: true, credentials: true }));
require('./models/database').connectDatabase();

const logger = require("morgan");
app.use(logger("tiny"));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

const expressSession = require('express-session');
const cookieParser = require('cookie-parser');

app.use(expressSession({
  resave:true,
  saveUninitialized:true,
  secret: process.env.EXPRESS_SESSION_SECRET,
  cookie:{maxAge:1000*60*60*3},
  store:mongoStore.create({
    mongoUrl:process.env.MONGO_URL,
    autoRemove:"disabled"
  })
}))
app.use(cookieParser());


app.use('/api',require("./routes/indexRoutes"));

const ErrorHandler = require("./utils/ErrorHandler");
const { generatedErrors } = require("./middlewares/errors");
const { createSocketServer } = require("./socketapi");


app.all("*",(req,res,next)=>{
  next (new ErrorHandler(`requested url not found ${req.url}`),404);
})
app.use(generatedErrors);


const server = http.createServer(app);
createSocketServer(server)

server.listen(process.env.PORT, () => {
  console.log("server running on port "+process.env.PORT);
});
