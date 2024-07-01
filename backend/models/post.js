const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	location: {
		type: String,
		required: true,
	},
	timestamp: Date,
})

postSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

const Post = mongoose.model('Post', postSchema, 'posts')

module.exports = Post;