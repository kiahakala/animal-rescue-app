const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (req, res) => {
  const { name, password } = req.body;

  const user = await User.findOne({ name });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: "Invalid username or password",
    });
  }

  const userForToken = {
    name: user.name,
    id: user._id,
  };

	console.log(userForToken.id.toString())

  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: '1h',
  });

	const decodedToken = jwt.verify(token, process.env.SECRET);

	console.log(decodedToken.exp.toLocaleString())

  res.status(200).send({ token, decodedToken, id: user._id.toString(), name: user.name, email: user.email });
});

module.exports = loginRouter;
