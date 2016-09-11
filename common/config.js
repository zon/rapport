var path = require('path')
var fs = require('fs')

var configFile = path.normalize(__dirname +'/../config.json')

var json = JSON.parse(fs.readFileSync(configFile, 'utf8'))

module.exports = json