const express = require('express');
// bringing in the methods from userdb
const User = require('./userDb.js');
const Post = require('../posts/postDb');
const router = express.Router();

router.post('/', validateUser, (req, res) => {
	const { name } = req.body;
	User.insert({ name })
		.then((user) => {
			res.status(201).json(user);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'error inserting user' });
		});
});

router.post('/:id/posts', validateUser, validatePost, (req, res) => {
	const post = req.body;
	Post.insert(post)
		.then((post) => {
			res.status(201).json(post);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Error adding post' });
		});
});

// getting the users array
router.get('/', (req, res) => {
	User.get()
		.then((user) => {
			res.status(200).json(user);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Unable to get users' });
		});
});

// getting a specific user.
router.get('/:id', validateUserId, (req, res) => {
	// const { id } = req.params;
	res.status(200).json(req.user);
	// User.getById(id).then((user) => {
	// 	if (user) {
	// 		res.status(200).json(user);
	// 	} else {
	// 		res.status(404).json({ error: 'User does not exist.' });
	// 	}
	// });
});

router.get('/:id/posts', validateUserId, (req, res) => {
	const { id } = req.params;
	User.getUserPosts(id).then((posts) => res.status(200).json(posts)).catch((err) => {
		console.log(err);
		res.status(500).json({ error: 'Error getting user posts' });
	});
});

router.delete('/:id', validateUserId, (req, res) => {
	const { id } = req.params;
	User.remove(id).then(() => res.status(204).end()).catch((err) => {
		console.log(err);
		res.status(500).json({ error: 'Error deleting user' });
	});
});

// updating a user
router.put('/:id', validateUserId, (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	User.update(id, { name })
		.then((updated) => {
			if (updated) {
				User.getById(id).then((user) => res.status(200).json(user)).catch((err) => {
					console.log(err);
					res.status(500).json({ error: 'Error getting user' });
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Error updating user' });
		});
});

//custom middleware
function validateUserId(req, res, next) {
	const { id } = req.params;
	User.getById(id).then((user) => {
		if (user) {
			req.user = user;
			next();
		} else {
			res.status(400).json({ message: 'invalid user id' });
		}
	});
}

function validateUser(req, res, next) {
	const { name } = req.body;
	if (!name) {
		return res.status(400).json({ message: 'missing user data' });
	}
	if (typeof name !== 'string') {
		return res.status(400).json({ message: 'Name Must be a string' });
	}

	next();
}

function validatePost(req, res, next) {
	const { id: user_id } = req.params;
	const { text } = req.body;
	if (!req.body) {
		return res.status(400).json({ error: 'Post requires body' });
	}
	if (!text) {
		return res.status(400).json({ error: 'Post requires text' });
	}

	req.body = { user_id, text };
	next();
}

module.exports = router;
