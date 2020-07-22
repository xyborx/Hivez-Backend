const storage = require('../utils/storage.utils');

const find_event_by_name = async (user_id, event_name) => {
	try {
		const res = await storage({
			name: 'find_event_by_name',
			text: `SELECT e.event_id, w.event_name, e.event_description, COUNT(em.event_member_id) AS member_count
				   FROM events AS g
				   LEFT JOIN (
						SELECT event_member_id, event_id
						FROM events_members
						WHERE is_left='N' AND user_id!=$1 
				   ) AS gm ON (e.event_id=em.event_id)
				   WHERE e.event_name LIKE '%' || $2 || '%'
				   AND e.is_deleted='N'
				   GROUP BY e.event_id`,
			values: [user_id, event_name],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const count_event = async (event_id) => {
	try {
		const res = await storage({
			name: 'count_event',
			text: 'SELECT event_id FROM events WHERE event_id=$1',
			values: [event_id],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const count_duplicate_event_member = async (event_id, user_id) => {
	try {
		const res = await storage({
			name: 'count_duplicate_event_member',
			text: 'SELECT event_member_id FROM events_members WHERE event_id=$1 AND user_id=$2',
			values: [event_id, user_id],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_event = async (event_name, event_description, event_picture) => {
	try {
		const res = await storage({
			name: 'create_event',
			text: 'INSERT INTO events (event_name, event_description, event_picture) VALUES ($1, $2, $3) RETURNING event_id',
			values: [event_name, event_description, event_picture],
		});
		return Promise.resolve(res.rows[0]['event_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_event_member = async (event_id, user_id, role) => {
	try {
		const res = await storage({
			name: 'create_event_member',
			text: 'INSERT INTO events_members (user_id, event_id, role) VALUES ($1, $2, $3) RETURNING event_member_id',
			values: [user_id, event_id, role],
		});
		return Promise.resolve(res.rows[0]['event_member_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const recreate_event_member = async (event_id, user_id) => {
	try {
		const res = await storage({
			name: 'recreate_event_member',
			text: `UPDATE events_members SET is_left='N', left_date=NULL, role='MEMBER', join_date=CURRENT_TIMESTAMP WHERE event_id=$1 AND user_id=$2`,
			values: [user_id, event_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const delete_event = async (event_id) => {
	try {
		const res = await storage({
			name: 'delete_event',
			text: `UPDATE events SET is_deleted='Y', deleted_date=CURRENT_TIMESTAMP WHERE event_id=$1`,
			values: [event_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_event_detail = async (event_id, user_id) => {
	try {
		const res = await storage({
			name: 'get_event_detail',
			text: `SELECT e.event_id, e.event_name, e.event_description, e.is_searchable, e.total_expense, em.role AS user_role
					FROM events AS e
					INNER JOIN events_members AS em ON (e.event_id=em.event_id)
					WHERE e.event_id=$1
					AND em.user_id=$2`,
			values: [event_id, user_id],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_event_detail = async (event_id, event_name, event_description) => {
	try {
		const res = await storage({
			name: 'update_event_detail',
			text: 'UPDATE events SET event_name=$1, event_description=$2 WHERE event_id=$3',
			values: [event_name, event_description, event_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_event_searchable = async (event_id, is_searchable) => {
	try {
		const res = await storage({
			name: 'update_event_searchable',
			text: 'UPDATE events SET is_searchable=$1 WHERE event_id=$2',
			values: [is_searchable, event_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_event_picture = async (event_id) => {
	try {
		const res = await storage({
			name: 'get_event_picture',
			text: 'SELECT event_picture FROM events WHERE event_id=$1',
			values: [event_id],
		});
		return Promise.resolve(res.rows[0]['event_picture']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_event_picture = async (event_id, event_picture) => {
	try {
		const res = await storage({
			name: 'update_event_picture',
			text: 'UPDATE events SET event_picture=$1 WHERE event_id=$2',
			values: [event_picture, event_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_event_members = async (event_id) => {
	try {
		const res = await storage({
			name: 'get_event_members',
			text: `SELECT u.user_id, u.user_name, em.role, u.full_name, em.join_date, COALESCE(u.user_picture, '') AS user_picture
				   FROM events_members AS em
				   INNER JOIN users AS u ON (u.user_id=em.user_id)
				   WHERE is_left='N' AND event_id=$1;`,
			values: [event_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const delete_event_member = async (event_id, user_id) => {
	try {
		const res = await storage({
			name: 'delete_event_member',
			text: `UPDATE events_members SET is_left='Y', left_date=CURRENT_TIMESTAMP, is_favourite='N' WHERE event_id=$1 AND user_id=$2`,
			values: [event_id, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_event_member_role = async (event_id, user_id, role) => {
	try {
		const res = await storage({
			name: 'update_event_picture',
			text: 'UPDATE events_members SET role=$1 WHERE event_id=$2 AND user_id=$3',
			values: [role, event_id, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_event_report = async (event_id, start_date, end_date) => {
	try {
		const res = await storage({
			name: 'get_event_report',
			text: `SELECT r.request_id AS id, r.request_description AS description, r.request_amount AS amount, r.request_type AS type, r.request_date AS date,
						u.full_name AS full_name, u.user_picture AS user_picture
				   FROM requests r
				   INNER JOIN users u ON (r.requester_user_id=u.user_id)
				   WHERE r.approval_status='APPROVED'
				   AND r.request_date BETWEEN $1 AND $2
				   AND r.source_id=$3 AND source_type='EVENT'`,
			values: [start_date, end_date, event_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_event_expense = async (event_id, amount) => {
	try {
		const res = await storage({
			name: 'update_event_expense',
			text: `UPDATE events SET total_expense=total_expense+$2 WHERE event_id=$1`,
			values: [event_id, amount],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

module.exports = {
	find_event_by_name,
	count_event,
	count_duplicate_event_member,
	create_event,
	create_event_member,
	recreate_event_member,
	delete_event,
	get_event_detail,
	update_event_detail,
	update_event_searchable,
	get_event_picture,
	update_event_picture,
	get_event_members,
	update_event_member_role,
	delete_event_member,
	get_event_report,
	update_event_expense
};