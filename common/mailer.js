var Promise = require('bluebird')
var nodemailer = require('nodemailer')
var mustache = require('mustache')
var config = require('../common/config')

var transport = Promise.promisifyAll(nodemailer.createTransport(mustache.render(
	'smtps://{{user}}:{{password}}@{{host}}', config.smtp
)))

module.exports = {

	send: function(options) {
		return transport.sendMailAsync(options)
	}

}