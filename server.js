const express = require('express');

const server = express();

// parses to body into json
server.use(express.json());
server.use(logger);

// importing the user router from the user folder.
const userRouter = require('./users/userRouter.js');
//applying the router to the route we want to use it with
server.use('/api/users', userRouter);

server.get('/', (req, res) => {
	res.send(`<h2>Let's write some middleware!</h2>`);
});

//custom middleware

function logger(req, res, next) {
	console.log(req.method, req.url, new Date().toISOString());
	next();
}

module.exports = server;
