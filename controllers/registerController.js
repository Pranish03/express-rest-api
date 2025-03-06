const bcrypt = require("bcrypt");

const User = require("../model/User");

const handleNewUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // check for duplicate username in db
  const duplicate = await User.findOne({ username }).exec();

  // if duplicate send 409 - conflict
  if (duplicate) return res.sendStatus(409);

  try {
    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create and store new user
    const result = await User.create({
      username: username,
      password: hashedPassword,
    });

    console.log(result);

    // send 201 - created
    res.status(201).json({ success: `New user ${username} created!` });
  } catch (err) {
    // send 500 - internal server error
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
