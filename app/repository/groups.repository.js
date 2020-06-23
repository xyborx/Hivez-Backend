const storage = require('../utils/storage.utils');

const find_group_by_name = async (user_id, group_name) => {
	try {
		const res = await storage({
			name: 'find_group_by_name',
			text: `SELECT g.group_id, g.group_name, g.group_description, COUNT(gm.group_member_id) AS member_count
				   FROM groups AS g
				   LEFT JOIN (
						SELECT group_member_id, group_id
						FROM groups_members
						WHERE is_left='N' AND user_id!=$1 
				   ) AS gm ON (g.group_id=gm.group_id)
				   WHERE g.group_name LIKE '%' || $2 || '%'
				   AND g.is_deleted='N'
				   GROUP BY g.group_id`,
			values: [user_id, group_name],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const count_group = async (group_id) => {
	try {
		const res = await storage({
			name: 'count_group',
			text: 'SELECT group_id FROM groups WHERE group_id=$1',
			values: [group_id],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const count_duplicate_group_member = async (group_id, user_id) => {
	try {
		const res = await storage({
			name: 'count_duplicate_group_member',
			text: 'SELECT group_member_id FROM groups_members WHERE group_id=$1 AND user_id=$2',
			values: [group_id, user_id],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_group = async (group_name, group_description, group_picture) => {
	try {
		const res = await storage({
			name: 'create_group',
			text: 'INSERT INTO groups (group_name, group_description, group_picture) VALUES ($1, $2, $3) RETURNING group_id',
			values: [group_name, group_description, group_picture],
		});
		return Promise.resolve(res.rows[0]['group_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_group_member = async (group_id, user_id, role) => {
	try {
		const res = await storage({
			name: 'create_group_member',
			text: 'INSERT INTO groups_members (user_id, group_id, role) VALUES ($1, $2, $3) RETURNING group_member_id',
			values: [user_id, group_id, role],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const recreate_group_member = async (group_id, user_id) => {
	try {
		const res = await storage({
			name: 'recreate_group_member',
			text: `UPDATE groups_members SET is_left='N', left_date=NULL, role='MEMBER', join_date=CURRENT_TIMESTAMP WHERE group_id=$1 AND user_id=$2`,
			values: [user_id, group_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const delete_group = async (group_id) => {
	try {
		const res = await storage({
			name: 'delete_group',
			text: `UPDATE groups SET is_deleted='Y', deleted_date=CURRENT_TIMESTAMP WHERE group_id=$1`,
			values: [group_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_detail = async (group_id) => {
	try {
		const res = await storage({
			name: 'get_group_detail',
			text: 'SELECT group_id, group_name, group_description, is_searchable, group_balance FROM groups WHERE group_id=$1',
			values: [group_id],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_group_detail = async (group_id, group_name, group_description) => {
	try {
		const res = await storage({
			name: 'update_group_detail',
			text: 'UPDATE groups SET group_name=$1, group_description=$2 WHERE group_id=$3',
			values: [group_name, group_description, group_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_group_searchable = async (group_id, is_searchable) => {
	try {
		const res = await storage({
			name: 'update_group_searchable',
			text: 'UPDATE groups SET is_searchable=$1 WHERE group_id=$2',
			values: [is_searchable, group_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_picture = async (group_id) => {
	try {
		const res = await storage({
			name: 'get_group_picture',
			text: 'SELECT group_picture FROM groups WHERE group_id=$1',
			values: [group_id],
		});
		return Promise.resolve(res.rows[0]['group_picture']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_group_picture = async (group_id, group_picture) => {
	try {
		const res = await storage({
			name: 'update_group_picture',
			text: 'UPDATE groups SET group_picture=$1 WHERE group_id=$2',
			values: [group_picture, group_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_members = async (group_id) => {
	try {
		const res = await storage({
			name: 'get_group_members',
			text: `SELECT u.user_id, u.user_name, gm.role, u.full_name, gm.join_date, COALESCE(u.user_picture, '') AS user_picture
				   FROM groups_members AS gm
				   INNER JOIN users AS u ON (u.user_id=gm.user_id)
				   WHERE is_left='N' AND group_id=$1;`,
			values: [group_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const delete_group_member = async (group_id, user_id) => {
	try {
		const res = await storage({
			name: 'delete_group_member',
			text: `UPDATE groups_members SET is_left='Y', left_date=CURRENT_TIMESTAMP, is_favourite='N' WHERE group_id=$1 AND user_id=$2`,
			values: [group_id, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_group_member_role = async (group_id, user_id, role) => {
	try {
		const res = await storage({
			name: 'update_group_picture',
			text: 'UPDATE groups_members SET role=$1 WHERE group_id=$2 AND user_id=$3',
			values: [role, group_id, user_id],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_report = async (group_id, start_date, end_date) => {
	try {
		const res = await storage({
			name: 'get_group_report',
			text: `SELECT r.request_id AS id, r.request_description AS description, r.request_amount AS amount, r.request_type AS type, r.request_date AS date,
						u.full_name AS requester_name, COALESCE(u.user_picture, '') AS requester_picture, 'REQUEST' AS source
				   FROM requests r
				   INNER JOIN users u ON (r.requester_user_id=u.user_id)
				   WHERE r.approval_status='APPROVED'
				   AND r.source_id=$1 AND source_type='GROUP'
				   AND r.request_date BETWEEN TO_TIMESTAMP($2,'YYYY-MM-DD') AND TO_TIMESTAMP($3,'YYYY-MM-DD')
				   UNION
				   SELECT bp.bill_payment_id AS id, b.bill_description AS description, b.bill_amount AS amount, 'INCOME' AS type, bp.payment_date AS date,
						u.full_name AS requester_name, COALESCE(u.user_picture, '') AS requester_picture, 'BILL' AS source
				   FROM bill_payments bp
				   INNER JOIN bills b ON (bp.bill_id=b.bill_id)
				   INNER JOIN users u ON (bp.payer_user_id=u.user_id)
				   WHERE bp.approval_status='APPROVED'
				   AND b.group_id=$1
				   AND bp.payment_date BETWEEN TO_TIMESTAMP($2,'YYYY-MM-DD') AND TO_TIMESTAMP($3,'YYYY-MM-DD')`,
			values: [group_id, start_date, end_date],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_report_count = async (group_id, start_date, end_date, type) => {
	try {
		const res = await storage({
			name: 'get_group_report_count',
			text: `SELECT SUM(trx.amount) AS total FROM (
						SELECT r.request_id AS id, r.request_description AS description, r.request_amount AS amount, r.request_type AS type, r.request_date AS date,
							u.full_name AS requester_name, COALESCE(u.user_picture, '') AS requester_picture, 'REQUEST' AS source
						FROM requests AS r
						INNER JOIN users u ON (r.requester_user_id=u.user_id)
						WHERE r.approval_status='APPROVED'
						AND r.source_id=$1 AND source_type='GROUP'
						AND r.request_date BETWEEN TO_TIMESTAMP($2,'YYYY-MM-DD') AND TO_TIMESTAMP($3,'YYYY-MM-DD')
						UNION
						SELECT bp.bill_payment_id AS id, b.bill_description AS description, b.bill_amount AS amount, 'INCOME' AS type, bp.payment_date AS date,
							u.full_name AS requester_name, COALESCE(u.user_picture, '') AS requester_picture, 'BILL' AS source
						FROM bill_payments AS bp
						INNER JOIN bills b ON (bp.bill_id=b.bill_id)
						INNER JOIN users u ON (bp.payer_user_id=u.user_id)
						WHERE bp.approval_status='APPROVED'
						AND b.group_id=$1
						AND bp.payment_date BETWEEN TO_TIMESTAMP($2,'YYYY-MM-DD') AND TO_TIMESTAMP($3,'YYYY-MM-DD')
					) AS trx WHERE trx.type=$4`,
			values: [group_id, start_date, end_date, type],
		});
		return Promise.resolve(res.rows[0]['total']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_balance = async (group_id) => {
	try {
		const res = await storage({
			name: 'get_group_balance',
			text: `SELECT group_balance FROM groups WHERE group_id=$1`,
			values: [group_id],
		});
		return Promise.resolve(res.rows[0]['group_balance']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const find_joinable_group = async (user_id) => {
	try {
		const res = await storage({
			name: 'find_joinable_group',
			text: `SELECT g.group_id, g.group_name, COALESCE(g.group_description, '') AS group_description,
						COALESCE(g.group_picture, '') AS group_picture, (
							SELECT COUNT(group_member_id) FROM groups_members AS c WHERE c.group_id=g.group_id AND c.is_left='N'
						) AS member_count
				   FROM groups AS g
				   LEFT JOIN groups_members AS gm ON (gm.user_id=$1 AND gm.group_id=g.group_id AND gm.is_left='N')
				   WHERE g.is_deleted='N'`,
			values: [user_id],
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_group_balance = async (group_id, type, amount) => {
	try {
		const res = await storage({
			name: 'update_group_balance',
			text: `UPDATE groups SET group_balance=
					CASE
						WHEN $2='INCOME' THEN (group_balance + $3)
						ELSE (group_balance - $3)
					END
					WHERE group_id=$1`,
			values: [group_id, type, amount],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

module.exports = {
	find_group_by_name,
	count_group,
	count_duplicate_group_member,
	create_group,
	create_group_member,
	recreate_group_member,
	delete_group,
	get_group_detail,
	update_group_detail,
	update_group_searchable,
	get_group_picture,
	update_group_picture,
	get_group_members,
	update_group_member_role,
	delete_group_member,
	get_group_report,
	get_group_report_count,
	get_group_balance,
	find_joinable_group,
	update_group_balance
};