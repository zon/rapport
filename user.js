var _ = require('lodash')
var crypto = require('crypto')
var jwt = require('jsonwebtoken')
var mongoose = require('mongoose')
var Promise = require('bluebird')

var config = require('./common/config')

Promise.promisifyAll(crypto)

var schema = new mongoose.Schema({
	email: {type: String, trim: true, lowercase: true},
	salt: {type: String},
	hash: {type: String},
	reset: {
		code: {type: String},
		expires: {type: Date}
	},
	created: {type: Date, default: Date.now},
	modified: {type: Date, default: Date.now}
})

var hash = function(salt, password) {
	return crypto
		.createHmac('sha256', salt)
		.update(password)
		.digest('hex')
}

var User = mongoose.model('User', schema)

User.prototype.hashPassword = function(password) {
	var self = this
	return crypto.randomBytesAsync(32).then(buffer => {
		var salt = buffer.toString('hex')
		self.salt = salt
		self.hash = hash(salt, password)
		return self
	})
}

User.prototype.checkPassword = function(password) {
	return hash(this.salt, password) == this.hash
}

User.prototype.toPublicObject = function() {
	return _.omit(this.toObject(), ['salt', 'hash', 'reset'])
}

User.prototype.toJsonWebToken = function() {
	return new Promise((resolve, reject) => {
		jwt.sign(this.toPublicObject(), config.jwt.secret, {
			expiresIn: '1m'
		}, (err, token) => {

			console.log('TOKEN', err, token)

			if (err) {
				reject(err)
			} else {
				resolve(token)
			}
		})
	})
}

module.exports = User