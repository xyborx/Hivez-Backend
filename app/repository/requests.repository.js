const storage = require('../utils/storage.utils');

const count_request = async (request_id) => {
	try {
		const res = await storage({
			name: 'count_request',
			text: 'SELECT request_id FROM requests WHERE request_id=$1',
			values: [request_id],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_request = async (requester_user_id, source_id, source_type, request_description, request_amount, request_type, receipt_picture, request_date) => {
	try {
		const res = await storage({
			name: 'create_request',
			text: `INSERT INTO requests (requester_user_id, source_id, source_type, request_description, request_amount, request_type, receipt_picture, request_date)
				   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING request_id`,
			values: [requester_user_id, source_id, source_type, request_description, request_amount, request_type, receipt_picture, request_date],
		});
		return Promise.resolve(res.rows[0]['request_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_requests_payees = async (request_id, payee_user_id, amount) => {
	try {
		const res = await storage({
			name: 'create_requests_payees',
			text: 'INSERT INTO requests_payees (request_id, payee_user_id, amount) VALUES ($1, $2, $3)',
			values: [request_id, payee_user_id, amount],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_request_detail = async (request_id) => {
	try {
		const res = await storage({
			name: 'get_request_detail',
			text: `SELECT r.request_id, u.full_name AS requester_name, r.request_description, r.request_amount, r.request_type,
						  r.receipt_picture, r.request_date, r.created_date, COALESCE(r.approval_status, '') AS approval_status,
						  COALESCE((SELECT full_name FROM users WHERE r.approver_user_id=users.user_id), '') AS approver_name,
						  r.approval_date, r.source_id, r.source_type
				   FROM requests AS r
				   INNER JOIN users AS u ON (r.requester_user_id=u.user_id)
				   WHERE r.request_id=$1`,
			values: [request_id],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_request_payees = async (request_id) => {
	try {
		const res = await storage({
			name: 'get_request_payees',
			text: `SELECT u.user_id, u.full_name, u.user_name, u.user_picture, em.role, rp.amount
				   FROM requests_payees AS rp
				   INNER JOIN users AS u ON (rp.payee_user_id=u.user_id)
				   INNER JOIN requests AS r ON (rp.request_id=r.request_id)
				   INNER JOIN events_members AS em ON (em.user_id=u.user_id AND em.event_id=r.source_id)
				   WHERE rp.request_id=$1`,
			values: [request_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_request_approval = async (request_id, approver_user_id, approval_status) => {
	try {
		const res = await storage({
			name: 'update_request_approval',
			text: `UPDATE requests SET approval_status=$1, approver_user_id=$2, approval_date=CURRENT_TIMESTAMP
					WHERE request_id=$3 RETURNING requester_user_id, source_id, source_type, request_type, request_amount`,
			values: [approval_status, approver_user_id, request_id],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_request_list = async (source_id) => {
	try {
		const res = await storage({
			name: 'get_request_list',
			text: `SELECT * FROM
				   (SELECT * FROM (SELECT r.request_id, r.request_description, r.request_amount, r.created_date, r.request_date, r.request_type,
				   COALESCE(r.approval_status, '') as approval_status, u.full_name AS requester_name,
				   COALESCE((SELECT users.full_name FROM users WHERE r.approver_user_id=users.user_id), '') AS approver_name, COALESCE(u.user_picture, '') AS requester_picture
				   FROM requests AS r
				   INNER JOIN users AS u ON (r.requester_user_id=u.user_id)
				   WHERE r.source_id=$1
				   AND r.approval_status IS NULL
				   ORDER BY r.created_date DESC
				   LIMIT 5) AS on_progress
				   UNION
				   SELECT * FROM (SELECT r.request_id, r.request_description, r.request_amount, r.created_date, r.request_date, r.request_type,
				   COALESCE(r.approval_status, '') as approval_status, u.full_name AS requester_name,
				   COALESCE((SELECT users.full_name FROM users WHERE r.approver_user_id=users.user_id), '') AS approver_name, COALESCE(u.user_picture, '') AS requester_picture
				   FROM requests AS r
				   INNER JOIN users AS u ON (r.requester_user_id=u.user_id)
				   WHERE r.source_id=$1
				   AND r.approval_status='APPROVED'
				   ORDER BY r.created_date DESC
				   LIMIT 5) AS approved
				   UNION
				   SELECT * FROM (SELECT r.request_id, r.request_description, r.request_amount, r.created_date, r.request_date, r.request_type,
				   COALESCE(r.approval_status, '') as approval_status, u.full_name AS requester_name,
				   COALESCE((SELECT users.full_name FROM users WHERE r.approver_user_id=users.user_id), '') AS approver_name, COALESCE(u.user_picture, '') AS requester_picture
				   FROM requests AS r
				   INNER JOIN users AS u ON (r.requester_user_id=u.user_id)
				   WHERE r.source_id=$1
				   AND r.approval_status='REJECTED'
				   ORDER BY r.created_date DESC
				   LIMIT 5) AS rejected) AS req ORDER BY created_date DESC`,
			values: [source_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

module.exports = {
	count_request,
	create_request,
	create_requests_payees,
	get_request_detail,
	get_request_payees,
	update_request_approval,
	get_request_list
};