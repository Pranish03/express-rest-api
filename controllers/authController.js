const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../model/User");

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // look for the username in db
  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser) return res.sendStatus(401);

  //evaluate password
  const match = await bcrypt.compare(password, foundUser.password);

  if (match) {
    const roles = Object.values(foundUser.roles);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // saving refreshToken with current users
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();

    console.log(result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
};

module.exports = { handleLogin };
