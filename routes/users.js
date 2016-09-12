var _ = require('lodash')
var fs = require('fs')
var moment = require('moment')
var express = require('express')
var randomstring = require('randomstring')
var mustache = require('mustache')
var settings = require('../common/settings')
var config = require('../common/config')
var session = require('../common/session')
var mailer = require('../common/mailer')

var User = require('../user')

var emailTemplate = fs.readFileSync(__dirname + '/reset-email.mustache', 'utf8')

var router = express.Router()

router.param('user', (req, res, next, id) => {
	User.findById(id)
		.exec().then(user => {
			if (!user) return res.notFound('User not found.')
			req.user = user
			next()
		})
		.catch(next)
})

router.route('/')
	.post((req, res, next) => {
		if (!req.body.email || !req.body.password) return res.badRequest({
			message: "All fields are required."
		});

		User.findOne({email: req.body.email}).count().then(existing => {
			if (existing) return res.badRequest({message: "Email already in use."});

			var user = new User({email: req.body.email})
			user.hashPassword(req.body.password)
				.then(user => user.save())
				.then(user => {
					req.session.userId = user.id
					user.toJsonWebToken().then(token => res.json({
						user: user.toPublicObject(),
						token: token
					}))
				})
				.catch(next)

		}).catch(next)
	})

router.post('/reset-password/request', (req, res, next) => {
	if (!req.body.email) return res.badRequest({message: 'Email is required.'});

	User.findOne({email: req.body.email})
		.then(user => {
			if (user) {
				user.reset = {
					code: randomstring.generate({
						length: 6,
						readable: true,
						capitalization: 'uppercase'
					}),
					expires: moment().add(settings.resetPasswordExpiration, 'hours').toDate()
				}
				user.save()
					.then(user => {

						if (!settings.production) {
							console.log('Reset code: '+ user.reset.code)
						}

						return mailer.send({
						    from: '"Twister" <no-reply@twisterapp.net>',
						    to: mustache.render('"{{name}} <{{email}}>"', user),
						    subject: 'Twister Password Reset Code',
						    text: mustache.render(emailTemplate, user)
						})
					})
					.then(info => res.json(true))
					.catch(next)

			} else {
				res.badRequest({message: 'Email is not registered.'})
			}

		})
		.catch(next)
})

router.post('/reset-password/validate', (req, res, next) => {
	if (!req.body.email) return res.badRequest({message: 'Email required.'});
	if (!req.body.code) return res.badRequest({message: 'Verification code required.'});

	User.findOne({email: req.body.email, 'reset.code': req.body.code})
		.then(user => {
			if (user) {
				if (new Date() > user.reset.expires) return res.badRequest({message: 'Verication code is expired.'});

				res.json(true)

			} else {
				res.badRequest({message: 'Invalid verication code.'})
			}
		})
		.catch(next)
})

router.post('/reset-password', (req, res, next) => {
	if (!req.body.email) return res.badRequest({message: 'Email required.'});
	if (!req.body.code) return res.badRequest({message: 'Verification code required.'});
	if (!req.body.password || !req.body.confirmPassword) return res.badRequest({message: 'Both fields are required.'});
	if (req.body.password != req.body.confirmPassword) return res.badRequest({message: "Passwords don't match."});

	User.findOne({email: req.body.email, 'reset.code': req.body.code})
		.then(user => {
			if (user) {
				if (new Date().getTime() > user.reset.expires.getTime()) return res.badRequest({message: 'Verication code is expired.'});

				user.reset = null
				user.hashPassword(req.body.password)
					.then(user => user.save())
					.then(user => {
						req.session.userId = user.id
						user.toJsonWebToken().then(token => res.json({
							user: user.toPublicObject(),
							token: token
						}))
					})
					.catch(next)

			} else {
				res.badRequest({message: 'Invalid verication code.'})
			}
		})
		.catch(next)
})

router.get('/:user', (req, res, next) => res.json(req.user.toPublicObject()))

module.exports = router