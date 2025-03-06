const jwt = require("jsonwebtoken");

const User = require("../model/User");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  // if cookies and cookies.jwt is undefined send 401 - unauthorized
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  // look for the user with the refreshToken
  const foundUser = await User.findOne({ refreshToken }).exec();

  // if user is not found send 403 - forbidden
  if (!foundUser) return res.sendStatus(403);

  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);

    const roles = Object.values(foundUser.roles);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
