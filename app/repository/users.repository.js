const storage = require('../utils/storage.utils');

const find_user_name = async (user_id, user_name) => {
	try {
		const res = await storage({
			name: 'find_user_name',
			text: `SELECT user_id, user_name, full_name, COALESCE(user_picture, '') AS user_picture
				   FROM users
				   WHERE user_id!=$1
				   AND is_deleted='N'
				   AND user_name LIKE '%' || $2 || '%'`,
			values: [user_id, user_name],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const count_user_name = async (user_name) => {
	try {
		const res = await storage({
			name: 'count_user_name',
			text: 'SELECT user_id FROM users WHERE user_name=$1',
			values: [user_name],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const count_user = async (user_id) => {
	try {
		const res = await storage({
			name: 'count_user',
			text: 'SELECT user_id FROM users WHERE user_id=$1',
			values: [user_id],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const count_email = async (email) => {
	try {
		const res = await storage({
			name: 'count_email',
			text: 'SELECT email FROM users WHERE email=$1',
			values: [email],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_user = async (user_name, full_name, email, password) => {
	try {
		const res = await storage({
			name: 'create_user',
			text: 'INSERT INTO users (user_name, full_name, email, password) VALUES ($1, $2, $3, $4) RETURNING user_id',
			values: [user_name, full_name, email, password],
		});
		return Promise.resolve(res.rows[0]['user_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_login_data = async (user_id, login_token) => {
	try {
		const res = await storage({
			name: 'create_login_data',
			text: 'INSERT INTO users_login_data (user_id, login_token) VALUES ($1, $2)',
			values: [user_id, login_token],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_audit_user_login = async (user_id, ip_address, reason) => {
	try {
		const res = await storage({
			name: 'create_audit_user_login',
			text: 'INSERT INTO audit_user_login (user_id, ip_address, reason) VALUES ($1, $2, $3) RETURNING audit_user_login_id',
			values: [user_id, ip_address, reason],
		});
		return Promise.resolve(res.rows[0]['audit_user_login_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const delete_user = async (user_id) => {
	try {
		const res = await storage({
			name: 'delete_user',
			text: `UPDATE users SET is_deleted='Y', deleted_date=CURRENT_TIMESTAMP WHERE user_id=$1`,
			values: [user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_password = async (user_id, password) => {
	try {
		const res = await storage({
			name: 'update_password',
			text: 'UPDATE user SET password=$1 WHERE user_id=$2',
			values: [password, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_audit_change_password = async (user_id, audit_user_login_id) => {
	try {
		const res = await storage({
			name: 'create_audit_change_password',
			text: 'INSERT INTO audit_user_password (user_id, audit_user_login_id) VALUES ($1, $2)',
			values: [user_id, audit_user_login_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_user_profile = async (user_id) => {
	try {
		const res = await storage({
			name: 'get_user_profile',
			text: 'SELECT user_name, full_name, email, is_searchable FROM users WHERE user_id=$1',
			values: [user_id],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_user_profile = async (user_id, user_name, full_name, email) => {
	try {
		const res = await storage({
			name: 'update_user_profile',
			text: 'UPDATE users SET user_name=$1, full_name=$2, email=$3 WHERE user_id=$4',
			values: [user_name, full_name, email, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_user_searchable = async (user_id, is_searchable) => {
	try {
		const res = await storage({
			name: 'update_user_searchable',
			text: 'UPDATE users SET is_searchable=$1 WHERE user_id=$2',
			values: [is_searchable, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_user_picture = async (user_id) => {
	try {
		const res = await storage({
			name: 'get_user_picture',
			text: `SELECT COALESCE(user_picture, '') AS user_picture FROM users WHERE user_id=$1`,
			values: [user_id],
		});
		return Promise.resolve(res.rows[0]['user_picture']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_user_picture = async (user_id, user_picture) => {
	try {
		const res = await storage({
			name: 'update_user_picture',
			text: 'UPDATE users SET user_picture=$1 WHERE user_id=$2',
			values: [user_picture, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_login_data = async (user_id, login_token) => {
	try {
		const res = await storage({
			name: 'update_login_data',
			text: 'UPDATE users_login_data SET login_token=$1, login_date=CURRENT_TIMESTAMP WHERE user_id=$2',
			values: [login_token, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_user_favourites = async (user_id) => {
	try {
		const res = await storage({
			name: 'get_user_favourites',
			text: `SELECT gm.group_id AS id, g.group_name AS name, g.group_description AS description, g.group_picture AS picture, 'GROUP' AS type
				   FROM groups_members AS gm
				   INNER JOIN groups AS g ON (gm.group_id=g.group_id)
				   WHERE gm.user_id=$1
				   AND gm.is_left='N'
				   AND g.is_deleted='N'
				   UNION
				   SELECT em.event_id AS id, e.event_name AS name, e.event_description AS description, e.event_picture AS picture, 'EVENT' AS type
				   FROM events_members AS em
				   INNER JOIN events AS e ON em.event_id=e.event_id
				   WHERE em.user_id=$1
				   AND em.is_left='N'
				   AND e.is_deleted='N'`,
			values: [user_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_user_group = async (user_id) => {
	try {
		const res = await storage({
			name: 'get_user_group',
			text: `SELECT g.group_id, g.group_name, g.group_picture, COUNT(mc.group_member_id) AS member_count
				   FROM groups_members AS gm
				   INNER JOIN groups AS g ON gm.group_id=g.group_id
				   LEFT JOIN (
						SELECT group_member_id, group_id
						FROM groups_members
						WHERE is_left='N'
				   ) AS mc ON (g.group_id=mc.group_id)
				   WHERE gm.user_id=$1
				   AND gm.is_left='N'
				   AND g.is_deleted='N'
				   GROUP BY g.group_id`,
			values: [user_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_user_event = async (user_id) => {
	try {
		const res = await storage({
			name: 'get_user_event',
			text: `SELECT e.event_id, e.event_name, e.event_picture, COUNT(mc.event_member_id) AS member_count
				   FROM events_members AS em
				   INNER JOIN events AS e ON em.event_id=e.event_id
				   LEFT JOIN (
						SELECT event_member_id, event_id
						FROM events_members
						WHERE is_left='N'
				   ) AS mc ON (e.event_id=mc.event_id)
				   WHERE em.user_id=$1
				   AND em.is_left='N'
				   AND e.is_deleted='N'
				   GROUP BY e.event_id`,
			values: [user_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

module.exports = {
	find_user_name,
	count_user,
	count_user_name,
	count_email,
	create_user,
	create_login_data,
	create_audit_user_login,
	delete_user,
	update_password,
	create_audit_change_password,
	get_user_profile,
	update_user_profile,
	update_user_searchable,
	get_user_picture,
	update_user_picture,
	update_login_data,
	get_user_favourites,
	get_user_group,
	get_user_event
};