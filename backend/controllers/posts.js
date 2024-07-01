const postsRouter = require('express').Router()
const Post = require('../models/post')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


postsRouter.get('/', async (request, response) => {
	// reference to document in another collection
	const posts = await Post.find({}).populate('user', { name: 1, email: 1, location: 1 })
	response.json(posts.map(post => post.toJSON()))
})

postsRouter.get('/:id', async (request, response) => {
	const post = await Post.findById(request.params.id)
	if (post) {
		response.json(post.toJSON())
	} else {
		response.status(404).end()
	}
})

const getTokenFrom = request => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		return authorization.substring(7)
	} return null
}

postsRouter.post('/', async (request, response) => {
	const body = request.body
	const token = getTokenFrom(request)
	const decodedToken = jwt.verify(token, process.env.SECRET)
	if (!token || !decodedToken.id) {
		return response.status(401).json({ error: 'Token missing or invalid' })
	}
	const user = await User.findById(decodedToken.id)
	const post = new Post({
		title: body.title,
		description: body.description,
		user: user._id,
		location: body.location,
		timestamp: body.timestamp
	})
	if (!body.location || !body.title) {
		response.status(400).end()
	} else {
		const savedPost = await post.save()
		user.posts = user.posts.concat(savedPost._id)
		await user.save()
		response.status(201).json(savedPost.toJSON())
	}
})

postsRouter.put('/:id', async (request, response) => {
	const body = request.body
	const post = {
		title: body.title,
		description: body.description,
		user: body.user.id,
		location: body.location,
		timestamp: body.timestamp
	}
	const updatedPost = await Post.findByIdAndUpdate(request.params.id, post, { new: true })
	response.json(updatedPost)
})

postsRouter.delete('/:id', async (request, response) => {
	const post = await Post.findById(request.params.id)
	const token = getTokenFrom(request)
	const decodedToken = jwt.verify(token, process.env.SECRET)
	const user = await User.findById(decodedToken.id)

	if (post.user.toString() !== user.id.toString()) {
		return response.status(401).json({ error: 'No permission to remove the post' })
	} else {
		await Post.findByIdAndDelete(request.params.id)
		response.status(204).end()
	}
})

module.exports = postsRouter

