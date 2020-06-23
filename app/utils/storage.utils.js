const {Pool} = require('pg');
const environment = require('../config/environment.config');

const pool = new Pool(environment.database);

const query = async (input) => {
	const client = await pool.connect()
	try {
		const res = await client.query(input);
		return Promise.resolve(res);
	} finally {
		client.release()
	};
};

module.exports = (input) => query(input).catch(error => {
	throw new Error('Database error: ' + error.stack);
});