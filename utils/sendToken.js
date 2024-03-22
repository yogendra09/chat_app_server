exports.sendToken = (user, statuscode, res) => {
  const token = user.getjwttoken();

  const option = {
    exipres: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure:true
  };
  res
    .status(statuscode)
    .cookie("token", token, option)
    .json({ success: true, id: user._id, token });
};
