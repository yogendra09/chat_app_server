const { sendToken } = require("../utils/sendToken");
const userModel = require("../models/userModel");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const chatModel = require("../models/chatModel");
const ErrorHandler = require("../utils/ErrorHandler");

exports.home = catchAsyncErrors(async (req, res, next) => {
  res.json({ message: "Welcome To Home" });
});

exports.currentUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req.id);
  res.json(user);
});

exports.userResgister = catchAsyncErrors(async (req, res, next) => {
  const newUser = await new userModel(req.body).save();
  console.log(newUser);
  sendToken(newUser, 200, res);
});
exports.userLogout = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  const token = user.getjwttoken();

  const option = {
    exipres: new Date(),
    httpOnly: true,
    // secure:true
  };
  res
    .status(200)
    .cookie("token",'', option)
    .json({ message: "user logout!" });
});

exports.userLogin = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel
    .findOne({ email: req.body.email })
    .select("+password");
  if (!user) {
    return next(new ErrorHandler("user not found with this email id", 404));
  }

  const isMatch = user.comparepassword(req.body.password);

  if (!isMatch) {
    return next(new ErrorHandler("worng password!", 500));
  }

  sendToken(user, 200, res);
});
