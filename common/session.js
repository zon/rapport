var User = require('../user')

module.exports = {

	check: function(req, res, next) {
		if (!req.session.userId) return res.unauthorized();
		User.findById(req.session.userId, function(err, user) {
			if (err) return next(err);
			if (!user) return res.unauthorized();
			req.user = user
			next()
		})
	}

}