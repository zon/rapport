
var env = process.env.NODE_ENV

module.exports = {
	env: env,
	production: env == 'production',
	db: 'rapport',
	redis: {
		host: '127.0.0.1',
		port: 6379
	},
	cookieSecret: 'onrn5b7co5gs7h7huabg',
	resetPasswordExpiration: 3, // hours
}