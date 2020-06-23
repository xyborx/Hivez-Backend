const devConfiguration = require('./environment/dev.env');
const prodConfiguration = require('./environment/prod.env');

module.exports = (process.argv.includes('PROD=TRUE', 2)) ? prodConfiguration : devConfiguration;