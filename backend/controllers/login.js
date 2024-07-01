const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
	const body = request.body

	const user = await User.findOne({ name: body.name })
	const passwordCorrect = user === null
		? false
		: await bcrypt.compare(body.password, user.passwordHash)

	if (!(user && passwordCorrect)) {
		return response.status(401).json({
			error: 'Invalid username or password'
		})
	}

	const userForToken = {
		name: user.name,
		id: user._id,
	}

	const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })

	response
		.status(200)
		.send({ token, name: user.name, email: user.email })
})

module.exports = loginRouter