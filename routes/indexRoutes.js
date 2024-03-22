const express = require("express");
const {
  userResgister,
  userLogin,
  currentUser,
  home,
  userLogout,
} = require("../controllers/indexController");
const router = express();
const { isAuthenticated } = require("../middlewares/auth");

router.get("/", home);

router.post("/user", isAuthenticated, currentUser);

router.post("/register", userResgister);

router.post("/login", userLogin);

router.post("/logout", isAuthenticated, userLogout);

module.exports = router;
