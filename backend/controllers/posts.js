const postsRouter = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

postsRouter.get("/", async (req, res) => {
  // reference to document in another collection
  const posts = await Post.find({}).populate("user", {
    name: 1,
    email: 1,
		timestamp: 1,
		postStatus: 1,
  });
  res.json(posts.map((post) => post.toJSON()));
});

postsRouter.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    res.json(post.toJSON());
  } else {
    res.status(404).end();
  }
});

const getTokenFrom = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

postsRouter.post("/", async (req, res) => {
  const body = req.body;
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);
  const post = new Post({
    title: body.title,
    description: body.description,
    user: user._id,
    latitude: body.latitude,
    longitude: body.longitude,
    timestamp: body.timestamp,
		postStatus: body.postStatus,
  });
  if (!body.title) {
    res.status(400).end();
  } else {
    const savedPost = await post.save();
    user.posts = user.posts.concat(savedPost._id);
    await user.save();
    res.status(201).json(savedPost);
  }
});

postsRouter.put("/:id", async (req, res) => {
  const body = req.body;
  const post = {
    title: body.title,
    description: body.description,
    user: body.user.id,
    latitude: body.latitude,
    longitude: body.longitude,
    timestamp: body.timestamp,
		postStatus: body.postStatus,
  };
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, post, {
    new: true,
  });
  res.json(updatedPost);
});

postsRouter.delete("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);

  if (post.user.toString() !== user.id.toString()) {
    return res
      .status(401)
      .json({ error: "No permission to remove the post" });
  } else {
    await Post.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }
});

module.exports = postsRouter;
