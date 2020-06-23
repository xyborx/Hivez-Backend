const storage = require('../utils/storage.utils');

const count_bill = async (bill_id) => {
	try {
		const res = await storage({
			name: 'count_bill',
			text: 'SELECT bill_id FROM bills WHERE bill_id=$1',
			values: [bill_id]
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_bill = async (creator_user_id, group_id, bill_description, bill_amount) => {
	try {
		const res = await storage({
			name: 'create_bill',
			text: `INSERT INTO bills (creator_user_id, group_id, bill_description, bill_amount)
				   VALUES ($1, $2, $3, $4) RETURNING bill_id`,
			values: [creator_user_id, group_id, bill_description, bill_amount]
		});
		return Promise.resolve(res.rows[0]['bill_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_bill_creation_detail = async (bill_id) => {
	try {
		const res = await storage({
			name: 'get_bill_creation_detail',
			text: `SELECT b.bill_id, u.full_name AS creator_name, b.bill_description, b.bill_amount, b.creation_date, b.approval_date,
						COALESCE(b.approval_status, '') AS approval_status, COALESCE((SELECT full_name FROM users WHERE b.approver_user_id=users.user_id), '') AS approver_name
				   FROM bills AS b
				   INNER JOIN users AS u ON (b.creator_user_id=u.user_id)
				   WHERE b.bill_id=$1`,
			values: [bill_id]
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_bill_creation_approval = async (bill_id, approver_user_id, approval_status) => {
	try {
		const res = await storage({
			name: 'update_bill_creation_approval',
			text: 'UPDATE bills SET approval_status=$1, approver_user_id=$2, approval_date=CURRENT_TIMESTAMP WHERE bill_id=$3 RETURNING creator_user_id',
			values: [approval_status, approver_user_id, bill_id]
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_bill_list = async (group_id) => {
	try {
		const res = await storage({
			name: 'get_group_bill_list',
			text: `SELECT bp.bill_payment_id, b.bill_description, b.bill_amount, b.creation_date, COALESCE(bp.approval_status, '') AS approval_status,
						COALESCE((SELECT full_name FROM users WHERE bp.approver_user_id=users.user_id), '') AS approver_name, COALESCE(u.user_picture, '') AS requester_picture
				   FROM bill_payments AS bp
				   INNER JOIN bills AS b ON (bp.bill_id=b.bill_id)
				   INNER JOIN users AS u ON (u.user_id=bp.payer_user_id)
				   WHERE b.group_id=$1 AND b.approval_status='APPROVED'`,
			values: [group_id]
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_payable_group_bill_list = async (group_id, user_id) => {
	try {
		const res = await storage({
			name: 'get_payable_group_bill_list',
			text: `SELECT b.bill_id, b.bill_description, b.bill_amount, b.creation_date, COALESCE(bp.approver_name, '') AS approver_name,
						  CASE
							WHEN bp.bill_payment_id IS NULL THEN ''
							ELSE COALESCE(bp.approval_status, 'ON_PROGRESS')
						  END AS approval_status
				   FROM bills AS b
				   LEFT JOIN (
						SELECT * FROM (
							SELECT DISTINCT ON (bp.bill_id, bp.payer_user_id)
								bp.bill_id, bp.bill_payment_id, bp.approval_status,
								u.full_name AS approver_name, bp.payment_date
							FROM bill_payments AS bp
							LEFT JOIN users AS u ON (u.user_id=bp.approver_user_id)
							WHERE bp.payer_user_id=$2
							ORDER BY bp.bill_id, bp.payer_user_id DESC
						) AS bp ORDER BY payment_date DESC
					) AS bp ON (bp.bill_id=b.bill_id)
				   WHERE b.group_id=$1 AND b.approval_status='APPROVED'`,
			values: [group_id, user_id]
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_bill_creation_list = async (group_id) => {
	try {
		const res = await storage({
			name: 'get_bill_creation_list',
			text: `SELECT b.bill_id, b.bill_description, b.bill_amount, b.creation_date,
				   u.full_name AS creator_name, u.user_picture AS creator_picture, b.approval_status
				   FROM bills AS b
				   INNER JOIN users AS u ON (b.creator_user_id=u.user_id)
				   WHERE b.group_id=$1`,
			values: [group_id]
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const count_bill_payment = async (bill_payment_id) => {
	try {
		const res = await storage({
			name: 'count_bill_payment',
			text: 'SELECT bill_payment_id FROM bill_payments WHERE bill_payment_id=$1',
			values: [bill_payment_id]
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_bill_payment = async (bill_id, payer_user_id, receipt_picture) => {
	try {
		const res = await storage({
			name: 'create_bill_payment',
			text: `INSERT INTO bill_payments (bill_id, payer_user_id, receipt_picture)
				   VALUES ($1, $2, $3) RETURNING bill_payment_id`,
			values: [bill_id, payer_user_id, receipt_picture]
		});
		return Promise.resolve(res.rows[0]['bill_payment_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_bill_payment_detail = async (bill_payment_id) => {
	try {
		const res = await storage({
			name: 'get_bill_detail',
			text: `SELECT bp.bill_payment_id, u.full_name AS payer_name, bp.receipt_picture, bp.payment_date, COALESCE(bp.approval_status, '') AS approval_status,
						COALESCE((SELECT full_name FROM users WHERE bp.approver_user_id=users.user_id), '') AS approver_name,
						bp.approval_date, b.bill_amount, b.bill_description
				   FROM bill_payments AS bp
				   INNER JOIN bills AS b ON (b.bill_id=bp.bill_id)
				   INNER JOIN users AS u ON (bp.payer_user_id=u.user_id)
				   WHERE bp.bill_payment_id=$1`,
			values: [bill_payment_id]
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_bill_payment_approval = async (bill_payment_id, approver_user_id, approval_status) => {
	try {
		const res = await storage({
			name: 'update_bill_payment_approval',
			text: `UPDATE bill_payments SET approval_status=$1, approver_user_id=$2, approval_date=CURRENT_TIMESTAMP
					WHERE bill_payment_id=$3 RETURNING payer_user_id, bill_id`,
			values: [approval_status, approver_user_id, bill_payment_id]
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_bill_payment_list = async (group_id, user_id) => {
	try {
		const res = await storage({
			name: 'get_bill_list',
			text: `SELECT b.bill_id, b.bill_description, b.bill_amount, b.creation_date, bp.bill_payment_id,
						bp.approval_status, (SELECT users.full_name FROM users WHERE bp.approver_user_id=users.user_id) AS approver_name
				   FROM bill AS b
				   LEFT JOIN (
					 SELECT DISTINCT ON (bill_id, payer_user_id), approval_status, approver_user_id, bill_payment_id, payment_date
					 FROM bill_payments
					 WHERE bill_id=b.bill_id AND payer_user_id=$1 ORDER BY payment_date DESC
				   ) AS bp ON (b.group_id=bp.group_id)
				   WHERE b.group_id=$2
				   AND b.approval_status='APPROVED'
				   ORDER BY bp.payment_date`,
			values: [user_id, group_id]
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_group_bill_payment_list = async (group_id) => {
	try {
		const res = await storage({
			name: 'get_group_bill_payment_list',
			text: `SELECT bp.bill_payment_id, b.bill_description, b.bill_amount, bp.payment_date,
						bp.approval_status, (SELECT users.full_name FROM users WHERE bp.approver_user_id=users.user_id) AS approver_name, u.user_picture
				   FROM bill_payments AS bp
				   INNER JOIN bills AS b ON (bp.bill_id=b.bill_id)
				   INNER JOIN users AS u ON (u.user_id=bp.payer_user_id)
				   WHERE b.group_id=$1
				   AND b.approval_status='APPROVED'`,
			values: [group_id]
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

module.exports = {
	count_bill,
	create_bill,
	get_bill_creation_detail,
	update_bill_creation_approval,
	get_group_bill_list,
	get_payable_group_bill_list,
	get_bill_creation_list,
	count_bill_payment,
	create_bill_payment,
	get_bill_payment_detail,
	update_bill_payment_approval,
	get_bill_payment_list,
	get_group_bill_payment_list
};