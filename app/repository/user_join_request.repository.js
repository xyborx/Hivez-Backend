const storage = require('../utils/storage.utils');

const count_join_request = async (user_join_request_id) => {
	try {
		const res = await storage({
			name: 'count_join_request',
			text: 'SELECT user_join_request_id FROM users_join_requests WHERE user_join_request_id=$1',
			values: [user_join_request_id],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_join_request = async (source_id, source_type, requester_user_id) => {
	try {
		const res = await storage({
			name: 'create_join_request',
			text: 'INSERT INTO users_join_requests (requester_user_id, source_id, source_type) VALUES ($1, $2, $3)',
			values: [requester_user_id, source_id, source_type],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_join_request_list = async (source_id, source_type) => {
	try {
		const res = await storage({
			name: 'get_join_request_list',
			text: `SELECT ujr.user_join_request_id, u.user_name, u.full_name, COALESCE(u.user_picture, '') AS user_picture
				   FROM users_join_requests AS ujr
				   INNER JOIN users AS u ON (u.user_id=ujr.requester_user_id)
				   WHERE ujr.source_id=$1 AND ujr.source_type=$2`,
			values: [source_id, source_type],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_join_approval = async (user_join_request_id, approver_user_id, approval_status) => {
	try {
		const res = await storage({
			name: 'update_join_approval',
			text: `UPDATE users_join_requests SET approval_status=$1, approver_user_id=$2, approval_date=CURRENT_TIMESTAMP
				   WHERE user_join_request_id=$3
				   RETURNING requester_user_id, source_id`,
			values: [approval_status, approver_user_id, user_join_request_id],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_inviteale_user = async (group_id) => {
	try {
		const res = await storage({
			name: 'get_group_inviteale_user',
			text: `SELECT u.user_id, u.user_name, u.full_name, COALESCE(u.user_picture, '') AS user_picture
				   FROM users AS u
				   LEFT JOIN groups_members AS gm ON (u.user_id=gm.user_id AND gm.group_id=$1 AND gm.is_left='N')
				   WHERE gm.user_id IS NULL`,
			values: [group_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_event_inviteale_user = async (event_id) => {
	try {
		const res = await storage({
			name: 'get_event_inviteale_user',
			text: `SELECT u.user_id, u.user_name, u.full_name, COALESCE(u.user_picture, '') AS user_picture
				   FROM users AS u
				   LEFT JOIN events_members AS em ON (u.user_id=em.user_id AND em.event_id=$1 AND em.is_left='N')
				   WHERE em.user_id IS NULL`,
			values: [event_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

module.exports = {
	count_join_request,
	create_join_request,
	get_join_request_list,
	get_group_inviteale_user,
	get_event_inviteale_user,
	update_join_approval
};