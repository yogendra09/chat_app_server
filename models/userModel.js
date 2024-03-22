const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   // minLength: [4, "Name must not contain more than 14 characters"],
  // },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please fill a valid email address",
    // ],
  },
  username: {
    required: [true, "username is required"],
    type: String,
    unique: true,
  },
  image: {
    type: Object,
    default: {
      fileId: "",
      url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  socketId: {
    type: String,
    default: "",
  },
  chats: [
    {
      type: String,
    },
  ],
  password: {
    type: String,
    select: false,
    required: [true, "password is required"],
  },
});

userSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }
  let salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

userSchema.methods.comparepassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.getjwttoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("user", userSchema);
