const bcrypt = require("bcryptjs");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (req, res) => {
  // reference to document in another collection
  const users = await User.find({}).populate("posts", {
    title: 1,
    description: 1,
    location: 1,
    timestamp: 1,
  });
  res.json(users.map((u) => u.toJSON()));
});

usersRouter.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user.toJSON());
  } else {
    res.status(404).end();
  }
});

usersRouter.post("/", async (req, res) => {
  const body = req.body;
  const users = await User.find({});

  if (!body.name || !body.password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  if (body.name.length < 3 || body.password.length < 3) {
    return res.status(400).json({
      error: "Minimum length of username and password is 3 characters!",
    });
  }
  if (
    users.some((user) => user.name === body.name || user.email === body.email)
  ) {
    return res.status(400).json({
      error: `Username ${body.name} or email address ${body.email} already exists, please enter another one`,
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);
  const user = new User({
    name: body.name,
    email: body.email,
    passwordHash,
    location: body.location,
  });

  const savedUser = await user.save();
  res.json(savedUser);
});

module.exports = usersRouter;
