const User = require("../model/User");

const handleLogout = async (req, res) => {
  // on client also delete the accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  // look for the user with the refreshToken
  const foundUser = await User.findOne({ refreshToken }).exec();

  // if user is not found clear the cookie and send 204 - no content
  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    return res.sendStatus(204);
  }

  // delete the refreshToken of foundUser and save the user in db
  foundUser.refreshToken = "";
  const result = await foundUser.save();

  console.log(result);

  // clear the cookie and send 204 - no content
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.sendStatus(204);
};

module.exports = { handleLogout };
