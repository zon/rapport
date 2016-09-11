var _ = require('lodash')
var randomstring = require('randomstring')
var express = require('express')
var mongoose = require('mongoose')

var settings = require('../common/settings')
var config = require('../common/config')
var session = require('../common/session')
var User = require('./user')

var failMessage = 'Invalid email and password combination.'

var router = express.Router()

router.route('/')
	.get((req, res, next) => {
		if (!req.session.userId) return res.json(null);
		User.findById(req.session.userId)
			.then(user => {
				if (!user) return res.json(null);

				if (!settings.production)
					console.log('  User:', user.email)

				res.json(user.toPublicObject())
			})
			.catch(next)
	})
	.post((req, res, next) => {
		if (!req.body.email || !req.body.password) return res.badRequest({
			message: 'Both fields are required.'
		});

		User.findOne({email: req.body.email})
			.then(user => {
				if (!user) return res.badRequest({message: failMessage});
				
				if (user.checkPassword(req.body.password)) {
					req.session.userId = user.id
					res.json(user.toPublicObject())

				} else {
					res.badRequest({message: failMessage})
				}

			})
			.catch(next)

	})

router.use(session.check)

router.route('/')
	.delete((req, res, next) => {
		req.session.userId = null
		res.json(true)
	})

module.exports = router