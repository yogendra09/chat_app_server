const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncErrors");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(req.body.headers.Authorization.split(" ")[1]);
  // const { token } = req.cookies;
  const token = req.body.headers.Authorization.split(" ")[1];

  if (!token) {
    return next(new ErrorHandler("please login to access the resource", 401));
  }

  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await userModel.findById(id).exec();
  req.id = id;
  req.user = user;
  next();
});
