var Promise = require('bluebird')
var mongoose = require('mongoose')
var settings = require('./settings')

mongoose.Promise = Promise

module.exports = {

	connect: function() {
		return mongoose.connect('mongodb://localhost/'+ settings.db)
	}
	
} 