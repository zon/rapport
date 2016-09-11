var http = require('http')
var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var expressSession = require('express-session')
var RedisStore = require('connect-redis')(expressSession)
var Promise = require('bluebird')
var mongoose = require('mongoose')

var settings = require('./common/settings')
var config = require('./common/config')

var sessions = require('./routes/session')
var users = require('./routes/users')

mongoose.Promise = Promise
mongoose.connect('mongodb://localhost/'+ settings.db)

var app = express()

if (!settings.production || config.logging) {
	app.use(function(req, res, next) {
		console.log(req.method +" "+ req.url)
		next()
	})
}

app.use(bodyParser.json())
app.use(cookieParser(settings.cookieSecret))
app.use(expressSession({
	secret: settings.cookieSecret,
	cookie: {maxAge: 3600*24*365*10},
	store: new RedisStore({
		host: settings.redis.host,
		port: settings.redis.port
	}),
	resave: false,
	saveUninitialized: false
}))

app.use(function(req, res, next) {

    res.badRequest = function(msg) {
        res.status(400).json(msg || "Bad request")
    }
    res.unauthorized = function(msg) {
        res.status(401).json(msg || "Unauthorized")
    }
    res.forbidden = function(msg) {
        res.status(403).json(msg || "Forbidden")
    }
    res.notFound = function(msg) {
        res.status(404).json(msg || "Not found")
    }

    next()
})

app.use('/sessions', sessions)
app.use('/users', users)

app.use(function(req, res) {
    res.notFound('Not found!')
})

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    console.error(err.stack)
    res.status(500).send('Server error!')
})

var server = http.createServer(app)
server.on('error', console.error)
server.listen(8080, function() {console.log('Rapport ready!')})

module.exports = server